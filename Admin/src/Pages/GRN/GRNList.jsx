import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AdminAuthContext } from '../../context/AdminAuthContext';
import './GRNList.css';

const GRNList = ({ url }) => {
  const [grnList, setGRNList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    supplierId: '',
    dateRange: '',
    page: 1
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const { token } = useContext(AdminAuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGRNs();
    fetchSuppliers();
  }, [filters]);

  const fetchGRNs = async () => {
    try {
      setLoading(true);
      let queryString = '';
      if (filters.supplierId || filters.startDate || filters.endDate || pagination.page) {
        const params = new URLSearchParams();
        if (filters.supplierId) params.append('supplier_id', filters.supplierId);
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        params.append('page', pagination.page || 1);
        params.append('limit', pagination.limit || 10);
        queryString = `?${params.toString()}`;
      }

      const response = await axios.get(
        `${url}/api/grn/list${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setGRNList(response.data.data || []);

        if (response.data.pagination) {
          setPagination(prev => ({
            ...prev,
            ...response.data.pagination
          }));
        }
      } else {
        toast.error(response.data.message || "Không lấy được danh sách phiếu nhập");
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh sách phiếu nhập:", err);
      if (err.response) {
        toast.error(err.response.data?.message || "Lỗi khi tải danh sách phiếu nhập");
      } else if (err.request) {
        toast.error("Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối.");
      } else {
        toast.error(`Lỗi: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(
        `${url}/api/supplier/list`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setSuppliers(response.data.data);
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh sách nhà cung cấp:", err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
      page: 1
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setFilters({
      ...filters,
      page: newPage
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `${parseFloat(amount || 0).toLocaleString('vi-VN')} VNĐ`;
  };

  const handleViewGRN = (grnId) => {
    navigate(`/grn/${grnId}`);
  };

  const getSupplierName = (supplierId) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : 'Không xác định';
  };

  // Lọc danh sách phiếu nhập theo từ khóa tìm kiếm (số tham chiếu hoặc tên nhà cung cấp)
  const filteredGRNs = searchTerm
    ? grnList.filter(grn =>
        grn.reference_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getSupplierName(grn.supplier_id).toLowerCase().includes(searchTerm.toLowerCase())
      )
    : grnList;

  return (
    <div className="grn-container">
      <div className="grn-header">
        <h1>Danh sách Phiếu nhập kho</h1>
        <button className="create-grn-btn" onClick={() => navigate('/create-grn')}>Tạo phiếu nhập mới</button>
      </div>

      <div className="grn-filters">
        <div className="filter-group">
          <p>Nhà cung cấp</p>
          <select name="supplierId" value={filters.supplierId} onChange={handleFilterChange}>
            <option value="">Tất cả nhà cung cấp</option>
            {suppliers.map(supplier => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm theo số tham chiếu hoặc nhà cung cấp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải danh sách phiếu nhập...</p>
        </div>
      ) : filteredGRNs.length === 0 ? (
        <div className="no-grns">
          <p>Không tìm thấy phiếu nhập nào</p>
        </div>
      ) : (
        <div className="grn-table-container">
          <table className="grn-table">
            <thead>
              <tr>
                  <th>Số tham chiếu</th>
                  <th>Mã hóa đơn</th>
                <th>Nhà cung cấp</th>
                <th>Ngày tạo</th>
                <th>Số lượng sản phẩm</th>
                <th>Tổng tiền</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredGRNs.map(grn => (
                <tr key={grn.id}>
                  <td className="grn-reference">{grn.grn_number || 'N/A'}</td>
                  <td>{grn.po_reference || 'N/A'}</td>
                  <td>{getSupplierName(grn.supplier_id)}</td>
                  <td>{formatDate(grn.created_at)}</td>
                  <td>{grn.item_count}</td>
                  <td className="grn-amount">{formatCurrency(grn.total_amount)}</td>
                  <td>
                    <button className="view-btn" onClick={() => handleViewGRN(grn.id)}>Xem chi tiết</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            Trước
          </button>

          <span className="page-info">
            Trang {pagination.page} trên {pagination.totalPages}
          </span>

          <button
            className="pagination-btn"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            Tiếp
          </button>
        </div>
      )}
    </div>
  );
};

export default GRNList;
