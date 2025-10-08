import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AdminAuthContext } from '../../context/AdminAuthContext';
import './GRNDetails.css';

const GRNDetails = ({ url }) => {
  const { grnId } = useParams();
  const [grn, setGRN] = useState(null);
  const [loading, setLoading] = useState(true);
  const [supplier, setSupplier] = useState(null);
  const { token } = useContext(AdminAuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGRNDetails();
  }, [grnId]);

  const fetchGRNDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${url}/api/grn/${grnId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        console.log('🔍 GRN Details Data:', response.data.data);
        setGRN(response.data.data);

        // Lấy thông tin nhà cung cấp
        if (response.data.data.supplier_id) {
          fetchSupplierDetails(response.data.data.supplier_id);
        }
      } else {
        toast.error('Không thể tải chi tiết phiếu nhập!');
      }
    } catch (err) {
      console.error('Lỗi khi tải chi tiết phiếu nhập:', err);
      toast.error(err.response?.data?.message || 'Có lỗi khi tải phiếu nhập!');
    } finally {
      setLoading(false);
    }
  };

  const fetchSupplierDetails = async (supplierId) => {
    try {
      const response = await axios.get(
        `${url}/api/supplier/${supplierId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setSupplier(response.data.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải thông tin nhà cung cấp:', err);
    }
  };

  // Hàm định dạng tiền tệ VNĐ
  const formatCurrency = (amount) => {
    return `${parseFloat(amount || 0).toLocaleString('vi-VN')} VNĐ`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Không xác định';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const translateUnit = (unit) => {
    const unitMap = {
      'piece': 'cái',
      'g': 'g',
      'kg': 'kg',
      'ml': 'ml',
      'l': 'l',
      'box': 'hộp',
      'pack': 'gói',
      'bottle': 'chai',
      'can': 'lon'
    };
    return unitMap[unit] || unit || 'cái';
  };

  const calculateItemTotal = (item) => {
    const quantity = item.quantity || item.received_quantity || 0;
    const price = parseFloat(item.unit_price || 0);
    return (quantity * price).toFixed(2);
  };

  if (loading) {
    return (
      <div className="grn-details-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải chi tiết phiếu nhập...</p>
        <small>Vui lòng đợi trong giây lát</small>
      </div>
    );
  }

  if (!grn) {
    return (
      <div className="grn-details-error">
        <div className="error-icon">⚠️</div>
        <p>Không tìm thấy phiếu nhập hoặc bạn không có quyền truy cập.</p>
        <button
          className="back-button"
          onClick={() => navigate('/grn')}
        >
          Quay lại danh sách phiếu nhập
        </button>
      </div>
    );
  }

  return (
    <div className="grn-details-container">
      <div className="grn-details-header">
        <div>
          <h1>Chi tiết Phiếu nhập kho: {grn.grn_number || 'N/A'}</h1>
        </div>
        <button className="back-button" onClick={() => navigate('/grn')}>Quay lại danh sách phiếu nhập</button>
      </div>

      <div className="grn-details-content">
        <div className="grn-info-section">
          <h3>Thông tin chung</h3>
          <div className="grn-info-grid">
            <div className="info-item">
              <span className="info-label">Số tham chiếu:</span>
              <span className="info-value">{grn.grn_number || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Mã hóa đơn:</span>
              <span className="info-value">{grn.po_reference || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Ngày tạo:</span>
              <span className="info-value">{formatDate(grn.created_at)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Nhà cung cấp:</span>
              <span className="info-value">{grn.supplier_name || 'Không xác định'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Người tạo:</span>
              <span className="info-value">{grn.received_by_name || 'Không xác định'}</span>
            </div>
          </div>
        </div>

        <div className="grn-supplier-section">
          <h3>Thông tin Nhà cung cấp</h3>
          {supplier ? (
            <div className="grn-info-grid">
              <div className="info-item">
                <span className="info-label">Tên NCC:</span>
                <span className="info-value">{supplier.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Người liên hệ:</span>
                <span className="info-value">{supplier.contact_person || 'Không có'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{supplier.email || 'Không có'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Điện thoại:</span>
                <span className="info-value">{supplier.phone || 'Không có'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Địa chỉ:</span>
                <span className="info-value">{supplier.address || 'Không có'}</span>
              </div>
            </div>
          ) : (
            <p className="no-data-message">Không có thông tin nhà cung cấp</p>
          )}
        </div>

        <div className="grn-items-section">
          <h3>Danh sách sản phẩm nhập</h3>
          <div className="table-container">
            <table className="grn-items-table">
              <thead>
                <tr>
                  <th className="item-name-col">Tên sản phẩm</th>
                  <th className="item-code-col">Mã hàng</th>
                  <th className="quantity-col">Số lượng</th>
                  <th className="price-col">Giá nhập</th>
                  <th className="price-col">Giá bán</th>
                  <th className="total-col">Thành tiền</th>
                </tr>
              </thead>

              <tbody>
                {(grn.items || []).length > 0 ? (
                  grn.items.map((item, index) => (
                    <tr key={index}>
                      <td className="item-name-col">{item.name || item.item_name || 'Không xác định'}</td>
                      <td className="item-code-col">{item.display_barcode || item.barcode || item.sku || 'Không có'}</td>
                      <td className="quantity-col">
                        {item.quantity || item.received_quantity || 0}
                        <span className="unit-badge">{translateUnit(item.unit)}</span>
                      </td>
                      <td className="price-col">{formatCurrency(item.unit_price)}</td>
                      <td className="price-col">
                        {item.selling_price
                          ? formatCurrency(item.selling_price)
                          : 'Chưa cập nhật'}
                      </td>
                      <td className="total-col">{formatCurrency(calculateItemTotal(item))}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-items">Không có sản phẩm trong phiếu nhập này</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="5" className="total-label">Tổng cộng:</td>
                  <td className="total-value">{formatCurrency(grn.total_amount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="grn-notes-section">
          <h3>Ghi chú</h3>
          {grn.notes ? (
            <p className="notes-content">{grn.notes}</p>
          ) : (
            <p className="no-notes">Không có ghi chú cho phiếu nhập này</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GRNDetails;
