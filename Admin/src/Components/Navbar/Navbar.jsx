import React, { useContext, useState, useEffect } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { AdminAuthContext } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';

const Navbar = () => {
  const { user, logout } = useContext(AdminAuthContext);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Đăng xuất thành công");
    setShowDropdown(false);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Đóng menu dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.dropdown')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className='navbar'>
      <img className='logo' src={assets.font} alt="BakeShop" />

      {user && (
        <div className="user-section">
          <div className="user-info">
            <p className="user-name">{user.firstName} {user.lastName}</p>
            <p className={`user-role ${user.role}`}>
              {user.role === 'owner' ? 'Chủ sở hữu' : user.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
            </p>
          </div>

          <div className="dropdown">
            <button className="dropdown-toggle" onClick={toggleDropdown} aria-label="Menu người dùng">
              <span className="arrow-down"></span>
            </button>

            {showDropdown && (
              <div className="dropdown-menu">
                <button
                  className="logout-btn"
                  onClick={handleLogout}
                >
                 Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
