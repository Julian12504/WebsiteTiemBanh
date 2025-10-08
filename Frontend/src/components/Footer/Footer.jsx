import { useNavigate } from 'react-router-dom';
import './Footer.css';
import assets from '../../assets/assets';

const Footer = () => {
  const navigate = useNavigate();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleNavigation = (path) => {
    navigate(path);
    scrollToTop();
  };

  return (
    <div className="footer" id="footer">
      <div className="footer-content">
        {/* Cột bên trái */}
        <div className="footer-content-left">
          <img src={assets.font} alt="Logo BakeShop" />
          <p>Điểm đến trọn gói cho mọi nhu cầu làm bánh của bạn</p>
        </div>

        {/* Cột giữa */}
        <div className="footer-content-center">
          <h2>CÔNG TY</h2>
          <ul>
            <li onClick={() => handleNavigation('/')}>Trang chủ</li>
            <li onClick={() => handleNavigation('/viewitems')}>Xem sản phẩm</li>
            <li onClick={() => handleNavigation('/aboutus')}>Giới thiệu</li>
            <li onClick={() => handleNavigation('/privacy')}>Chính sách bảo mật</li>
          </ul>
        </div>

        {/* Cột bên phải */}
        <div className="footer-content-right">
          <h2>LIÊN HỆ</h2>
          <ul>
            <li>
              <a href="tel:+94774718672">+94 77 471 8672</a>
            </li>
            <li>
              <a href="tel:+94773047749">+94 77 304 7749</a>
            </li>
            <li>
              <a href="mailto:info@cakefantasy.com">info@cakefantasy.com</a>
            </li>
          </ul>
        </div>
      </div>

      <hr />

      <div className="footer-bottom">
        <p className="footer-copyright">
          Bản quyền © 2025 BakeShop.com — Mọi quyền được bảo lưu.
        </p>
        <button className="back-to-top" onClick={scrollToTop}>
          ↑ Lên đầu trang
        </button>
      </div>
    </div>
  );
};

export default Footer;
