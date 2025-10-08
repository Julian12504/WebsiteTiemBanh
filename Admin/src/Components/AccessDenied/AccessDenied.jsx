import React from 'react';
import './AccessDenied.css';
import { useNavigate } from 'react-router-dom';

const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <div className="access-denied">
      <div className="access-denied-content">
        <h2>[translate:Truy cập bị từ chối]</h2>
        <p>[translate:Bạn không có quyền truy cập tính năng này.]</p>
        <p className="small">[translate:Vui lòng liên hệ quản trị viên nếu bạn cần quyền truy cập.]</p>
        <button
          onClick={() => navigate('/list')}
          className="back-button"
        >
          [translate:Quay lại danh sách hàng tồn kho]
        </button>
      </div>
    </div>
  );
};

export default AccessDenied;
