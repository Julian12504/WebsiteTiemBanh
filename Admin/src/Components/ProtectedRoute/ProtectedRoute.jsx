import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminAuthContext } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';
import AccessDenied from '../AccessDenied/AccessDenied';

const ProtectedRoute = ({ children, requiredRole = 'employee' }) => {
  const { isAuthenticated, hasRole, loading } = useContext(AdminAuthContext);
  
  // Hiển thị trạng thái đang tải
  if (loading) {
    return (
      <div
        className="loading-container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <div className="loading-spinner"></div>
        <p>Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }

  // Chưa đăng nhập → chuyển hướng sang trang đăng nhập
  if (!isAuthenticated) {
    toast.warning("Vui lòng đăng nhập để tiếp tục");
    return <Navigate to="/login" replace />;
  }

  // Không đủ quyền → chặn truy cập
  if (!hasRole(requiredRole)) {
    toast.error("Bạn không có quyền truy cập trang này");
    return <AccessDenied />;
  }

  // Đã đăng nhập & có quyền hợp lệ → cho phép truy cập
  return children;
};

export default ProtectedRoute;
