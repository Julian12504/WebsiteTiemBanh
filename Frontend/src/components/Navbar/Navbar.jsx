import { useContext, useState, useEffect, useRef } from 'react';
import './Navbar.css';
import assets from '../../assets/assets';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Navbar = () => {
  const [menu, setMenu] = useState('menu');
  const { getTotalCartAmount, token, setToken, item_list, setShowLoginPopup, logout } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null);

  // Cập nhật mục menu đang chọn dựa theo đường dẫn hiện tại
  useEffect(() => {
    if (location.pathname === '/') {
      setMenu('Trang chủ');
    } else if (location.pathname === '/viewitems') {
      setMenu('Sản phẩm');
    }
  }, [location.pathname]);

  // Đóng ô tìm kiếm khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Chức năng tìm kiếm
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filteredItems = item_list
      .filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          (item.description && item.description.toLowerCase().includes(term)) ||
          (item.category && item.category.toLowerCase().includes(term))
      )
      .slice(0, 5); // Giới hạn 5 kết quả đầu tiên

    setSearchResults(filteredItems);
  }, [searchTerm, item_list]);

  // Đăng xuất - sử dụng hàm từ StoreContext
  const handleLogout = () => {
    logout(); // Gọi hàm logout từ StoreContext (đã xóa giỏ hàng)
    navigate('/');
  };

  // Hiện / ẩn thanh tìm kiếm
  const handleSearchIconClick = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setTimeout(() => {
        const inputEl = document.getElementById('navbar-search-input');
        if (inputEl) inputEl.focus();
      }, 100);
    }
  };

  const handleSearchResultClick = (itemId) => {
    setShowSearch(false);
    setSearchTerm('');
    navigate(`/product/${itemId}`);
    window.scrollTo(0, 0);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim() !== '') {
      setShowSearch(false);
      navigate(`/viewitems?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
    }
  };

  // Cuộn xuống footer khi chọn "Liên hệ"
  const scrollToFooter = (e) => {
    e.preventDefault();
    setMenu('Liên hệ');
    const footer = document.getElementById('footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' });
    }

    // Nếu đang ở trang khác, quay về trang chủ rồi cuộn xuống
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const footer = document.getElementById('footer');
        if (footer) {
          footer.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  };

  return (
    <div className="navbar">
      <Link to="/">
        <img src={assets.font} alt="Logo" className="logo" />
      </Link>

      <ul className="navbar-menu">
        <Link to="/" onClick={() => setMenu('Trang chủ')} className={menu === 'Trang chủ' ? 'active' : ''}>
          Trang chủ
        </Link>
        <Link to="/viewitems" onClick={() => setMenu('Sản phẩm')} className={menu === 'Sản phẩm' ? 'active' : ''}>
          Sản phẩm
        </Link>
        <a href="#footer" onClick={scrollToFooter} className={menu === 'Liên hệ' ? 'active' : ''}>
          Liên hệ
        </a>
      </ul>

      <div className="navbar-right">
        <div className="navbar-search" ref={searchRef}>
          <img
            src={assets.search_icon}
            alt="Tìm kiếm"
            className="search-icon"
            onClick={handleSearchIconClick}
          />
          {showSearch && (
            <div className="search-container">
              <form onSubmit={handleSearchSubmit}>
                <input
                  id="navbar-search-input"
                  type="text"
                  placeholder="Tìm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit">
                  <img src={assets.search_icon} alt="Tìm" />
                </button>
              </form>

              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((item) => (
                    <div
                      key={item.id}
                      className="search-result-item"
                      onClick={() => handleSearchResultClick(item.id)}
                    >
                      <img src={item.image} alt={item.name} />
                      <div className="search-result-info">
                        <p className="search-result-name">{item.name}</p>
                        <p className="search-result-category">{item.category}</p>
                      </div>
                    </div>
                  ))}
                  <div
                    className="view-all-results"
                    onClick={() => {
                      setShowSearch(false);
                      navigate(`/viewitems?search=${encodeURIComponent(searchTerm)}`);
                      setSearchTerm('');
                    }}
                  >
                    Xem tất cả kết quả
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="navbar-search-icon">
          <img 
            src={assets.cart} 
            className="cart-icon" 
            alt="Giỏ hàng" 
            onClick={() => {
              if (!token) {
                toast.info("Vui lòng đăng nhập để xem giỏ hàng");
                setShowLoginPopup(true);
              } else {
                navigate('/cart');
              }
            }}
            style={{ cursor: 'pointer' }}
          />
          <div className={getTotalCartAmount() === 0 ? '0' : 'dot'}></div>
        </div>

        {!token ? (
          <button onClick={() => setShowLoginPopup(true)}>Đăng nhập</button>
        ) : (
          <div className="navbar-profile">
            <img className="profile-icon" src={assets.profile_icon} alt="Tài khoản" />
            <ul className="nav-profile-dropdown">
              <li>
                <Link to="/myorders">
                  <li>
                    <img src={assets.bag_icon} alt="" />
                    <span>Đơn hàng</span>
                  </li>
                </Link>
              </li>
              <hr />
              <li onClick={handleLogout}>
                <img src={assets.logout_icon} alt="" />
                <span>Đăng xuất</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
