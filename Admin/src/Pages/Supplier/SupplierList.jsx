import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AdminAuthContext } from '../../context/AdminAuthContext';
import ConfirmDialog from '../../Components/ConfirmDialog/ConfirmDialog';
import './Supplier.css';

const SupplierList = ({ url }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);

  const { token } = useContext(AdminAuthContext);
  const navigate = useNavigate();

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${url}/api/supplier/list`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setSuppliers(response.data.data);
      } else {
        toast.error("Không tải được danh sách nhà cung cấp");
      }
    } catch (err) {
      console.error("Lỗi khi tải nhà cung cấp:", err);
      toast.error(err.response?.data?.message || "Lỗi khi tải nhà cung cấp");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleAddClick = () => {
    navigate('/add-supplier');
  };

  const handleEditClick = (supplierId) => {
    navigate(`/edit-supplier/${supplierId}`);
  };

  const handleDeleteClick = (supplier) => {
    setSupplierToDelete(supplier);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!supplierToDelete) return;
    try {
      const response = await axios.post(
        `${url}/api/supplier/remove`,
        { supplier_id: supplierToDelete.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success("Xóa nhà cung cấp thành công");
        fetchSuppliers();
      } else {
        toast.error(response.data.message || "Xóa nhà cung cấp thất bại");
      }
    } catch (err) {
      console.error("Lỗi khi xóa nhà cung cấp:", err);
      toast.error(err.response?.data?.message || "Lỗi khi xóa nhà cung cấp");
    } finally {
      setIsConfirmOpen(false);
      setSupplierToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsConfirmOpen(false);
    setSupplierToDelete(null);
  };

  if (loading) {
    return (
      <div className="suppliers-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải danh sách nhà cung cấp...</p>
      </div>
    );
  }

  return (
    <div className="suppliers-container">
      <div className="suppliers-header">
        <h1>Quản lý Nhà cung cấp</h1>
        <button
          className="add-supplier-btn"
          onClick={handleAddClick}
        >
          Thêm nhà cung cấp mới
        </button>
      </div>

      {suppliers.length === 0 ? (
        <div className="no-suppliers-message">
          <p>Không có nhà cung cấp nào. Nhấp nút trên để thêm nhà cung cấp mới.</p>
        </div>
      ) : (
        <div className="suppliers-table-container">
          <table className="suppliers-table">
            <thead>
              <tr>
                <th>Tên</th>
                <th>Người liên hệ</th>
                <th>Điện thoại</th>
                <th>Email</th>
                <th>Địa chỉ</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map(supplier => (
                <tr key={supplier.id}>
                  <td>{supplier.name}</td>
                  <td>{supplier.contact_person}</td>
                  <td>{supplier.phone}</td>
                  <td>{supplier.email}</td>
                  <td>{supplier.address}</td>
                  <td className="action-buttons">
                    <button
                      className="edit-btn"
                      onClick={() => handleEditClick(supplier.id)}
                    >
                      Sửa
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteClick(supplier)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Xác nhận xóa"
        message={supplierToDelete ? `Bạn có chắc chắn muốn xóa nhà cung cấp "${supplierToDelete.name}"? Việc này có thể ảnh hưởng đến các phiếu nhập tồn tại.` : ""}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

export default SupplierList;
