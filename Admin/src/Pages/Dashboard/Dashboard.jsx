import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AdminAuthContext } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';
import SalesChart from './SalesChart';
import InventoryWidget from './InventoryWidget';
import OrdersWidget from './OrdersWidget';
import TopProducts from './TopProducts';
import ReportDownloader from '../../Components/ReportDownloader/ReportDownloader';
import './Dashboard.css';
import assets from '../../assets/assets';

const Dashboard = ({ url }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week'); // week, month, year
  const { token } = useContext(AdminAuthContext);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`Fetching dashboard data with URL: ${url}/api/admin/dashboard?range=${timeRange}`);
      console.log(`Using token: ${token}`);

      const response = await axios.get(`${url}/api/admin/dashboard?range=${timeRange}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Dashboard API response:", response.data);

      if (response.data.success) {
        setDashboardData(response.data.data);
      } else {
        console.error("Failed response:", response.data);
        toast.error(response.data.message || "Không thể tải dữ liệu tổng quan");
        setError("Không thể tải dữ liệu tổng quan");
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Lỗi kết nối tới máy chủ");
      toast.error("Không thể tải dữ liệu tổng quan");
    } finally {
      setLoading(false);
    }
  };

  // Chuẩn bị dữ liệu báo cáo (giữ logic, chỉ đổi nhãn/đơn vị)
  const prepareSalesReportData = () => {
    if (!dashboardData?.salesData) return [];
    return dashboardData.salesData.map(item => ({
      date: item.date,
      orders: item.orders,
      revenue: parseFloat(item.revenue).toFixed(2)
    }));
  };
  
  const prepareInventoryReportData = () => {
    if (!dashboardData?.lowStockItems && !dashboardData?.outOfStockItems) return [];
    const lowStock = (dashboardData.lowStockItems || []).map(item => ({ ...item, status: 'Sắp hết hàng' }));
    const outOfStock = (dashboardData.outOfStockItems || []).map(item => ({ ...item, status: 'Hết hàng' }));
    return [...lowStock, ...outOfStock];
  };
  
  const prepareProductsReportData = () => {
    if (!dashboardData?.topProducts) return [];
    return dashboardData.topProducts;
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading-spinner"></div>
        <p>Đang tải dữ liệu tổng quan…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h3>Lỗi tải bảng điều khiển</h3>
        <p>{error}</p>
        <button onClick={fetchDashboardData}>Thử lại</button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Bảng điều khiển</h1>
        <div className="dashboard-timerange">
          <button
            className={timeRange === 'week' ? 'active' : ''}
            onClick={() => setTimeRange('week')}
          >
            Tuần này
          </button>
          <button
            className={timeRange === 'month' ? 'active' : ''}
            onClick={() => setTimeRange('month')}
          >
            Tháng này
          </button>
          <button
            className={timeRange === 'year' ? 'active' : ''}
            onClick={() => setTimeRange('year')}
          >
            Năm nay
          </button>
        </div>
      </div>

      <div className="dashboard-summary">
        <div className="dashboard-summary-card revenue">
          <div className="dashboard-summary-icon">
            <img src={assets.rupee_icon} alt="Doanh thu" />
          </div>
          <div className="dashboard-summary-content">
            <h3>Tổng doanh thu</h3>
            <p>VNĐ {dashboardData?.totalRevenue?.toFixed(2) || "0.00"}</p>
            <span className={dashboardData?.revenueChange >= 0 ? "positive" : "negative"}>
              {dashboardData?.revenueChange >= 0 ? "↑" : "↓"} {Math.abs(dashboardData?.revenueChange || 0).toFixed(1)}%
            </span>
          </div>
        </div>
        
        <div className="dashboard-summary-card orders">
          <div className="dashboard-summary-icon">
            <img src={assets.basket_icon} alt="Đơn hàng" />
          </div>
          <div className="dashboard-summary-content">
            <h3>Đơn hàng</h3>
            <p>{dashboardData?.totalOrders || 0}</p>
            <span className="orders-processing">
              {dashboardData?.processingOrders || 0} đang xử lý
            </span>
          </div>
        </div>
        
        <div className="dashboard-summary-card inventory">
          <div className="dashboard-summary-icon">
            <img src={assets.out_of_stock} alt="Tồn kho" />
          </div>
          <div className="dashboard-summary-content">
            <h3>Tồn kho</h3>
            <p>{dashboardData?.lowStockItems?.length || 0} mặt hàng sắp hết</p>
            <span className="out-of-stock">
              {dashboardData?.outOfStockItems?.length || 0} hết hàng
            </span>
          </div>
        </div>
        
        <div className="dashboard-summary-card avg-order">
          <div className="dashboard-summary-icon">
            <img src={assets.avg_icon} alt="Giá trị đơn trung bình" />
          </div>
          <div className="dashboard-summary-content">
            <h3>Giá trị đơn TB</h3>
            <p>VNĐ {dashboardData?.averageOrderValue?.toFixed(2) || "0.00"}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="dashboard-chart-container">
          <div className="dashboard-chart-header">
            <h2>Xu hướng doanh thu</h2>
            <div className="dashboard-chart-actions">
              <ReportDownloader
                data={prepareSalesReportData()}
                reportName="Bao_cao_doanh_thu"
                pdfHeaders={[
                  {key: 'date', label: 'Ngày'},
                  {key: 'orders', label: 'Số đơn'},
                  {key: 'revenue', label: 'Doanh thu (VNĐ)'}
                ]}
                csvHeaders={[
                  {key: 'date', label: 'Ngày'},
                  {key: 'orders', label: 'Số đơn'},
                  {key: 'revenue', label: 'Doanh thu (VNĐ)'}
                ]}
              />
              <Link to="/reports/sales">Xem chi tiết</Link>
            </div>
          </div>
          <SalesChart data={dashboardData?.salesData || []} />
        </div>
      </div>

      <div className="dashboard-widgets">
        <div className="dashboard-widget inventory-widget">
          <div className="dashboard-widget-header">
            <h2>Tình trạng tồn kho</h2>
            <div className="dashboard-widget-actions">
              <ReportDownloader
                data={prepareInventoryReportData()}
                reportName="Bao_cao_ton_kho"
                pdfHeaders={[
                  {key: 'name', label: 'Tên hàng'},
                  {key: 'category', label: 'Danh mục'},
                  {key: 'stock_quantity', label: 'Tồn'},
                  {key: 'unit', label: 'ĐVT'},
                  {key: 'reorder_level', label: 'Ngưỡng nhập lại'},
                  {key: 'status', label: 'Trạng thái'}
                ]}
                csvHeaders={[
                  {key: 'id', label: 'ID'},
                  {key: 'name', label: 'Tên hàng'},
                  {key: 'category', label: 'Danh mục'},
                  {key: 'stock_quantity', label: 'Số lượng tồn'},
                  {key: 'unit', label: 'ĐVT'},
                  {key: 'reorder_level', label: 'Ngưỡng nhập lại'},
                  {key: 'status', label: 'Trạng thái'}
                ]}
              />
              <Link to="/list">Xem tất cả</Link>
            </div>
          </div>
          <InventoryWidget items={dashboardData?.lowStockItems || []} />
        </div>
        
        <OrdersWidget orders={dashboardData?.recentOrders || []} />
      </div>

      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h2>Sản phẩm bán chạy</h2>
          <div className="dashboard-section-actions">
            <ReportDownloader
              data={prepareProductsReportData()}
              reportName="Bao_cao_san_pham_ban_chay"
              pdfHeaders={[
                {key: 'name', label: 'Tên sản phẩm'},
                {key: 'category', label: 'Danh mục'},
                {key: 'quantity_sold', label: 'Số lượng bán'},
                {key: 'unit', label: 'ĐVT'},
                {key: 'total_revenue', label: 'Doanh thu (VNĐ)'}
              ]}
              csvHeaders={[
                {key: 'id', label: 'ID'},
                {key: 'name', label: 'Tên sản phẩm'},
                {key: 'category', label: 'Danh mục'},
                {key: 'quantity_sold', label: 'Số lượng bán'},
                {key: 'unit', label: 'ĐVT'},
                {key: 'total_revenue', label: 'Doanh thu (VNĐ)'}
              ]}
            />
            <Link to="/sales/products">Xem tất cả</Link>
          </div>
        </div>
        <TopProducts products={dashboardData?.topProducts || []} />
      </div>
    </div>
  );
};

export default Dashboard;
