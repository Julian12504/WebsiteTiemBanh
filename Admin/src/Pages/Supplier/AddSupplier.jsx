import React, { useState, useEffect, useContext } from "react";
import { AdminAuthContext } from "../../context/AdminAuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./Supplier.css";

const AddSupplier = ({ url }) => {
  const [formData, setFormData] = useState({
    name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [existingSuppliers, setExistingSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  const { token } = useContext(AdminAuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExistingSuppliers();
  }, []);

  const fetchExistingSuppliers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${url}/api/supplier/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setExistingSuppliers(response.data.data);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách nhà cung cấp:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatPhoneForComparison = (phone) => {
    let digits = phone.replace(/\D/g, "");
    if (digits.startsWith("0")) {
      digits = "94" + digits.substring(1);
    }
    return digits;
  };

  const isValidVietnamPhone = (phone) => {
  if (!phone) return false;
  // Xóa khoảng trắng
  const cleaned = phone.replace(/\s+/g, '');
  
  // Cho phép dạng: +84xxxxxxxxx hoặc 0xxxxxxxxx
  const regex = /^(?:\+84|0)(?:2\d{8,9}|3\d{8}|5\d{8}|7\d{8}|8\d{8}|9\d{8})$/;
  
  return regex.test(cleaned);
};


  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const checkForDuplicates = () => {
    const nameExists = existingSuppliers.some(
      (supplier) => supplier.name.toLowerCase() === formData.name.toLowerCase()
    );
    if (nameExists) {
      toast.error("Tên nhà cung cấp đã tồn tại");
      return true;
    }

    const formattedPhone = formatPhoneForComparison(formData.phone);
    const phoneExists = existingSuppliers.some((supplier) => {
      const existingPhone = formatPhoneForComparison(supplier.phone);
      return existingPhone === formattedPhone;
    });
    if (phoneExists) {
      toast.error("Số điện thoại nhà cung cấp đã tồn tại");
      return true;
    }

    if (formData.email) {
      const emailExists = existingSuppliers.some(
        (supplier) =>
          supplier.email &&
          supplier.email.toLowerCase() === formData.email.toLowerCase()
      );
      if (emailExists) {
        toast.error("Email nhà cung cấp đã tồn tại");
        return true;
      }
    }
    return false;
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
    if (!isValidVietnamPhone(formData.phone)) {
      toast.error(
        "Vui lòng nhập số điện thoại Việt Nam hợp lệ\n" +
          "Di động: 09xxxxxxxx, 03xxxxxxxx, 07xxxxxxxx, 08xxxxxxxx, 05xxxxxxxx\n" +
          "Cố định: 02xxxxxxxx"
      );
      return false;
    }

    if (formData.email && !isValidEmail(formData.email)) {
      toast.error("Vui lòng nhập địa chỉ email hợp lệ");
      return false;
    }
    if (checkForDuplicates()) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const response = await axios.post(`${url}/api/supplier/add`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) {
        toast.success("Thêm nhà cung cấp thành công");
        navigate("/suppliers");
      } else {
        toast.error(response.data.message || "Thêm nhà cung cấp thất bại");
      }
    } catch (err) {
      console.error("Lỗi khi thêm nhà cung cấp:", err);
      if (err.response) {
        toast.error(err.response.data?.message || "Lỗi khi thêm nhà cung cấp");
      } else if (err.request) {
        toast.error("Không nhận được phản hồi. Vui lòng kiểm tra kết nối.");
      } else {
        toast.error("Lỗi khi gửi yêu cầu: " + err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="suppliers-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu nhà cung cấp...</p>
      </div>
    );
  }

  return (
    <div className="add-supplier-container">
      <div className="add-supplier-header">
        <h1>Thêm Nhà Cung Cấp Mới</h1>
        <button className="back-button" onClick={() => navigate("/suppliers")}>
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
                placeholder="vd: 0901234567 hoặc +84 901234567"
                required
              />
              <small className="form-hint">
                Di động: 09xxxxxxxx, 03xxxxxxxx, 07xxxxxxxx, 08xxxxxxxx,
                05xxxxxxxx | Cố định: 02xxxxxxxx
              </small>
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
              onClick={() => navigate("/suppliers")}
            >
              Hủy
            </button>
            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? "Đang thêm..." : "Thêm nhà cung cấp"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddSupplier;
