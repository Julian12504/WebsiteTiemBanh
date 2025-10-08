import React from 'react';
import { Link } from 'react-router-dom';
import ReportDownloader from '../../Components/ReportDownloader/ReportDownloader';

const OrdersWidget = ({ orders = [] }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Item Processing':
      case 'Đang xử lý':
        return 'dashboard-status-processing';
      case 'Out for Delivery':
      case 'Đang giao hàng':
        return 'dashboard-status-delivery';
      case 'Delivered':
      case 'Đã giao':
        return 'dashboard-status-delivered';
      case 'Cancelled':
      case 'Đã hủy':
        return 'dashboard-status-cancelled';
      default:
        return '';
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

  const prepareOrdersReportData = () => {
    return orders.map(order => ({
      id: order.id,
      customer: `${order.first_name} ${order.last_name}`,
      date: formatDate(order.created_at),
      amount: parseFloat(order.amount).toFixed(2),
      status: translateStatus(order.status),
      payment: order.payment ? 'Đã thanh toán' : 'Chưa thanh toán'
    }));
  };

  return (
    <div className="dashboard-widget">
      <div className="dashboard-widget-header">
        <h2>Đơn hàng gần đây</h2>
        <div className="dashboard-widget-actions">
          <ReportDownloader
            data={prepareOrdersReportData()}
            reportName="Bao_cao_don_hang_gan_day"
            pdfHeaders={[
              { key: 'id', label: 'Mã đơn' },
              { key: 'customer', label: 'Khách hàng' },
              { key: 'date', label: 'Ngày đặt' },
              { key: 'amount', label: 'Tổng tiền (VNĐ)' },
              { key: 'status', label: 'Trạng thái' },
              { key: 'payment', label: 'Thanh toán' }
            ]}
            csvHeaders={[
              { key: 'id', label: 'Mã đơn' },
              { key: 'customer', label: 'Khách hàng' },
              { key: 'date', label: 'Ngày đặt' },
              { key: 'amount', label: 'Tổng tiền (VNĐ)' },
              { key: 'status', label: 'Trạng thái' },
              { key: 'payment', label: 'Thanh toán' }
            ]}
          />
          <Link to="/orders">Xem tất cả</Link>
        </div>
      </div>

      <div className="dashboard-widget-content">
        {orders.length === 0 ? (
          <div className="dashboard-no-data">
            <p>Không có đơn hàng nào gần đây</p>
          </div>
        ) : (
          <div className="dashboard-widget-table">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.first_name} {order.last_name}</td>
                    <td>VNĐ {parseFloat(order.amount).toFixed(2)}</td>
                    <td>
                      <span className={`dashboard-status ${getStatusClass(order.status)}`}>
                        {translateStatus(order.status)}
                      </span>
                    </td>
                    <td>
                      <Link to={`/orders/${order.id}`} className="dashboard-action-link">
                        Xem
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersWidget;
