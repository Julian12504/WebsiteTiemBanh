import React, { useContext } from 'react';
import "./Cart.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cartItems, item_list, removeFromCart, clearFromCart, updateCartQuantity, getTotalCartAmount } = useContext(StoreContext);
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState(null);

  // Hàm định dạng tiền tệ VNĐ
  const formatCurrency = (amount) => {
    if (isNaN(amount)) return '0 ₫';
    return amount.toLocaleString('vi-VN') + ' ₫';
  };

  // Phí giao hàng cố định
  const deliveryFee = getTotalCartAmount() === 0 ? 0 : 15000; // ví dụ: 15.000₫

  // Xử lý xác nhận xóa
  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      clearFromCart(itemToDelete.id);
    }
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  return (
    <div className="cart">
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Sản phẩm</p>
          <p>Tên</p>
          <p>Đơn giá</p>
          <p>Số lượng</p>
          <p>Tạm tính</p>
          <p>Xóa</p>
        </div>
        <br />
        <hr />
        {item_list.map((item) => {
          if (cartItems[item.id] > 0) {
            const currentQuantity = cartItems[item.id];
            const stockQuantity = parseFloat(item.stock_quantity) || 0;
            
            return (
              <div key={item.id}>
                <div className="cart-items-title cart-items-item">
                  <img src={item.image} alt={item.name} />
                  <p>{item.name}</p>
                  <p>{formatCurrency(item.selling_price || item.price || 0)}</p>
                  <div className="quantity-controls">
                    <button 
                      className="quantity-btn decrease"
                      onClick={() => updateCartQuantity(item.id, currentQuantity - 1)}
                      disabled={currentQuantity <= 1}
                      title="Giảm số lượng"
                    >
                      −
                    </button>
                    <input 
                      type="number"
                      className="quantity-input"
                      value={currentQuantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (isNaN(value) || value < 1) {
                          updateCartQuantity(item.id, 1);
                        } else if (value > stockQuantity) {
                          updateCartQuantity(item.id, stockQuantity);
                          toast.warning(`Số lượng tối đa là ${stockQuantity} ${item.unit || 'cái'}`);
                        } else {
                          updateCartQuantity(item.id, value);
                        }
                      }}
                      min="1"
                      max={stockQuantity}
                      title={`Nhập số lượng (1-${stockQuantity})`}
                    />
                    <button 
                      className="quantity-btn increase"
                      onClick={() => updateCartQuantity(item.id, currentQuantity + 1)}
                      disabled={currentQuantity >= stockQuantity}
                      title="Tăng số lượng"
                    >
                      +
                    </button>
                    {currentQuantity >= stockQuantity && (
                      <span className="stock-warning">Hết hàng</span>
                    )}
                  </div>
                  <p>{formatCurrency((item.selling_price || item.price || 0) * cartItems[item.id])}</p>
                  <p 
                    onClick={() => handleDeleteClick(item)} 
                    className="cross"
                    title="Xóa hoàn toàn sản phẩm khỏi giỏ hàng"
                  >
                    ×
                  </p>
                </div>
                <hr />
              </div>
            );
          }
          return null;
        })}

        {Object.keys(cartItems).length === 0 && (
          <p className="empty-cart">Giỏ hàng của bạn đang trống.</p>
        )}
      </div>

      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Tổng thanh toán</h2>
          <div>
            <div className="cart-total-details">
              <p>Tạm tính</p>
              <p>{formatCurrency(getTotalCartAmount())}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Phí giao hàng</p>
              <p>{formatCurrency(deliveryFee)}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Tổng cộng </b>
              <b>{formatCurrency(getTotalCartAmount() + deliveryFee)}</b>
            </div>
          </div>
          <button 
            onClick={() => navigate('/order')}
            disabled={getTotalCartAmount() === 0}
            className={getTotalCartAmount() === 0 ? 'disabled' : ''}
          >
            Thanh toán
          </button>
        </div>
      </div>

      {/* Popup xác nhận xóa */}
      {showDeleteConfirm && (
        <div className="delete-confirm-overlay" onClick={cancelDelete}>
          <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-confirm-header">
              <h3>Xác nhận xóa</h3>
            </div>
            <div className="delete-confirm-body">
              <p>Bạn có chắc chắn muốn xóa sản phẩm</p>
              <p className="delete-item-name">"{itemToDelete?.name}"</p>
              <p>khỏi giỏ hàng không?</p>
            </div>
            <div className="delete-confirm-footer">
              <button className="btn-cancel" onClick={cancelDelete}>
                Hủy
              </button>
              <button className="btn-confirm" onClick={confirmDelete}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
