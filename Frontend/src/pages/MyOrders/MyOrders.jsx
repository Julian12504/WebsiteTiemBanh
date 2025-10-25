import { useState, useEffect, useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import './MyOrders.css';

const MyOrders = () => {
  const { url, token, logout } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // 🔹 Định dạng tiền VNĐ
  const formatCurrency = (amount) => {
    if (isNaN(amount)) return '0 ₫';
    return amount.toLocaleString('vi-VN') + ' ₫';
  };

  // 🔹 Định dạng ngày giờ theo chuẩn Việt Nam
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    const fetchOrders = async () => {
      const authToken = token || localStorage.getItem("token");
      
      if (!authToken) {
        setLoading(false);
        setError("Vui lòng đăng nhập để xem đơn hàng của bạn");
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          `${url}/api/order/user/orders`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );

        console.log("Kết quả API đơn hàng:", response.data);

        if (response.data.success) {
          setOrders(response.data.data);
        } else {
          setError(response.data.message || "Không thể tải danh sách đơn hàng");
        }
      } catch (err) {
        console.error("Lỗi khi tải đơn hàng:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          logout();
        }
        setError(err.response?.data?.message || "Lỗi khi tải danh sách đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchOrders();
    }, 300);

    return () => clearTimeout(timer);
  }, [url, token, logout]);

  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  // Mở modal xác nhận
  const openConfirmModal = (orderId) => {
    setSelectedOrderId(orderId);
    setShowConfirmModal(true);
  };

  // Đóng modal
  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setSelectedOrderId(null);
  };

  // Xác nhận đã nhận hàng
  const confirmReceived = async () => {
    const authToken = token || localStorage.getItem("token");
    
    if (!authToken) {
      toast.error("Vui lòng đăng nhập");
      closeConfirmModal();
      return;
    }

    try {
      const response = await axios.post(
        `${url}/api/order/confirm-received`,
        { orderId: selectedOrderId },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.data.success) {
        toast.success("Đã xác nhận nhận hàng thành công!");
        // Update local state
        setOrders(orders.map(order => 
          order.id === selectedOrderId 
            ? { ...order, status: 'Delivered' }
            : order
        ));
      } else {
        toast.error(response.data.message || "Không thể xác nhận nhận hàng");
      }
    } catch (err) {
      console.error("Lỗi khi xác nhận nhận hàng:", err);
      toast.error(err.response?.data?.message || "Lỗi khi xác nhận nhận hàng");
    } finally {
      closeConfirmModal();
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Item Processing':
      case 'Đang xử lý':
        return 'status-processing';
      case 'Out for Delivery':
      case 'Đang giao hàng':
        return 'status-delivery';
      case 'Delivered':
      case 'Đã giao':
        return 'status-delivered';
      case 'Cancelled':
      case 'Đã hủy':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  // Dịch trạng thái đơn hàng sang tiếng Việt
  const translateStatus = (status) => {
    switch (status) {
      case 'Item Processing':
        return 'Đang xử lý';
      case 'Out for Delivery':
        return 'Đang giao hàng';
      case 'Delivered':
        return 'Đã giao';
      case 'Cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  // ⏳ Khi đang tải
  if (loading) {
    return <div className="my-orders-container loading">Đang tải đơn hàng của bạn...</div>;
  }

  // ⚠️ Khi có lỗi
  if (error) {
    return <div className="my-orders-container error-message">{error}</div>;
  }

  // 🛒 Khi không có đơn hàng nào
  if (orders.length === 0) {
    return (
      <div className="my-orders-container no-orders">
        <h2>Đơn hàng của bạn</h2>
        <p>Bạn chưa có đơn hàng nào.</p>
        <a href="/" className="shop-now-btn">Mua ngay</a>
      </div>
    );
  }

  // ✅ Hiển thị danh sách đơn hàng
  return (
    <>
      <div className="my-orders-container">
        <h2>Đơn hàng của bạn</h2>
        
        <div className="orders-list">
        {orders.map((order) => (
          <div className="order-card" key={order.id}>
            <div 
              className="order-header" 
              onClick={() => toggleOrderDetails(order.id)}
            >
              <div className="order-summary">
                <h3>Đơn hàng #{order.id}</h3>
                <p className="order-date">{formatDate(order.created_at)}</p>
              </div>
              
              <div className="order-meta">
                <div className="meta-item">
                  <span className="meta-label">Trạng thái đơn hàng:</span>
                  <span className={`order-status ${getStatusClass(order.status)}`}>
                    {translateStatus(order.status)}
                  </span>
                </div>

                <div className="meta-item">
                  <span className="meta-label">Trạng thái thanh toán:</span>
                  <span className={`payment-status ${order.payment ? 'paid' : 'unpaid'}`}>
                    {order.payment ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </span>
                </div>

                <div className="meta-item">
                  <span className="meta-label">Tổng tiền:</span>
                  <span className="order-amount">{formatCurrency(order.amount)}</span>
                </div>
              </div>
              
              <button className="toggle-details">
                {expandedOrderId === order.id ? 'Ẩn chi tiết' : 'Xem chi tiết'}
              </button>
            </div>
            
            {expandedOrderId === order.id && (
              <div className="order-details">
                <div className="delivery-info">
                  <h4>Thông tin giao hàng</h4>
                  <p><strong>Người nhận:</strong> {order.firstName} {order.lastName}</p>
                  <p><strong>Số điện thoại:</strong> {order.contactNumber1}</p>
                  {order.contactNumber2 && (
                    <p><strong>Liên hệ khác:</strong> {order.contactNumber2}</p>
                  )}
                  <p><strong>Địa chỉ:</strong> {order.address}</p>
                  {order.specialInstructions && (
                    <p><strong>Ghi chú:</strong> {order.specialInstructions}</p>
                  )}
                </div>
                
                <div className="items-list">
                  <h4>Sản phẩm đã đặt</h4>
                  <table>
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th>Đơn giá</th>
                        <th>Số lượng</th>
                        <th>Tổng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items && order.items.map((item) => (
                        <tr key={item.id}>
                          <td>{item.name}</td>
                          <td>{formatCurrency(item.price)}</td>
                          <td>{item.quantity}</td>
                          <td>{formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                      <tr className="delivery-fee">
                        <td colSpan="3">Phí giao hàng</td>
                        <td>{formatCurrency(15000)}</td>
                      </tr>
                      <tr className="order-total">
                        <td colSpan="3"><strong>Tổng cộng</strong></td>
                        <td><strong>{formatCurrency(order.amount)}</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Nút xác nhận đã nhận hàng */}
                {order.status === 'Out for Delivery' && (
                  <div className="order-actions">
                    <button 
                      className="confirm-received-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        openConfirmModal(order.id);
                      }}
                    >
                      ✓ Xác nhận đã nhận hàng
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>

    {/* Modal xác nhận */}
    {showConfirmModal && (
      <div className="confirm-modal-overlay" onClick={closeConfirmModal}>
        <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-icon">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#28a745" strokeWidth="2"/>
              <path d="M8 12l2 2 4-4" stroke="#28a745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3>Xác nhận đã nhận hàng</h3>
          <p>Bạn có chắc chắn đã nhận được hàng?</p>
          <p className="modal-note">Sau khi xác nhận, trạng thái đơn hàng sẽ chuyển thành "Đã giao"</p>
          <div className="modal-actions">
            <button className="modal-btn cancel-btn" onClick={closeConfirmModal}>
              Hủy
            </button>
            <button className="modal-btn confirm-btn" onClick={confirmReceived}>
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
};

export default MyOrders;
