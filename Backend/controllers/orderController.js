import { Order } from "../models/orderModel.js";
import Stripe from "stripe";
import momoPaymentService from "../services/momoPaymentService.js";
import mockPaymentService from "../services/mockPaymentService.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const placeOrder = async (req, res) => {
  const frontend_url = "http://localhost:5173";
  
  try {
    // Destructure all required fields from request body
    const { 
      userId,
      items,
      amount,
      address,
      firstName,
      lastName,
      contactNumber1,
      contactNumber2 = "", 
      specialInstructions = "",
      paymentMethod = "stripe" // Default to stripe, can be "stripe" or "momo"
    } = req.body;    // Validate required fields
    if (!firstName || !lastName || !contactNumber1 || !address) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin giao hàng bắt buộc"
      });
    }

    // Validate items array
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Đơn hàng không có sản phẩm nào"
      });
    }
      
    // Validate amount is provided and is a number
    if (amount === undefined || amount === null || isNaN(parseFloat(amount))) {
      // Calculate the amount from items if not provided or invalid
      const calculatedAmount = items.reduce((total, item) => {
        const itemPrice = parseFloat(item.price || 0);
        const quantity = parseFloat(item.quantity || 0);
        return total + (itemPrice * quantity);
      }, 0) + 150; // Add delivery fee
      
      if (calculatedAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Tổng tiền đơn hàng là bắt buộc và phải là số hợp lệ"
        });
      }
      
      console.log(`Calculated amount: ${calculatedAmount} (original was invalid: ${amount})`);
      amount = calculatedAmount;
    }

    // Creating order with data

    // 1. Create order in database
    const orderId = await Order.create(
      userId || req.user.id, // Use authenticated user id if userId not provided
      items, 
      amount, 
      address, 
      firstName, 
      lastName, 
      contactNumber1, 
      contactNumber2, 
      specialInstructions
    );
    
    // Order created successfully, now clearing cart
    
    // 2. Clear user's cart using Order model
    await Order.clearCart(userId || req.user.id);
    
    // 3. Create payment session based on payment method
    if (paymentMethod === "momo") {
      // Create Momo payment URL
      const orderInfo = `Thanh toán đơn hàng #${orderId} - ${firstName} ${lastName}`;
      const momoResult = await momoPaymentService.createPaymentUrl({
        orderId,
        amount,
        orderInfo,
        items
      });

      if (momoResult.success) {
        res.json({
          success: true,
          url: momoResult.url,
          orderId,
          paymentMethod: "momo",
          momoOrderId: momoResult.momoOrderId
        });
      } else {
        // Order was created but payment failed
        await Order.updatePaymentStatus(orderId, false);
        res.status(500).json({
          success: false,
          message: momoResult.message || "Không thể tạo link thanh toán Momo",
          orderId
        });
      }
      return;
    }
    
    // Mock payment for testing (stripe method)
    if (paymentMethod === "stripe") {
      const mockResult = await mockPaymentService.createPaymentSession({
        orderId,
        amount,
        orderInfo: `Thanh toán đơn hàng #${orderId} - ${firstName} ${lastName}`,
        items
      });

      if (mockResult.success) {
        // Simulate successful payment immediately
        console.log(`🎭 Mock payment successful - calling updatePaymentStatus with orderId=${orderId}, status=true`);
        await Order.updatePaymentStatus(orderId, true);
        
        res.json({
          success: true,
          url: `${frontend_url}/verify?success=true&orderId=${orderId}&paymentMethod=stripe&mock=true`,
          orderId,
          paymentMethod: "stripe",
          mock: true
        });
      } else {
        console.log(`🎭 Mock payment failed - calling updatePaymentStatus with orderId=${orderId}, status=false`);
        await Order.updatePaymentStatus(orderId, false);
        res.status(500).json({
          success: false,
          message: "Mock payment failed",
          orderId
        });
      }
      return;
    }
    
    // Default: Create real Stripe session (if needed)
    console.log(`💳 Creating Stripe session for order ${orderId} with ${items.length} items`);
    console.log(`📋 Items data:`, items.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity })));
    
    const line_items = items.map(item => {
      // Ensure price is valid
      const price = parseFloat(item.price);
      if (isNaN(price) || price <= 0) {
        console.error(`❌ Invalid price for item ${item.id}: ${item.price}`);
        return null;
      }
      
      // Ensure quantity is valid
      const quantity = parseInt(item.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        console.error(`❌ Invalid quantity for item ${item.id}: ${item.quantity}`);
        return null;
      }
      
      console.log(`✅ Valid item: ${item.name} - Price: ${price}, Quantity: ${quantity}`);
      
      return {
        price_data: {
          currency: "usd", // Changed from "lkr" to "usd"
          product_data: { 
            name: item.name || `Product ID: ${item.id}`,
            metadata: { item_id: item.id } 
          },
          unit_amount: Math.round(price * 100) // Convert to cents (USD)
        },
        quantity: quantity
      };
    }).filter(item => item !== null); // Remove invalid items
    
    // Add delivery fee
    line_items.push({
      price_data: {
        currency: "usd", // Changed from "lkr" to "usd"
        product_data: { name: "Delivery Charges" },
        unit_amount: Math.round(150 * 100) // 150 USD in cents
      },
      quantity: 1
    });
    
    console.log(`📦 Final line items count: ${line_items.length}`);
    console.log(`📦 Line items:`, line_items.map(item => ({ name: item.price_data.product_data.name, amount: item.price_data.unit_amount, quantity: item.quantity })));
    
    try {
      console.log(`🔄 Calling Stripe API to create checkout session...`);
      const session = await stripe.checkout.sessions.create({
        line_items,
        mode: "payment",
        success_url: `${frontend_url}/verify?success=true&orderId=${orderId}`,
        cancel_url: `${frontend_url}/verify?success=false&orderId=${orderId}`,
        metadata: { order_id: orderId }
      });
      
      console.log(`✅ Stripe session created successfully: ${session.id}`);
      console.log(`🔗 Stripe checkout URL: ${session.url}`);
      
      res.json({ 
        success: true, 
        url: session.url,
        orderId,
        paymentMethod: "stripe"
      });
    } catch (stripeError) {
      console.error("❌ Stripe session creation error:", stripeError);
      console.error("❌ Stripe error details:", {
        type: stripeError.type,
        code: stripeError.code,
        message: stripeError.message,
        statusCode: stripeError.statusCode
      });
      
      // Order was created but payment failed - update the order status
      await Order.updatePaymentStatus(orderId, false);
      
      res.status(500).json({
        success: false,
        message: "Error creating payment session",
        error: process.env.NODE_ENV === 'development' ? stripeError.message : undefined,
        orderId // Return the order ID even if payment fails
      });
    }
    
  } catch (error) {
    console.error("Order error:", error);
    console.error("Error stack:", error.stack);
    console.error("Request body:", req.body);
    console.error("User:", req.user);
    
    res.status(500).json({ 
      success: false, 
      message: "Error while placing order",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      debug: process.env.NODE_ENV === 'development' ? {
        errorType: error.constructor.name,
        errorMessage: error.message,
        hasUser: !!req.user,
        hasToken: !!req.headers.authorization
      } : undefined
    });
  }
};

