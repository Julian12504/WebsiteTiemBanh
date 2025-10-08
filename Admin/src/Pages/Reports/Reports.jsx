import React, { useEffect, useState, useContext } from 'react';
import { AdminAuthContext } from '../../context/AdminAuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import ReportDownloader from '../../Components/ReportDownloader/ReportDownloader';
import './Reports.css';

// ====== Helpers: Nhãn & Formatter cho phần TÓM TẮT ======
const SUMMARY_LABELS = {
  period: 'Khoảng thời gian',
  totalOrders: 'Tổng số đơn hàng',
  totalRevenue: 'Tổng doanh thu',
  totalCost: 'Tổng chi phí',
  totalProfit: 'Tổng lợi nhuận',
  avgProfitMargin: 'Tỷ suất lợi nhuận TB',
  avgOrderValue: 'Giá trị đơn hàng TB',
};

const PERIOD_TEXT_MAP = {
  'Last 7 days': '7 ngày qua',
  'This week': 'Tuần này',
  'This month': 'Tháng này',
  'This quarter': 'Quý này',
  'This year': 'Năm nay',
};

const prettyKey = (k) =>
  SUMMARY_LABELS[k] ||
  k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

// Chuyển đổi category từ tiếng Anh sang tiếng Việt
const translateCategory = (category) => {
  const categoryMap = {
    'Cake': 'Bánh',
    'Cake Ingredients': 'Nguyên liệu làm bánh',
    'Party Items': 'Đồ trang trí tiệc'
  };
  return categoryMap[category] || category;
};

const formatSummaryValue = (key, value) => {
  // Chuẩn hoá chuỗi LKR -> VNĐ nếu backend trả kèm text
  if (typeof value === 'string') value = value.replace(/\bLKR\b/g, 'VNĐ');

  const moneyKeys = ['totalRevenue', 'totalCost', 'totalProfit', 'avgOrderValue'];
  if (moneyKeys.includes(key) && !isNaN(Number(value))) {
    return `VNĐ ${Number(value).toLocaleString('vi-VN', { minimumFractionDigits: 2 })}`;
  }

  if (key === 'avgProfitMargin' && !isNaN(Number(value))) {
    return `${Number(value).toFixed(2)}%`;
  }

  if (key === 'period' && typeof value === 'string') {
    return PERIOD_TEXT_MAP[value] || value;
  }

  return value;
};

