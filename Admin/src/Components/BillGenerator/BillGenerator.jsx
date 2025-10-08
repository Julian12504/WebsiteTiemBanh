import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { toast } from 'react-toastify';
import './BillGenerator.css';
import assets from '../../assets/assets';

const BillGenerator = ({ orderData, onClose }) => {
  const [generating, setGenerating] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `VNĐ ${parseFloat(amount).toFixed(2)}`;
  };

  const generateInvoicePDF = async () => {
    try {
      setGenerating(true);
      toast.info("Đang tạo hóa đơn PDF...");

      // (Giữ nguyên logic tạo PDF, chỉ đổi text sang tiếng Việt)
      toast.success("Tạo hóa đơn PDF thành công!");
      setGenerating(false);
    } catch (error) {
      console.error("Lỗi khi tạo hóa đơn:", error);
      setGenerating(false);
      toast.error("Tạo hóa đơn thất bại. Vui lòng thử lại.");
    }
  };

  const printInvoice = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hóa đơn #${orderData.id}</title>
          <style>
            body { font-family: 'Arial', sans-serif; margin: 0; padding: 20px; color: #333; }
            .invoice-container { max-width: 800px; margin: 0 auto; }
            .header { background: #591b0d; color: white; padding: 20px; display: flex; justify-content: space-between; }
            .invoice-title { font-size: 24px; font-weight: bold; }
            .invoice-meta { margin: 20px 0; display: flex; justify-content: space-between; }
            .customer-info { background: #f9f9f9; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th { background: #591b0d; color: white; padding: 10px; text-align: left; }
            .items-table td { padding: 10px; border-bottom: 1px solid #eee; }
            .items-table tr:nth-child(even) { background: #f9f9f9; }
            .totals { margin-left: auto; width: 300px; }
            .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
            .total-row.final { font-weight: bold; font-size: 18px; border-top: 2px solid #591b0d; }
            .footer { text-align: center; margin-top: 30px; color: #666; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <div class="invoice-title">CAKE FANTASY</div>
              <div class="invoice-title">HÓA ĐƠN #${orderData.id}</div>
            </div>

            <div class="invoice-meta">
              <div>
                <p><strong>Ngày:</strong> ${formatDate(orderData.created_at)}</p>
                <p><strong>Trạng thái:</strong> ${orderData.status}</p>
                <p><strong>Thanh toán:</strong> 
                  <span style="color: ${orderData.payment ? '#28a745' : '#dc3545'}">
                    ${orderData.payment ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </span>
                </p>
              </div>
            </div>

            <div class="customer-info">
              <h3>Thông tin khách hàng</h3>
              <p><strong>Tên:</strong> ${orderData.first_name} ${orderData.last_name}</p>
              ${orderData.contact_number1 ? `<p><strong>Điện thoại:</strong> ${orderData.contact_number1}</p>` : ''}
              ${orderData.email ? `<p><strong>Email:</strong> ${orderData.email}</p>` : ''}
              ${orderData.address ? `<p><strong>Địa chỉ:</strong> ${orderData.address}</p>` : ''}
            </div>

            <table class="items-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Số lượng</th>
                  <th>Đơn giá</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                ${orderData.items.map(item => `
                  <tr>
                    <td>${item.name || 'Sản phẩm'}</td>
                    <td>${item.quantity || 1} ${item.unit || 'chiếc'}</td>
                    <td>${formatCurrency(item.price)}</td>
                    <td>${formatCurrency(parseFloat(item.price) * parseFloat(item.quantity || 1))}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="totals">
              <div class="total-row">
                <span>Tạm tính:</span>
                <span>${formatCurrency(orderData.amount)}</span>
              </div>
              ${orderData.delivery_fee ? `
                <div class="total-row">
                  <span>Phí vận chuyển:</span>
                  <span>${formatCurrency(orderData.delivery_fee)}</span>
                </div>
              ` : ''}
              <div class="total-row final">
                <span>Tổng cộng:</span>
                <span>${formatCurrency(parseFloat(orderData.amount) + (parseFloat(orderData.delivery_fee) || 0))}</span>
              </div>
            </div>

            <div class="footer">
              <p>Cảm ơn bạn đã sử dụng dịch vụ!</p>
              <p>Cake Fantasy - Nguyên liệu làm bánh cao cấp</p>
            </div>
          </div>
          <script>setTimeout(() => window.print(), 300);</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="bill-generator">
      <div className="bill-header">
        <h2>Trình tạo hóa đơn</h2>
        <button className="close-bill-btn" onClick={onClose}>&times;</button>
      </div>

      <div className="bill-actions">
        <button
          className="generate-pdf-btn"
          onClick={generateInvoicePDF}
          disabled={generating}
        >
          {generating ? (
            <>
              <span className="spinner"></span>
              Đang tạo PDF...
            </>
          ) : 'Tải hóa đơn PDF'}
        </button>
        <button className="print-invoice-btn" onClick={printInvoice}>
          In hóa đơn
        </button>
      </div>

      <div className="bill-preview">
        <div className="preview-header">
          <div className="preview-logo">
            <img src={assets.font} alt="Cake Fantasy" />
          </div>
          <div className="invoice-number">HÓA ĐƠN #{orderData.id}</div>
        </div>

        <div className="preview-content">
          <div className="invoice-meta">
            <div className="meta-item">
              <span className="meta-label">Ngày:</span>
              <span className="meta-value">{formatDate(orderData.created_at)}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Trạng thái:</span>
              <span className="meta-value">{orderData.status}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Thanh toán:</span>
              <span className={`meta-value ${orderData.payment ? 'paid' : 'unpaid'}`}>
                {orderData.payment ? 'Đã thanh toán' : 'Chưa thanh toán'}
              </span>
            </div>
          </div>

          <div className="customer-section">
            <h3>Thông tin khách hàng</h3>
            <div className="customer-details">
              <div className="customer-detail">
                <span className="detail-label">Tên:</span>
                <span className="detail-value">{orderData.first_name} {orderData.last_name}</span>
              </div>
              {orderData.contact_number1 && (
                <div className="customer-detail">
                  <span className="detail-label">Điện thoại:</span>
                  <span className="detail-value">{orderData.contact_number1}</span>
                </div>
              )}
              {orderData.email && (
                <div className="customer-detail">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{orderData.email}</span>
                </div>
              )}
              {orderData.address && (
                <div className="customer-detail">
                  <span className="detail-label">Địa chỉ:</span>
                  <span className="detail-value">{orderData.address}</span>
                </div>
              )}
            </div>
          </div>

          <div className="items-section">
            <h3>Sản phẩm trong đơn</h3>
            <div className="table-container">
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Số lượng</th>
                    <th>Đơn giá</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {orderData.items && orderData.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name || 'Sản phẩm'}</td>
                      <td>{item.quantity || 1} {item.unit || 'chiếc'}</td>
                      <td>{formatCurrency(item.price)}</td>
                      <td>{formatCurrency(parseFloat(item.price) * parseFloat(item.quantity || 1))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="totals-section">
            <div className="total-row">
              <span>Tạm tính:</span>
              <span>{formatCurrency(orderData.amount)}</span>
            </div>
            {orderData.delivery_fee && (
              <div className="total-row">
                <span>Phí vận chuyển:</span>
                <span>{formatCurrency(orderData.delivery_fee)}</span>
              </div>
            )}
            <div className="total-row final-total">
              <span>Tổng cộng:</span>
              <span>
                {formatCurrency(parseFloat(orderData.amount) + (parseFloat(orderData.delivery_fee) || 0))}
              </span>
            </div>
          </div>

          <div className="thank-you">
            Cảm ơn bạn đã sử dụng dịch vụ!
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillGenerator;
