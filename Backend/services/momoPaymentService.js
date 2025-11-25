import crypto from 'crypto';
import axios from 'axios';

class MomoPaymentService {
  constructor() {
    this.partnerCode = process.env.MOMO_PARTNER_CODE;
    this.accessKey = process.env.MOMO_ACCESS_KEY;
    this.secretKey = process.env.MOMO_SECRET_KEY;
    this.endpoint = process.env.MOMO_API_ENDPOINT || process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create';
  // Default endpoints should point to backend handlers so MoMo redirects/webhooks arrive
  const backendBase = process.env.BACKEND_URL || 'http://localhost:4000';
  this.returnUrl = process.env.MOMO_RETURN_URL || `${backendBase}/api/order/momo/return`;
  // Order webhook route is defined in Backend/routes/orderRoute.js as POST /momo/webhook
  this.notifyUrl = process.env.MOMO_NOTIFY_URL || `${backendBase}/api/order/momo/webhook`;
  // Sử dụng 'captureWallet' để tạo payUrl cho thanh toán ví MoMo (thích hợp cho flow quét QR / mở app MoMo).
  // 'payWithATM' sẽ dẫn tới flow nhập thẻ/ATM trên web, nên nếu bạn thấy trang thanh toán bằng thẻ,
  // hãy đổi sang 'captureWallet' và trên frontend render QR từ payUrl trả về.
  this.requestType = 'captureWallet';
  }

  // Tạo chữ ký HMAC SHA256
  createSignature(rawSignature) {
    return crypto.createHmac('sha256', this.secretKey).update(rawSignature).digest('hex');
  }

  // Tạo request ID duy nhất
  generateRequestId() {
    return Date.now().toString();
  }

  // Tạo order ID duy nhất
  generateOrderId(orderId) {
    return `MOMO_${orderId}_${Date.now()}`;
  }

  // Tạo URL thanh toán Momo
  async createPaymentUrl(orderData) {
    // Validate environment variables
    if (!this.partnerCode || !this.accessKey || !this.secretKey) {
      return {
        success: false,
        message: 'MoMo configuration is incomplete. Please check environment variables.'
      };
    }
    
    const {
      orderId,
      amount,
      orderInfo,
      items
    } = orderData;

    const requestId = this.generateRequestId();
    const momoOrderId = this.generateOrderId(orderId);
    
    // Thông tin đơn hàng
    const orderInfoText = orderInfo || `Thanh toán đơn hàng #${orderId}`;
    
    // Dữ liệu gửi lên Momo
    const requestBody = {
      partnerCode: this.partnerCode,
      partnerName: process.env.MOMO_PARTNER_NAME || "Cake Shop",
      storeId: process.env.MOMO_STORE_ID || "CakeShopStore",
      requestId: requestId,
      amount: Math.round(amount), // Momo yêu cầu số nguyên
      orderId: momoOrderId,
      orderInfo: orderInfoText,
      redirectUrl: this.returnUrl,
      ipnUrl: this.notifyUrl,
      lang: "vi",
      requestType: this.requestType,
      autoCapture: true,
      extraData: JSON.stringify({
        orderId: orderId,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      })
    };

    // Tạo chữ ký
    const rawSignature = `accessKey=${this.accessKey}&amount=${requestBody.amount}&extraData=${requestBody.extraData}&ipnUrl=${requestBody.ipnUrl}&orderId=${requestBody.orderId}&orderInfo=${requestBody.orderInfo}&partnerCode=${this.partnerCode}&redirectUrl=${requestBody.redirectUrl}&requestId=${requestBody.requestId}&requestType=${requestBody.requestType}`;
    requestBody.signature = this.createSignature(rawSignature);

    try {
      // Creating Momo payment request

      const response = await axios.post(this.endpoint, requestBody, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

  // (no debug logs)

      if (response.data.resultCode === 0) {
        return {
          success: true,
          url: response.data.payUrl,
          momoOrderId: momoOrderId,
          requestId: requestId
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Không thể tạo link thanh toán Momo'
        };
      }
    } catch (error) {
      console.error('Momo payment service error:', error);
      return {
        success: false,
        message: 'Lỗi kết nối với Momo Payment Gateway'
      };
    }
  }

  // Xác minh callback từ Momo
  verifyCallback(callbackData) {
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature
    } = callbackData;

    // Tạo chữ ký để so sánh
    const rawSignature = `accessKey=${this.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
    const expectedSignature = this.createSignature(rawSignature);

    // So sánh chữ ký
    if (signature !== expectedSignature) {
      console.error('Invalid Momo signature');
      return {
        valid: false,
        message: 'Chữ ký không hợp lệ'
      };
    }

    return {
      valid: true,
      success: resultCode === 0,
      orderId: orderId,
      transId: transId,
      amount: amount,
      message: message,
      extraData: extraData ? JSON.parse(extraData) : null
    };
  }

  // Kiểm tra trạng thái giao dịch
  async checkTransactionStatus(requestId, orderId) {
    const requestBody = {
      partnerCode: this.partnerCode,
      requestId: requestId,
      orderId: orderId,
      requestType: 'transactionStatus'
    };

    const rawSignature = `accessKey=${this.accessKey}&orderId=${orderId}&partnerCode=${this.partnerCode}&requestId=${requestId}&requestType=transactionStatus`;
    requestBody.signature = this.createSignature(rawSignature);

    try {
      const queryUrl = process.env.MOMO_QUERY_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/query';
      const response = await axios.post(queryUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return {
        success: response.data.resultCode === 0,
        status: response.data.resultCode,
        message: response.data.message,
        transId: response.data.transId,
        amount: response.data.amount
      };
    } catch (error) {
      console.error('Momo query error:', error);
      return {
        success: false,
        message: 'Không thể kiểm tra trạng thái giao dịch'
      };
    }
  }
}

export default new MomoPaymentService();