const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  console.log(`🔍 verifyOrder called with: orderId=${orderId}, success=${success} (type: ${typeof success})`);
  console.log(`📋 Request body:`, req.body);
  
  try {
    if (success === "true") {
      console.log(`✅ Payment successful - calling updatePaymentStatus with orderId=${orderId}, status=true`);
      await Order.updatePaymentStatus(orderId, true);
      res.json({
        success: true,
        message: "Payment verified successfully"
      });
    } else {
      console.log(`❌ Payment failed - calling updatePaymentStatus with orderId=${orderId}, status=false`);
      await Order.updatePaymentStatus(orderId, false);
      res.json({
        success: false,
        message: "Payment verification failed"
      });
    }
  } catch (error) {
    console.error("🚨 Verify order error:", error);
    console.error("🚨 Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error verifying payment"
    });
  }
};

//User orders for the frontend
const userOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all orders for this user
    const orders = await Order.findByUserId(userId);
    
    // For each order, get detailed information including items
    const detailedOrders = await Promise.all(
      orders.map(async (order) => {
        const fullOrder = await Order.findById(order.id);
        return {
          id: fullOrder.id,
          amount: fullOrder.amount,
          address: fullOrder.address,
          status: fullOrder.status,
          payment: fullOrder.payment,
          firstName: fullOrder.first_name,
          lastName: fullOrder.last_name,
          contactNumber1: fullOrder.contact_number1,
          contactNumber2: fullOrder.contact_number2,
          specialInstructions: fullOrder.special_instructions,
          created_at: fullOrder.created_at,
          updated_at: fullOrder.updated_at,
          items: fullOrder.items || []
        };
      })
    );
    
    res.json({
      success: true,
      data: detailedOrders
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve orders"
    });
  }
};