const Reports = ({ url }) => {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('sales'); // sales | inventory | products
  const [dateRange, setDateRange] = useState('week');    // week | month | quarter | year
  const [reportData, setReportData] = useState([]);
  const [categorySales, setCategorySales] = useState([]);
  const [reportSummary, setReportSummary] = useState({});
  const { token } = useContext(AdminAuthContext);

  useEffect(() => {
    fetchReportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType, dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${url}/api/admin/reports/${reportType}?range=${dateRange}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setReportData(res.data.data || []);
        setCategorySales(res.data.categorySales || []);
        setReportSummary(res.data.summary || {});
      } else {
        toast.error('Không tải được dữ liệu báo cáo');
      }
    } catch (err) {
      console.error('Lỗi khi tải báo cáo:', err);
      toast.error(err.response?.data?.message || 'Lỗi khi tải báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const getReportConfig = () => {
    switch (reportType) {
      case 'sales':
        return {
          title: 'Báo cáo doanh thu',
          description: 'Tổng quan hiệu quả bán hàng, doanh thu và lợi nhuận',
          pdfHeaders: [
            { key: 'date', label: 'Ngày' },
            { key: 'orders', label: 'Số đơn' },
            { key: 'revenue', label: 'Doanh thu (VNĐ)', isCurrency: true },
            { key: 'total_cost', label: 'Chi phí (VNĐ)', isCurrency: true },
            { key: 'profit', label: 'Lợi nhuận (VNĐ)', isCurrency: true },
            { key: 'profit_margin', label: 'Tỷ suất (%)', isPercentage: true }
          ],
          csvHeaders: [
            { key: 'date', label: 'Ngày' },
            { key: 'orders', label: 'Số đơn' },
            { key: 'revenue', label: 'Doanh thu (VNĐ)' },
            { key: 'total_cost', label: 'Chi phí (VNĐ)' },
            { key: 'profit', label: 'Lợi nhuận (VNĐ)' },
            { key: 'profit_margin', label: 'Tỷ suất lợi nhuận (%)' }
          ],
          categoryPdfHeaders: [
            { key: 'category', label: 'Danh mục' },
            { key: 'order_count', label: 'Số đơn' },
            { key: 'quantity_sold', label: 'Số lượng bán' },
            { key: 'revenue', label: 'Doanh thu (VNĐ)', isCurrency: true },
            { key: 'cost', label: 'Chi phí (VNĐ)', isCurrency: true },
            { key: 'profit', label: 'Lợi nhuận (VNĐ)', isCurrency: true },
            { key: 'profit_margin', label: 'Tỷ suất (%)', isPercentage: true }
          ],
          categoryCsvHeaders: [
            { key: 'category', label: 'Danh mục' },
            { key: 'order_count', label: 'Số đơn' },
            { key: 'quantity_sold', label: 'Số lượng bán' },
            { key: 'revenue', label: 'Doanh thu (VNĐ)' },
            { key: 'cost', label: 'Chi phí (VNĐ)' },
            { key: 'profit', label: 'Lợi nhuận (VNĐ)' },
            { key: 'profit_margin', label: 'Tỷ suất lợi nhuận (%)' }
          ]
        };
      case 'inventory':
        return {
          title: 'Tồn kho',
          description: 'Tình trạng và số lượng tồn kho hiện tại',
          pdfHeaders: [
            { key: 'name', label: 'Tên hàng' },
            { key: 'category', label: 'Danh mục' },
            { key: 'stock_quantity', label: 'Số lượng tồn' },
            { key: 'unit', label: 'Đơn vị' },
            { key: 'reorder_level', label: 'Mức đặt hàng lại' },
            { key: 'selling_price', label: 'Giá bán (VNĐ)', isCurrency: true },
            { key: 'profit_per_unit', label: 'Lợi nhuận/đvị (VNĐ)', isCurrency: true },
            { key: 'status', label: 'Trạng thái' }
          ],
          csvHeaders: [
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Tên hàng' },
            { key: 'category', label: 'Danh mục' },
            { key: 'stock_quantity', label: 'Số lượng tồn' },
            { key: 'unit', label: 'Đơn vị' },
            { key: 'reorder_level', label: 'Mức đặt lại' },
            { key: 'cost_price', label: 'Giá vốn (VNĐ)' },
            { key: 'selling_price', label: 'Giá bán (VNĐ)' },
            { key: 'profit_per_unit', label: 'Lợi nhuận/đvị (VNĐ)' },
            { key: 'profit_margin', label: 'Tỷ suất lợi nhuận (%)' },
            { key: 'status', label: 'Trạng thái' }
          ]
        };
      case 'products':
        return {
          title: 'Hiệu quả sản phẩm',
          description: 'Phân tích các sản phẩm bán chạy nhất',
          pdfHeaders: [
            { key: 'name', label: 'Tên sản phẩm' },
            { key: 'category', label: 'Danh mục' },
            { key: 'quantity_sold', label: 'Số lượng bán' },
            { key: 'unit', label: 'Đơn vị' },
            { key: 'total_revenue', label: 'Doanh thu (VNĐ)', isCurrency: true },
            { key: 'total_profit', label: 'Lợi nhuận (VNĐ)', isCurrency: true },
            { key: 'profit_margin', label: 'Tỷ suất (%)', isPercentage: true }
          ],
          csvHeaders: [
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Tên sản phẩm' },
            { key: 'category', label: 'Danh mục' },
            { key: 'quantity_sold', label: 'Số lượng bán' },
            { key: 'unit', label: 'Đơn vị' },
            { key: 'total_revenue', label: 'Doanh thu (VNĐ)' },
            { key: 'total_cost', label: 'Chi phí (VNĐ)' },
            { key: 'total_profit', label: 'Lợi nhuận (VNĐ)' },
            { key: 'profit_margin', label: 'Tỷ suất lợi nhuận (%)' }
          ],
          categoryPdfHeaders: [
            { key: 'category', label: 'Danh mục' },
            { key: 'quantity_sold', label: 'Số lượng bán' },
            { key: 'total_revenue', label: 'Doanh thu (VNĐ)', isCurrency: true },
            { key: 'total_profit', label: 'Lợi nhuận (VNĐ)', isCurrency: true },
            { key: 'profit_margin', label: 'Tỷ suất (%)', isPercentage: true }
          ],
          categoryCsvHeaders: [
            { key: 'category', label: 'Danh mục' },
            { key: 'quantity_sold', label: 'Số lượng bán' },
            { key: 'total_revenue', label: 'Doanh thu (VNĐ)' },
            { key: 'total_profit', label: 'Lợi nhuận (VNĐ)' },
            { key: 'profit_margin', label: 'Tỷ suất lợi nhuận (%)' }
          ]
        };
      default:
        return { title: 'Báo cáo', description: '', pdfHeaders: [], csvHeaders: [] };
    }
  };

  const config = getReportConfig();

  const renderReportTable = () => {
    if (loading) {
      return (
        <div className="report-loading">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu báo cáo...</p>
        </div>
      );
    }

    if (!reportData.length) {
      return <p className="no-report-data">Không có dữ liệu cho báo cáo này</p>;
    }

    return (
      <div className="report-table-container">
        <table className="report-table">
          <thead>
            <tr>
              {config.pdfHeaders.map((h, i) => (
                <th key={i}>{h.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reportData.map((row, idx) => (
              <tr key={idx}>
                {reportType === 'sales' && (
                  <>
                    <td>{row.date}</td>
                    <td>{row.orders}</td>
                    <td>{`VNĐ ${parseFloat(row.revenue).toLocaleString('vi-VN', { minimumFractionDigits: 2 })}`}</td>
                    <td>{`VNĐ ${parseFloat(row.total_cost).toLocaleString('vi-VN', { minimumFractionDigits: 2 })}`}</td>
                    <td>{`VNĐ ${parseFloat(row.profit).toLocaleString('vi-VN', { minimumFractionDigits: 2 })}`}</td>
                    <td>{`${parseFloat(row.profit_margin).toFixed(2)}%`}</td>
                  </>
                )}

                {reportType === 'inventory' && (
                  <>
                    <td>{row.name}</td>
                    <td>{translateCategory(row.category)}</td>
                    <td>{`${row.stock_quantity} ${row.unit}`}</td>
                    <td>{row.unit}</td>
                    <td>{row.reorder_level}</td>
                    <td>{`VNĐ ${parseFloat(row.selling_price).toLocaleString('vi-VN', { minimumFractionDigits: 2 })}`}</td>
                    <td>{`VNĐ ${parseFloat(row.profit_per_unit).toLocaleString('vi-VN', { minimumFractionDigits: 2 })}`}</td>
                    <td>
                      <span className={`report-status ${row.stock_quantity === 0 ? 'status-out' : 'status-low'}`}>
                        {row.status}
                      </span>
                    </td>
                  </>
                )}

                {reportType === 'products' && (
                  <>
                    <td>{row.name}</td>
                    <td>{translateCategory(row.category)}</td>
                    <td>{row.quantity_sold}</td>
                    <td>{row.unit}</td>
                    <td>{`VNĐ ${parseFloat(row.total_revenue).toLocaleString('vi-VN', { minimumFractionDigits: 2 })}`}</td>
                    <td>{`VNĐ ${parseFloat(row.total_profit).toLocaleString('vi-VN', { minimumFractionDigits: 2 })}`}</td>
                    <td>{`${parseFloat(row.profit_margin).toFixed(2)}%`}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderCategorySales = () => {
    if (!categorySales.length) return null;

    return (
      <div className="category-sales-section">
        <div className="category-header">
          <h3>Doanh thu theo danh mục</h3>
          <ReportDownloader
            data={categorySales}
            reportName={`${config.title}_Theo_Danh_Mục`}
            pdfHeaders={config.categoryPdfHeaders}
            csvHeaders={config.categoryCsvHeaders}
            reportSummary={reportSummary}
          />
        </div>

        <div className="report-table-container">
          <table className="report-table">
            <thead>
              <tr>
                {config.categoryPdfHeaders.map((h, i) => (
                  <th key={i}>{h.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categorySales.map((row, idx) => (
                <tr key={idx}>
                  {reportType === 'sales' && (
                    <>
                      <td>{translateCategory(row.category)}</td>
                      <td>{row.order_count}</td>
                      <td>{row.quantity_sold}</td>
                      <td>{`VNĐ ${parseFloat(row.revenue).toLocaleString('vi-VN', { minimumFractionDigits: 2 })}`}</td>
                      <td>{`VNĐ ${parseFloat(row.cost).toLocaleString('vi-VN', { minimumFractionDigits: 2 })}`}</td>
                      <td>{`VNĐ ${parseFloat(row.profit).toLocaleString('vi-VN', { minimumFractionDigits: 2 })}`}</td>
                      <td>{`${parseFloat(row.profit_margin).toFixed(2)}%`}</td>
                    </>
                  )}

                  {reportType === 'products' && (
                    <>
                      <td>{translateCategory(row.category)}</td>
                      <td>{row.quantity_sold}</td>
                      <td>{`VNĐ ${parseFloat(row.total_revenue).toLocaleString('vi-VN', { minimumFractionDigits: 2 })}`}</td>
                      <td>{`VNĐ ${parseFloat(row.total_profit).toLocaleString('vi-VN', { minimumFractionDigits: 2 })}`}</td>
                      <td>{`${parseFloat(row.profit_margin).toFixed(2)}%`}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h1>Báo cáo</h1>
        {reportData.length > 0 && (
          <ReportDownloader
            data={reportData}
            reportName={config.title}
            pdfHeaders={config.pdfHeaders}
            csvHeaders={config.csvHeaders}
            reportSummary={reportSummary}
          />
        )}
      </div>

      <div className="report-controls">
        <div className="report-type-selector">
          <label>Loại báo cáo:</label>
          <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="sales">Báo cáo doanh thu</option>
            <option value="inventory">Tồn kho</option>
            <option value="products">Hiệu quả sản phẩm</option>
          </select>
        </div>

        <div className="report-date-range">
          <label>Khoảng thời gian:</label>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="quarter">Quý này</option>
            <option value="year">Năm nay</option>
          </select>
        </div>
      </div>

      <div className="report-content">
        <div className="report-header">
          <h2>{config.title}</h2>
          <p>{config.description}</p>
        </div>

        {Object.keys(reportSummary).length > 0 && (
          <div className="report-summary">
            <h3>Tóm tắt báo cáo</h3>
            <div className="summary-grid">
              {Object.entries(reportSummary).map(([key, value], index) => (
                <div key={index} className="summary-item">
                  <span className="summary-label">{prettyKey(key)}:</span>
                  <span className="summary-value">{formatSummaryValue(key, value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {renderReportTable()}

        {(reportType === 'sales' || reportType === 'products') && categorySales.length > 0 && renderCategorySales()}
      </div>
    </div>
  );
};

export default Reports;
