import { useState, useEffect, useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import './MyOrders.css';

const MyOrders = () => {
  const { url, token, logout } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

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
                <span className={`order-status ${getStatusClass(order.status)}`}>
                  {translateStatus(order.status)}
                </span>

                <span className="order-amount">{formatCurrency(order.amount)}</span>

                <span className={`payment-status ${order.payment ? 'paid' : 'unpaid'}`}>
                  {order.payment ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </span>
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
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
