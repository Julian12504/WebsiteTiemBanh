import React, { useContext } from 'react';
import "./Cart.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cartItems, item_list, removeFromCart, getTotalCartAmount } = useContext(StoreContext);
  const navigate = useNavigate();

  // Hàm định dạng tiền tệ VNĐ
  const formatCurrency = (amount) => {
    if (isNaN(amount)) return '0 ₫';
    return amount.toLocaleString('vi-VN') + ' ₫';
  };

  // Phí giao hàng cố định
  const deliveryFee = getTotalCartAmount() === 0 ? 0 : 15000; // ví dụ: 15.000₫

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
            return (
              <div key={item.id}>
                <div className="cart-items-title cart-items-item">
                  <img src={item.image} alt={item.name} />
                  <p>{item.name}</p>
                  <p>{formatCurrency(item.selling_price || item.price || 0)}</p>
                  <p>{cartItems[item.id]}</p>
                  <p>{formatCurrency((item.selling_price || item.price || 0) * cartItems[item.id])}</p>
                  <p 
                    onClick={() => removeFromCart(item.id)} 
                    className="cross"
                    title="Xóa sản phẩm khỏi giỏ"
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
    </div>
  );
};

export default Cart;