//Listing orders for the Admin Panel
const listOrders = async (req, res) => {
  try {
    // Get query parameters for filtering
    const { status, payment, sort = 'created_at', order = 'desc', page = 1, limit = 20 } = req.query;
    
    // Admin fetching orders with filters
    
    // Get orders with optional filters
    const orders = await Order.listAll({
      status,
      payment: payment === 'true' ? true : payment === 'false' ? false : undefined,
      sort,
      order,
      page: parseInt(page),
      limit: parseInt(limit)
    });
    
    // Get total count for pagination
    const total = await Order.countAll({
      status,
      payment: payment === 'true' ? true : payment === 'false' ? false : undefined
    });
    
    // Found orders with pagination
    
    // Format response with pagination info
    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error listing orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve orders list"
    });
  }
};

// Momo payment webhook handler
const momoWebhook = async (req, res) => {
  try {
    // Momo webhook received
    
    const verification = momoPaymentService.verifyCallback(req.body);
    
    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        message: verification.message
      });
    }

    // Extract original order ID from extraData
    const originalOrderId = verification.extraData?.orderId;
    
    if (!originalOrderId) {
      console.error('No order ID found in Momo callback');
      return res.status(400).json({
        success: false,
        message: 'Order ID not found'
      });
    }

    if (verification.success) {
      // Payment successful
      console.log(`💰 MoMo webhook payment successful - calling updatePaymentStatus with orderId=${originalOrderId}, status=true`);
      await Order.updatePaymentStatus(originalOrderId, true);
      console.log(`Payment successful for order ${originalOrderId}`);
    } else {
      // Payment failed
      console.log(`❌ MoMo webhook payment failed - calling updatePaymentStatus with orderId=${originalOrderId}, status=false`);
      await Order.updatePaymentStatus(originalOrderId, false);
      console.log(`Payment failed for order ${originalOrderId}: ${verification.message}`);
    }

    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('Momo webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
};

// Momo payment return handler
const momoReturn = async (req, res) => {
  try {
    const { orderId, resultCode, message } = req.query;
    
    if (resultCode === '0') {
      // Payment successful
      console.log(`💰 MoMo return payment successful - calling updatePaymentStatus with orderId=${orderId}, status=true`);
      await Order.updatePaymentStatus(orderId, true);
      res.redirect(`http://localhost:5173/verify?success=true&orderId=${orderId}&paymentMethod=momo`);
    } else {
      // Payment failed
      console.log(`❌ MoMo return payment failed - calling updatePaymentStatus with orderId=${orderId}, status=false`);
      await Order.updatePaymentStatus(orderId, false);
      res.redirect(`http://localhost:5173/verify?success=false&orderId=${orderId}&paymentMethod=momo&message=${encodeURIComponent(message)}`);
    }
  } catch (error) {
    console.error('Momo return error:', error);
    res.redirect(`http://localhost:5173/verify?success=false&message=${encodeURIComponent('Lỗi xử lý thanh toán')}`);
  }
};

export { placeOrder, verifyOrder, userOrders, listOrders, momoWebhook, momoReturn };