import React, { useState } from 'react';
import './PaymentMethod.css';

const PaymentMethod = ({ selectedMethod, onMethodChange, totalAmount }) => {
  const [showMomoInfo, setShowMomoInfo] = useState(false);

  const paymentMethods = [
    {
      id: 'stripe',
      name: 'Thẻ tín dụng (Test)',
      icon: '💳',
      description: 'Thanh toán test - nhấn là thành công ngay',
      available: true
    },
    {
      id: 'momo',
      name: 'Ví MoMo',
      icon: '📱',
      description: 'Thanh toán qua ví điện tử MoMo',
      available: true
    }
  ];

  return (
    <div className="payment-method-container">
      <h3>Phương thức thanh toán</h3>
      
      <div className="payment-methods">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`payment-method-card ${selectedMethod === method.id ? 'selected' : ''} ${!method.available ? 'disabled' : ''}`}
            onClick={() => method.available && onMethodChange(method.id)}
          >
            <div className="payment-method-icon">
              {method.icon}
            </div>
            <div className="payment-method-info">
              <h4>{method.name}</h4>
              <p>{method.description}</p>
              {!method.available && (
                <span className="unavailable-badge">Tạm thời không khả dụng</span>
              )}
            </div>
            <div className="payment-method-radio">
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={selectedMethod === method.id}
                onChange={() => method.available && onMethodChange(method.id)}
                disabled={!method.available}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Momo Payment Info */}
      {selectedMethod === 'momo' && (
        <div className="momo-payment-info">
          <div className="momo-info-header">
            <span className="momo-icon">📱</span>
            <h4>Thanh toán qua MoMo</h4>
          </div>
          
          <div className="momo-info-content">
            <p>Bạn sẽ được chuyển đến trang thanh toán MoMo để hoàn tất giao dịch.</p>
            
            <div className="momo-steps">
              <div className="step">
                <span className="step-number">1</span>
                <span className="step-text">Nhấn "Tiến hành thanh toán"</span>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <span className="step-text">Chuyển đến trang MoMo</span>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <span className="step-text">Quét QR hoặc nhập thông tin</span>
              </div>
              <div className="step">
                <span className="step-number">4</span>
                <span className="step-text">Xác nhận thanh toán</span>
              </div>
            </div>

            <div className="momo-security">
              <span className="security-icon">🔒</span>
              <span>Giao dịch được bảo mật bởi MoMo</span>
            </div>
          </div>
        </div>
      )}

      {/* Stripe Payment Info */}
      {selectedMethod === 'stripe' && (
        <div className="stripe-payment-info">
          <div className="stripe-info-header">
            <span className="stripe-icon">💳</span>
            <h4>Thanh toán bằng thẻ</h4>
          </div>
          
          <div className="stripe-info-content">
            <p><strong>Chế độ Test:</strong> Thanh toán sẽ thành công ngay lập tức khi bạn nhấn nút.</p>
            
            <div className="stripe-features">
              <div className="feature">
                <span className="feature-icon">🧪</span>
                <span>Test Mode - Không cần thông tin thẻ</span>
              </div>
              <div className="feature">
                <span className="feature-icon">⚡</span>
                <span>Thanh toán tức thì</span>
              </div>
              <div className="feature">
                <span className="feature-icon">✅</span>
                <span>Luôn thành công</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethod;
