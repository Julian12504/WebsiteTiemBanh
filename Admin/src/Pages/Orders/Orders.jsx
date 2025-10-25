import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Orders.css";
import { toast } from "react-toastify";
import axios from "axios";
import { AdminAuthContext } from "../../context/AdminAuthContext";
import assets from "../../assets/assets";

const Orders = ({ url }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const { token } = useContext(AdminAuthContext);
  const [filters, setFilters] = useState({
    status: "",
    payment: "",
    page: 1,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.payment !== "")
        queryParams.append("payment", filters.payment);
      queryParams.append("page", filters.page);
      queryParams.append("limit", 10);

      const response = await axios.get(
        `${url}/api/order/admin/list?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setOrders(response.data.data);
        setPagination(response.data.pagination);
      } else {
        toast.error("Không tải được đơn hàng");
      }
    } catch (err) {
      console.error("Lỗi khi tải đơn hàng:", err);
      toast.error(err.response?.data?.message || "Lỗi khi tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await axios.post(
        `${url}/api/order/update-status`,
        { orderId, status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success(
          `Đơn hàng #${orderId} đã được cập nhật trạng thái thành ${status}`
        );
        fetchOrders();
      } else {
        toast.error(response.data.message || "Cập nhật trạng thái thất bại");
      }
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái đơn hàng:", err);
      toast.error(
        err.response?.data?.message || "Lỗi cập nhật trạng thái đơn hàng"
      );
    }
  };

  const updatePaymentStatus = async (orderId, paymentStatus) => {
    try {
      const response = await axios.post(
        `${url}/api/order/update-payment`,
        { orderId, payment: paymentStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success(
          `Thanh toán cho đơn hàng #${orderId} được đánh dấu là ${
            paymentStatus ? "Đã thanh toán" : "Chưa thanh toán"
          }`
        );
        fetchOrders();
      } else {
        toast.error(
          response.data.message || "Cập nhật trạng thái thanh toán thất bại"
        );
      }
    } catch (err) {
      console.error("Lỗi cập nhật thanh toán:", err);
      toast.error(
        err.response?.data?.message || "Lỗi cập nhật trạng thái thanh toán"
      );
    }
  };

  const viewOrderDetails = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const generateBill = (orderId) => {
    navigate(`/orders/${orderId}?bill=true`);
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
      page: 1, // Quay về trang đầu khi thay đổi bộ lọc
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;

    setFilters({
      ...filters,
      page: newPage,
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusClass = (status) => {
    const statusLower = status.toLowerCase().replace(/\s+/g, "-");
    switch (statusLower) {
      case "item-processing":
        return "status-processing";
      case "out-for-delivery":
        return "status-delivering";
      case "delivered":
        return "status-delivered";
      case "cancelled":
        return "status-cancelled";
      default:
        return "";
    }
  };

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

  const toggleOrderDetails = (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }
  };

  return (
    <div className="orders-container">
      <div className="orders add flex-col">
        <div className="orders-filters">
          <div className="orders-header">
            <h2 className="orders-title">Quản lý đơn hàng</h2>
          </div>
          <div className="filter-group flex-col">
            <p>Trạng thái đơn hàng</p>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Item Processing">Đang xử lý</option>
              <option value="Out for Delivery">Đang giao hàng</option>
              <option value="Delivered">Đã giao</option>
              <option value="Cancelled">Đã hủy</option>
            </select>
          </div>

          <div className="filter-group flex-col">
            <p>Trạng thái thanh toán</p>
            <select
              name="payment"
              value={filters.payment}
              onChange={handleFilterChange}
            >
              <option value="">Tất cả</option>
              <option value="true">Đã thanh toán</option>
              <option value="false">Chưa thanh toán</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải đơn hàng...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="no-orders">
            <p>Không tìm thấy đơn hàng</p>
          </div>
        ) : (
          <>
            <div className="list-table">
              <div className="list-table-format title">
                <b>Mã đơn</b>
                <b>Khách hàng</b>
                <b>Ngày đặt</b>
                <b>Số sản phẩm</b>
                <b>Tổng tiền</b>
                <b>Trạng thái</b>
                <b>Thanh toán</b>
                <b>Thao tác</b>
              </div>

              {orders.map((order) => (
                <div key={order.id} className="order-container">
                  <div className="list-table-format">
                    <p>#{order.id}</p>
                    <p>
                      {order.first_name} {order.last_name}
                    </p>
                    <p>{formatDate(order.created_at)}</p>
                    <p>{order.total_items || 0} sản phẩm</p>
                    <p>
                      VNĐ{" "}
                      {parseFloat(order.amount).toLocaleString("vi-VN", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <p className={`status ${getStatusClass(order.status)}`}>
                      {translateStatus(order.status)}
                    </p>
                    <p
                      className={`payment ${order.payment ? "paid" : "unpaid"}`}
                    >
                      {order.payment ? "Đã thanh toán" : "Chưa thanh toán"}
                    </p>
                    <div className="action-buttons">
                      <button
                        className="view-btn"
                        onClick={() => toggleOrderDetails(order.id)}
                        title="Xem chi tiết đơn hàng"
                      >
                        {expandedOrderId === order.id ? "Ẩn" : "Xem"}
                      </button>
                      <button
                        className="bill-btn"
                        onClick={() => generateBill(order.id)}
                        title="Tạo hóa đơn"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M4 7.2V16.8C4 17.9201 4 18.4802 4.21799 18.908C4.40973 19.2843 4.71569 19.5903 5.09202 19.782C5.51984 20 6.0799 20 7.2 20H16.8C17.9201 20 18.4802 20 18.908 19.782C19.2843 19.5903 19.5903 19.2843 19.782 18.908C20 18.4802 20 17.9201 20 16.8V7.2C20 6.0799 20 5.51984 19.782 5.09202C19.5903 4.71569 19.2843 4.40973 18.908 4.21799C18.4802 4 17.9201 4 16.8 4H7.2C6.0799 4 5.51984 4 5.09202 4.21799C4.71569 4.40973 4.40973 4.71569 4.21799 5.09202C4 5.51984 4 6.0799 4 7.2Z"
                            stroke="#591b0d"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M8 10H16"
                            stroke="#591b0d"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M8 14H13"
                            stroke="#591b0d"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {expandedOrderId === order.id && (
                    <div className="order-details">
                      <div className="details-section">
                        <h3>Thông tin khách hàng</h3>
                        <p>
                          <strong>Tên:</strong> {order.first_name}{" "}
                          {order.last_name}
                        </p>
                        <p>
                          <strong>Điện thoại:</strong> {order.contact_number1}
                        </p>
                        {order.email && (
                          <p>
                            <strong>Email:</strong> {order.email}
                          </p>
                        )}
                        {order.address && (
                          <p>
                            <strong>Địa chỉ:</strong> {order.address}
                          </p>
                        )}
                      </div>

                      <div className="details-section">
                        <h3>Thao tác đơn hàng</h3>
                        {order.status === 'Cancelled' ? (
                          <div className="status-update">
                            <p>
                              <strong>Trạng thái:</strong>
                            </p>
                            <p className="cancelled-notice">
                              ⚠️ Đơn hàng đã bị hủy. Không thể cập nhật trạng thái.
                            </p>
                          </div>
                        ) : order.status === 'Delivered' ? (
                          <div className="status-update">
                            <p>
                              <strong>Trạng thái:</strong>
                            </p>
                            <p className="delivered-notice">
                              ✓ Đơn hàng đã giao thành công. Không thể thay đổi trạng thái.
                            </p>
                          </div>
                        ) : (
                          <div className="status-update">
                            <p>
                              <strong>Cập nhật trạng thái:</strong>
                            </p>
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  updateOrderStatus(order.id, e.target.value);
                                  e.target.value = "";
                                }
                              }}
                              defaultValue=""
                            >
                              <option value="" disabled>
                                Thay đổi trạng thái
                              </option>
                              <option value="Item Processing">Đang xử lý</option>
                              <option value="Out for Delivery">
                                Đang giao hàng
                              </option>
                              <option value="Delivered">Đã giao</option>
                              <option value="Cancelled">Đã hủy</option>
                            </select>
                          </div>
                        )}

                        <div className="payment-update">
                          <p>
                            <strong>Cập nhật thanh toán:</strong>
                          </p>
                          <div className="payment-buttons">
                            <button
                              className={`payment-btn ${
                                order.payment ? "active" : ""
                              }`}
                              onClick={() =>
                                updatePaymentStatus(order.id, true)
                              }
                              disabled={order.payment}
                            >
                              Đánh dấu đã thanh toán
                            </button>
                            <button
                              className={`payment-btn ${
                                !order.payment ? "active" : ""
                              }`}
                              onClick={() =>
                                updatePaymentStatus(order.id, false)
                              }
                              disabled={!order.payment}
                            >
                              Đánh dấu chưa thanh toán
                            </button>
                          </div>
                        </div>

                        <div className="expanded-actions">
                          <button
                            className="details-btn"
                            onClick={() => viewOrderDetails(order.id)}
                          >
                            Xem chi tiết đầy đủ
                          </button>
                          <button
                            className="bill-gen-btn"
                            onClick={() => generateBill(order.id)}
                          >
                            Tạo hóa đơn
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pagination">
              <button
                onClick={() => handlePageChange(1)}
                disabled={pagination.page === 1}
                className="pagination-btn"
              >
                Đầu
              </button>
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="pagination-btn"
              >
                Trước
              </button>
              <span className="page-info">
                Trang {pagination.page} trên {pagination.totalPages || 1}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="pagination-btn"
              >
                Tiếp
              </button>
              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={pagination.page === pagination.totalPages}
                className="pagination-btn"
              >
                Cuối
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Orders;
