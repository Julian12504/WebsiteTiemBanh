import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AdminAuthContext } from '../../context/AdminAuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import './EmployeeManagement.css';

const EmployeeManagement = ({ url }) => {
  const { token, hasRole } = useContext(AdminAuthContext);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('employee'); // 'employee' hoặc 'admin'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${url}/api/admin/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setEmployees(response.data.data);
      } else {
        toast.error(response.data.message || "Không tải được danh sách nhân viên");
      }
    } catch (error) {
      console.error("Lỗi khi tải nhân viên:", error);
      toast.error(error.response?.data?.message || "Không tải được danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  }, [token, url]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      toast.error("Vui lòng nhập đầy đủ tất cả các trường");
      return;
    }
    try {
      const endpoint = modalType === 'admin' ? 'admins' : 'employees';
      const response = await axios.post(`${url}/api/admin/${endpoint}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.data.success) {
        toast.success(`${modalType === 'admin' ? 'Quản trị viên' : 'Nhân viên'} đã được thêm thành công`);
        setShowModal(false);
        resetForm();
        fetchEmployees();
      } else {
        toast.error(response.data.message || "Thêm nhân viên thất bại");
      }
    } catch (error) {
      console.error("Lỗi thêm nhân viên:", error);
      toast.error(error.response?.data?.message || "Thêm nhân viên thất bại");
    }
  };

  const deleteEmployee = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa nhân viên này không?")) return;
    try {
      const response = await axios.delete(`${url}/api/admin/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        toast.success("Xóa nhân viên thành công");
        setEmployees(employees.filter(emp => emp.id !== id));
      } else {
        toast.error(response.data.message || "Xóa nhân viên thất bại");
      }
    } catch (error) {
      console.error("Lỗi xóa nhân viên:", error);
      toast.error(error.response?.data?.message || "Xóa nhân viên thất bại");
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: ''
    });
  };

  if (!hasRole('owner')) {
    return (
      <div className="error-message">
        <h2>Truy cập bị từ chối</h2>
        <p>Bạn không có quyền quản lý nhân viên.</p>
      </div>
    );
  }

  return (
    <div className="employee-management">
      <div className="page-header">
        <h1>Quản lý nhân viên</h1>
        <div className="action-buttons">
          <button onClick={() => openModal('employee')} className="add-btn">Thêm nhân viên</button>
          <button onClick={() => openModal('admin')} className="add-btn admin-btn">Thêm quản trị viên</button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : (
        <div className="employee-list">
          <table>
            <thead>
              <tr>
                <th>Tên đăng nhập</th>
                <th>Họ và tên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">Không có nhân viên nào</td>
                </tr>
              ) : (
                employees.map(emp => (
                  <tr key={emp.id}>
                    <td>{emp.username}</td>
                    <td>{emp.first_name} {emp.last_name}</td>
                    <td>{emp.email}</td>
                    <td><span className={`role-badge ${emp.role}`}>
                      {emp.role === 'owner' ? 'Chủ sở hữu' : 
                       emp.role === 'admin' ? 'Quản trị viên' : 
                       emp.role === 'employee' ? 'Nhân viên' : 
                       emp.role}
                    </span></td>
                    <td>{new Date(emp.created_at).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <button onClick={() => deleteEmployee(emp.id)} className="delete-btn">Xóa</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Thêm {modalType === 'admin' ? 'quản trị viên' : 'nhân viên'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Tên đăng nhập</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Họ</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Tên</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Mật khẩu</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength="8"
                />
                <small>Mật khẩu phải có ít nhất 8 ký tự</small>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="submit-btn">Thêm {modalType === 'admin' ? 'quản trị viên' : 'nhân viên'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
