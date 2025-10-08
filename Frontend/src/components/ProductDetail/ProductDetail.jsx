import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import './ProductDetail.css';
import { toast } from 'react-toastify';
import ReviewSection from '../../components/ReviewSection/ReviewSection';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';
import io from 'socket.io-client';

const ProductDetail = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { url, addToCart, cartItems, removeFromCart } = useContext(StoreContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    const socket = io(url.replace('/api', ''));
    socket.on('inventory-updated', (data) => {
      if (data.type === 'grn-completed') {
        fetchItemDetails();
      }
    });
    return () => socket.disconnect();
  }, []);

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${url}/api/item/${itemId}`);

      if (response.data.success) {
        const productData = response.data.data;
        setProduct(productData);

        const initialQty = productData.min_order_quantity || 1;
        setQuantity(productData.is_loose ? parseFloat(initialQty) : parseInt(initialQty));
      } else {
        setError('Không thể tải thông tin sản phẩm');
      }
    } catch (err) {
      console.error('Lỗi khi tải sản phẩm:', err);
      setError('Có lỗi xảy ra khi tải thông tin sản phẩm.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchItemDetails();
  }, [url, itemId]);

  const handleQuantityChange = (e) => {
    if (!product) return;
    const value = e.target.value;
    const parsedValue = product.is_loose ? parseFloat(value) : parseInt(value);
    if (isNaN(parsedValue)) return;
    setQuantity(parsedValue);
  };

  const handleAddToCart = async () => {
    if (!product || product.stock_quantity <= 0) return;

    try {
      setIsAddingToCart(true);

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
        navigate('/login');
        return;
      }

      const response = await axios.post(
        `${url}/api/cart/add`,
        {
          item_id: product.id,
          quantity: quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        addToCart(product.id, quantity);
        toast.success(`${quantity} ${product.unit || 'sản phẩm'} "${product.name}" đã được thêm vào giỏ hàng!`);
      } else {
        toast.error(response.data.message || 'Không thể thêm vào giỏ hàng');
      }
    } catch (err) {
      console.error('Lỗi khi thêm vào giỏ hàng:', err);
      toast.error(err.response?.data?.message || 'Lỗi thêm vào giỏ hàng');
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading && !product) {
    return (
      <div className="product-detail-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-detail-error">
        <h3>Lỗi khi tải sản phẩm</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Thử lại</button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-error">
        <h3>Không tìm thấy sản phẩm</h3>
        <p>Sản phẩm bạn tìm kiếm hiện không tồn tại.</p>
        <button onClick={() => navigate('/viewitems')}>Xem sản phẩm khác</button>
      </div>
    );
  }

  // Chuyển đổi đơn vị từ tiếng Anh sang tiếng Việt
  const translateUnit = (unit) => {
    const unitMap = {
      'piece': 'cái',
      'kg': 'kg',
      'g': 'g',
      'ml': 'ml',
      'l': 'l',
      'box': 'hộp',
      'pack': 'gói',
      'bottle': 'chai',
      'can': 'lon'
    };
    return unitMap[unit] || unit;
  };

  const currentCartQuantity = cartItems[product.id] || 0;
  const maxAllowedQuantity = Math.max(0, product.stock_quantity - currentCartQuantity);
  const canAddToCart = maxAllowedQuantity > 0 && quantity > 0;

  return (
    <div className="product-detail-container">
      <div className="product-detail-navigation">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Quay lại
        </button>
      </div>

      <div className="product-detail">
        <div className="product-detail-content">
          <div className="product-detail-image">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="product-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/placeholder.jpg';
                }}
              />
            ) : (
              <div className="image-placeholder">
                <span>Chưa có hình ảnh</span>
              </div>
            )}
          </div>

          <div className="product-detail-info">
            <div className="product-header">
              <h1 className="product-name">{product.name}</h1>
              <div className="product-meta">
                <span className="product-category">{product.category}</span>
                {product.weight_value && (
                  <span className="product-weight">
                    {product.weight_value} {product.weight_unit}
                  </span>
                )}
              </div>
            </div>

            <div className="product-price-section">
              <span className="product-price">
                {parseFloat(product.selling_price).toLocaleString('vi-VN')} VNĐ
              </span>
            </div>

            <div className="product-description">
              <h3>Mô tả sản phẩm</h3>
              <p>{product.description || 'Chưa có mô tả cho sản phẩm này'}</p>
            </div>

            <div className="product-actions">
              <div className="quantity-control">
                <label htmlFor="quantity">Số lượng:</label>
                <div className="quantity-input-group">
                  <button
                    type="button"
                    className="quantity-btn decrease"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    className="quantity-input"
                    value={quantity}
                    onChange={handleQuantityChange}
                    min={1}
                    max={maxAllowedQuantity}
                  />
                  <button
                    type="button"
                    className="quantity-btn increase"
                    onClick={() => setQuantity(Math.min(maxAllowedQuantity, quantity + 1))}
                    disabled={quantity >= maxAllowedQuantity}
                  >
                    +
                  </button>
                </div>
                {currentCartQuantity > 0 && (
                  <div className="cart-quantity-info">
                    Đã có {currentCartQuantity} trong giỏ ({maxAllowedQuantity} còn lại)
                  </div>
                )}
              </div>

              <button
                className={`add-to-cart-button ${!canAddToCart ? 'disabled' : ''}`}
                onClick={handleAddToCart}
                disabled={!canAddToCart || isAddingToCart}
              >
                {isAddingToCart ? (
                  <span className="spinner"></span>
                ) : product.stock_quantity <= 0 ? (
                  'Hết hàng'
                ) : (
                  'Thêm vào giỏ hàng'
                )}
              </button>
            </div>

            <div className="product-stock-info">
              <span
                className={`stock-status ${product.stock_quantity > 0 ? 'in-stock' : 'out-of-stock'}`}
              >
                {product.stock_quantity > 0
                  ? `Còn hàng (${product.stock_quantity} ${translateUnit(product.unit)})`
                  : 'Hết hàng'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="product-reviews-container">
        <h2 className="reviews-title">Đánh giá từ khách hàng</h2>
        <React.Suspense fallback={<div className="loading-reviews">Đang tải đánh giá...</div>}>
          <ErrorBoundary
            fallback={
              <div className="review-error-fallback">
                <h3>Có lỗi xảy ra</h3>
                <p>Không thể tải phần đánh giá sản phẩm.</p>
                <button onClick={() => window.location.reload()}>Thử lại</button>
              </div>
            }
          >
            <ReviewSection itemId={itemId} />
          </ErrorBoundary>
        </React.Suspense>
      </div>
    </div>
  );
};

export default ProductDetail;
