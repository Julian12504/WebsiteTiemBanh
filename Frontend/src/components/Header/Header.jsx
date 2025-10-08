// import React from 'react'
import './Header.css';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  const handleViewItems = () => {
    navigate('/viewitems');
    window.scrollTo(0, 0);
  };

  return (
    <div>
      <div className="header">
        <div className="header-contents">
          <h1>Bạn cần gì... Chúng tôi đều có!</h1>
          <p>Khám phá tất cả nguyên liệu và dụng cụ để tự tay làm chiếc bánh của bạn</p>
          <button onClick={handleViewItems} className="view-btn">
            Xem sản phẩm
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
