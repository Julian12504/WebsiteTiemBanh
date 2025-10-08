import React, { useState, useContext } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { AdminAuthContext } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';
import { assets } from '../../assets/assets';
import axios from 'axios';

const Login = ({ url }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useContext(AdminAuthContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.email || !credentials.password) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    
    try {
      setLoading(true);
      console.log(`Đang đăng nhập tại ${url}/api/admin/login với email: ${credentials.email}`);
      
      const response = await axios.post(`${url}/api/admin/login`, credentials);
      
      if (response.data.success) {
        console.log("Đăng nhập thành công:", response.data.user);
        login(response.data.token, response.data.user);
        
        toast.success(`Chào mừng trở lại, ${response.data.user.firstName}!`);
        
        navigate('/list');
      } else {
        console.error("Đăng nhập thất bại:", response.data);
        toast.error(response.data.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      if (error.response) {
        console.error("Phản hồi lỗi:", error.response.status, error.response.data);
      }
      
      if (error.response?.status === 401) {
        toast.error("Thông tin đăng nhập không hợp lệ. Vui lòng kiểm tra lại email và mật khẩu.");
      } else if (error.response?.status === 403) {
        toast.error("Từ chối truy cập. Cần quyền quản trị viên.");
      } else {
        toast.error(error.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="login-container">
        <div className="login-header">
          <img src={assets.font} alt="Cake Fantasy" className="login-logo" />
          <h2>Bảng điều khiển quản trị</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group flex-col">
            <p>Email</p>
            <input 
              type="email" 
              name="email" 
              value={credentials.email}
              onChange={handleChange}
              placeholder="nhanvien@cakefantasy.vn"
              required
            />
          </div>
          
          <div className="form-group flex-col">
            <p>Mật khẩu</p>
            <input 
              type="password" 
              name="password" 
              value={credentials.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="login-btn" 
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "ĐĂNG NHẬP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
