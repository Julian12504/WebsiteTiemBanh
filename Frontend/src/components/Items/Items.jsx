import './Items.css';
import { useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';

// eslint-disable-next-line react/prop-types
const Items = ({ id, name, price, image, unit, category, weight_value, weight_unit, rating = 0 }) => {
  const navigate = useNavigate();
  const { cartItems, addToCart, removeFromCart } = useContext(StoreContext);

  const handleViewDetails = () => {
    navigate(`/product/${id}`);
    window.scrollTo(0, 0);
  };

  // Định dạng giá tiền theo chuẩn VNĐ
  const formatPrice = (price) => {
    if (!price || isNaN(price)) return '0';
    const num = parseFloat(price);
    return num.toLocaleString('vi-VN'); // tự động thêm dấu . ngăn cách
  };

  // Tạo hiển thị đánh giá bằng sao
  const renderStars = (rating, count = 0) => {
    const stars = [];
    const ratingValue = Math.min(5, Math.max(0, parseFloat(rating) || 0));

    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(ratingValue)) {
        stars.push(<span key={i} className="star full">★</span>);
      } else if (i === Math.ceil(ratingValue) && ratingValue % 1 >= 0.5) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star empty">☆</span>);
      }
    }

    return (
      <div className="star-rating">
        {stars}
        {count > 0 && <span className="rating-count">({count})</span>}
      </div>
    );
  };

  return (
    <div className="item">
      <div className="item-image-container">
        <img className="item-image" src={image} alt={name} />
        <div className="item-actions">
          <button className="view-details-btn" onClick={handleViewDetails}>
            Xem chi tiết
          </button>
        </div>
      </div>

      <div className="item-info">
        <div className="item-name-rating">
          <p className="item-name">{name}</p>
          <div className="item-badges">
            {category && <span className="item-category-badge">{category}</span>}
            {weight_value && <span className="item-weight-badge">{weight_value}{weight_unit}</span>}
          </div>
        </div>

        {/* Hiển thị đánh giá bằng sao */}
        {renderStars(rating)}

        <div className="item-price-container">
          <p className="item-price">{formatPrice(price)} VNĐ</p>
          {unit && <span className="item-unit"> / {unit}</span>}
        </div>
      </div>
    </div>
  );
};

export default Items;
