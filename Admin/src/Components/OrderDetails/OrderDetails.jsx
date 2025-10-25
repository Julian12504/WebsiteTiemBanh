import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AdminAuthContext } from '../../context/AdminAuthContext';
import BillGenerator from '../BillGenerator/BillGenerator';
import './OrderDetails.css';

const OrderDetails = ({ url }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useContext(AdminAuthContext);

  // Lấy query ?bill=true để mở trực tiếp hóa đơn
  const queryParams = new URLSearchParams(location.search);
  const showBillParam = queryParams.get('bill') === 'true';
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showBillGenerator, setShowBillGenerator] = useState(showBillParam);
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${url}/api/order/admin/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setOrder(response.data.data);
        } else {
          setError("Không thể tải chi tiết đơn hàng");
          toast.error(response.data.message || "Không thể tải chi tiết đơn hàng");
        }
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("Lỗi kết nối máy chủ");
        toast.error(err.response?.data?.message || "Không thể tải chi tiết đơn hàng");
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [id, token, url]);
  
  // Cập nhật trạng thái đơn hàng
  const updateOrderStatus = async (status) => {
    try {
      setUpdatingStatus(true);
      const response = await axios.post(
        `${url}/api/order/update-status`,
        { orderId: id, status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.data.success) {
        setOrder(prev => ({ ...prev, status }));
        toast.success(`Trạng thái đơn hàng đã được cập nhật: ${status}`);
      } else {
        toast.error(response.data.message || "Không thể cập nhật trạng thái");
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      toast.error(err.response?.data?.message || "Lỗi khi cập nhật trạng thái");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Cập nhật trạng thái thanh toán
  const updatePaymentStatus = async (paymentStatus) => {
    try {
      setUpdatingStatus(true);
      const response = await axios.post(
        `${url}/api/order/update-payment`,
        { orderId: id, payment: paymentStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.data.success) {
        setOrder(prev => ({ ...prev, payment: paymentStatus }));
        toast.success(`Trạng thái thanh toán: ${paymentStatus ? 'Đã thanh toán' : 'Chưa thanh toán'}`);
      } else {
        toast.error(response.data.message || "Không thể cập nhật trạng thái thanh toán");
      }
    } catch (err) {
      console.error("Error updating payment status:", err);
      toast.error(err.response?.data?.message || "Lỗi khi cập nhật trạng thái thanh toán");
    } finally {
      setUpdatingStatus(false);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const getStatusClass = (status) => {
    const statusLower = status.toLowerCase().replace(/\s+/g, '-');
    switch (statusLower) {
      case 'item-processing': return 'status-processing';
      case 'out-for-delivery': return 'status-delivering';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };
  
  if (loading) {
    return (
      <div className="order-details-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải chi tiết đơn hàng...</p>
      </div>
    );
  }
  
  if (error || !order) {
    return (
      <div className="order-details-error">
        <h3>Lỗi tải dữ liệu</h3>
        <p>{error || "Không tìm thấy đơn hàng"}</p>
        <button onClick={() => navigate('/orders')}>Quay lại danh sách đơn</button>
      </div>
    );
  }
  
  return (
    <div className="order-details-container">
      {showBillGenerator ? (
        <BillGenerator 
          orderData={order} 
          onClose={() => setShowBillGenerator(false)} 
        />
      ) : (
        <>
          <div className="order-details-header">
            <div className="order-details-title">
              <h2>Đơn hàng #{order.id}</h2>
              <span className={`order-status ${getStatusClass(order.status)}`}>
                {order.status}
              </span>
            </div>
            
            <div className="order-actions">
              <button 
                className="generate-bill-btn"
                onClick={() => setShowBillGenerator(true)}
              >
                Tạo hóa đơn
              </button>
              <button 
                className="back-btn"
                onClick={() => navigate('/orders')}
              >
                Quay lại
              </button>
            </div>
          </div>
          
          <div className="order-details-content">
            <div className="order-overview">
              {/* Thông tin đơn hàng */}
              <div className="order-info-card">
                <h3>Thông tin đơn hàng</h3>
                <div className="info-row">
                  <span className="info-label">Ngày đặt hàng:</span>
                  <span className="info-value">{formatDate(order.created_at)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Trạng thái thanh toán:</span>
                  <span className={`info-value ${order.payment ? 'paid' : 'unpaid'}`}>
                    {order.payment ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Tổng tiền:</span>
                  <span className="info-value">VNĐ {parseFloat(order.amount).toFixed(2)}</span>
                </div>
                
                <div className="status-updates">
                  <div className="status-update-section">
                    <h4>Cập nhật trạng thái đơn hàng</h4>
                    {order.status === 'Cancelled' ? (
                      <div className="cancelled-notice">
                        ⚠️ Đơn hàng đã bị hủy. Không thể cập nhật trạng thái.
                      </div>
                    ) : order.status === 'Delivered' ? (
                      <div className="delivered-notice">
                        ✓ Đơn hàng đã giao thành công. Không thể thay đổi trạng thái.
                      </div>
                    ) : (
                      <div className="status-buttons">
                        <button 
                          className={`status-btn ${order.status === 'Item Processing' ? 'active' : ''}`}
                          onClick={() => updateOrderStatus('Item Processing')}
                          disabled={updatingStatus || order.status === 'Item Processing'}
                        >
                          Đang xử lý
                        </button>
                        <button 
                          className={`status-btn ${order.status === 'Out for Delivery' ? 'active' : ''}`}
                          onClick={() => updateOrderStatus('Out for Delivery')}
                          disabled={updatingStatus || order.status === 'Out for Delivery'}
                        >
                          Đang giao hàng
                        </button>
                        <button 
                          className={`status-btn ${order.status === 'Delivered' ? 'active' : ''}`}
                          onClick={() => updateOrderStatus('Delivered')}
                          disabled={updatingStatus || order.status === 'Delivered'}
                        >
                          Đã giao
                        </button>
                        <button 
                          className={`status-btn cancel-btn ${order.status === 'Cancelled' ? 'active' : ''}`}
                          onClick={() => updateOrderStatus('Cancelled')}
                          disabled={updatingStatus || order.status === 'Cancelled'}
                        >
                          Đã hủy
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="payment-update-section">
                    <h4>Cập nhật thanh toán</h4>
                    <div className="payment-buttons">
                      <button 
                        className={`payment-btn ${order.payment ? 'active' : ''}`}
                        onClick={() => updatePaymentStatus(true)}
                        disabled={updatingStatus || order.payment}
                      >
                        Đánh dấu đã thanh toán
                      </button>
                      <button 
                        className={`payment-btn ${!order.payment ? 'active' : ''}`}
                        onClick={() => updatePaymentStatus(false)}
                        disabled={updatingStatus || !order.payment}
                      >
                        Đánh dấu chưa thanh toán
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Thông tin khách hàng */}
              <div className="customer-info-card">
                <h3>Thông tin khách hàng</h3>
                <div className="info-row">
                  <span className="info-label">Họ tên:</span>
                  <span className="info-value">{order.first_name} {order.last_name}</span>
                </div>
                {order.contact_number1 && (
                  <div className="info-row">
                    <span className="info-label">Số điện thoại:</span>
                    <span className="info-value">{order.contact_number1}</span>
                  </div>
                )}
                {order.email && (
                  <div className="info-row">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{order.email}</span>
                  </div>
                )}
                {order.address && (
                  <div className="info-row">
                    <span className="info-label">Địa chỉ:</span>
                    <span className="info-value">{order.address}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Danh sách sản phẩm */}
            <div className="order-items-section">
              <h3>Sản phẩm trong đơn</h3>
              <div className="order-items-table-container">
                <table className="order-items-table">
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>Số lượng</th>
                      <th>Đơn giá (VNĐ)</th>
                      <th>Thành tiền (VNĐ)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items && order.items.map((item, index) => (
                      <tr key={index}>
                        <td className="item-name-cell">
                          {item.image && <img src={item.image} alt={item.name} className="item-thumbnail" />}
                          <span>{item.name}</span>
                        </td>
                        <td>{item.quantity} {item.unit}</td>
                        <td>VNĐ {parseFloat(item.price).toFixed(2)}</td>
                        <td>VNĐ {(parseFloat(item.price) * parseFloat(item.quantity)).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="total-label">Tạm tính:</td>
                      <td className="total-value">VNĐ {parseFloat(order.amount).toFixed(2)}</td>
                    </tr>
                    {order.delivery_fee && (
                      <tr>
                        <td colSpan="3" className="total-label">Phí giao hàng:</td>
                        <td className="total-value">VNĐ {parseFloat(order.delivery_fee).toFixed(2)}</td>
                      </tr>
                    )}
                    <tr className="order-total">
                      <td colSpan="3" className="total-label">Tổng cộng:</td>
                      <td className="total-value">
                        VNĐ {(parseFloat(order.amount) + (parseFloat(order.delivery_fee) || 0)).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            
            {/* Ghi chú */}
            {order.notes && (
              <div className="order-notes-section">
                <h3>Ghi chú</h3>
                <div className="order-notes">{order.notes}</div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default OrderDetails;
