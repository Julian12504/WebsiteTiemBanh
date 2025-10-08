import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AdminAuthContext } from '../../context/AdminAuthContext';
import './Supplier.css';

const EditSupplier = ({ url }) => {
  const { supplierId } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { token } = useContext(AdminAuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSupplier();
  }, [supplierId]);

  const fetchSupplier = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${url}/api/supplier/${supplierId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        const supplier = response.data.data;
        setFormData({
          name: supplier.name || '',
          contact_person: supplier.contact_person || '',
          phone: supplier.phone || '',
          email: supplier.email || '',
          address: supplier.address || '',
          notes: supplier.notes || ''
        });
      } else {
        toast.error("Không tải được chi tiết nhà cung cấp");
        navigate('/suppliers');
      }
    } catch (err) {
      console.error("Lỗi khi tải nhà cung cấp:", err);
      toast.error(err.response?.data?.message || "Lỗi khi tải nhà cung cấp");
      navigate('/suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatPhoneForComparison = (phone) => {
    let digits = phone.replace(/\D/g, '');
    if (digits.startsWith('0')) {
      digits = '94' + digits.substring(1);
    }
    return digits;
  };

  const isValidSriLankanPhone = (phone) => {
    const digitsOnly = phone.replace(/\D/g, '');
    if (/^(?:0|94|\+94)?7[0-9]{8}$/.test(digitsOnly)) {
      return true;
    }
    if (/^0[1-9][0-9]{8}$/.test(digitsOnly)) {
      return true;
    }
    return false;
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên nhà cung cấp");
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error("Vui lòng nhập số điện thoại");
      return false;
    }
    if (!isValidSriLankanPhone(formData.phone)) {
      toast.error(
        "Vui lòng nhập số điện thoại Sri Lanka hợp lệ\n" +
        "Di động: 07XXXXXXXX hoặc +947XXXXXXXX\n" +
        "Cố định: 0XXYYYYYYY"
      );
      return false;
    }
    if (formData.email && !isValidEmail(formData.email)) {
      toast.error("Vui lòng nhập địa chỉ email hợp lệ");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const response = await axios.post(
        `${url}/api/supplier/update`,
        {
          supplier_id: supplierId,
          ...formData
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (response.data.success) {
        toast.success("Cập nhật nhà cung cấp thành công");
        navigate('/suppliers');
      } else {
        toast.error(response.data.message || "Cập nhật nhà cung cấp thất bại");
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật nhà cung cấp:", err);
      toast.error(err.response?.data?.message || "Lỗi khi cập nhật nhà cung cấp");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="suppliers-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải chi tiết nhà cung cấp...</p>
      </div>
    );
  }

  return (
    <div className="edit-supplier-container">
      <div className="edit-supplier-header">
        <h1>Chỉnh sửa Nhà Cung Cấp</h1>
        <button
          className="back-button"
          onClick={() => navigate('/suppliers')}
        >
          Quay lại danh sách nhà cung cấp
        </button>
      </div>

      <form onSubmit={handleSubmit} className="supplier-form">
        <div className="supplier-form-card">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Tên nhà cung cấp*</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact_person">Người liên hệ</label>
              <input
                type="text"
                id="contact_person"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleInputChange}
              />
              <small className="form-hint">Tùy chọn</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Số điện thoại*</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="vd: 0712345678 hoặc +94 712345678"
                required
              />
              <small className="form-hint">Di động: 07XXXXXXXX hoặc +947XXXXXXXX | Cố định: 0XXYYYYYYY</small>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
              <small className="form-hint">Tùy chọn</small>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">Địa chỉ</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows="2"
            />
            <small className="form-hint">Tùy chọn</small>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Ghi chú thêm</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="3"
            />
            <small className="form-hint">Tùy chọn</small>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate('/suppliers')}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={submitting}
            >
              {submitting ? "Đang cập nhật..." : "Cập nhật nhà cung cấp"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditSupplier;
