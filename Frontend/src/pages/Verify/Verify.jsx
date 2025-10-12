import React, { useContext, useEffect, useState, useCallback } from 'react';
import './Verify.css';
import { useSearchParams } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';

const Verify = () => {
  const [searchParams] = useSearchParams();
  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");
  const paymentMethod = searchParams.get("paymentMethod") || "stripe";
  const message = searchParams.get("message");
  const { url } = useContext(StoreContext);
  
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState({
    isVerified: false,
    message: ''
  });

  // ✅ Xác minh thanh toán
  const verifyPayment = useCallback(async () => {
    try {
      // Ensure success is a string "true" or "false"
      const successParam = success === "true" ? "true" : "false";
      console.log(`🔍 Frontend sending verify request: orderId=${orderId}, success=${successParam}, paymentMethod=${paymentMethod}`);
      
      const response = await axios.post(`${url}/api/order/verify`, { 
        success: successParam, 
        orderId, 
        paymentMethod 
      });

      console.log(`📋 Frontend received response:`, response.data);

      if (response.data.success) {
        const isMock = searchParams.get("mock") === "true";
        const paymentText = paymentMethod === "momo" ? "MoMo" : "Test Payment";
        const mockText = isMock ? " (Test Mode)" : "";
        
        setVerificationStatus({
          isVerified: true,
          message: `Thanh toán qua ${paymentText} thành công!${mockText} Đơn hàng của bạn đã được ghi nhận.`
        });
      } else {
        setVerificationStatus({
          isVerified: false,
          message: response.data.message || message || 'Xác minh thanh toán thất bại. Vui lòng liên hệ hỗ trợ.'
        });
      }
    } catch (error) {
      console.error("Lỗi khi xác minh thanh toán:", error);
      
      // Extract error message from response if available
      let errorMessage = message || 'Đã xảy ra lỗi trong quá trình xác minh thanh toán. Vui lòng liên hệ hỗ trợ.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setVerificationStatus({
        isVerified: false,
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  }, [url, success, orderId, paymentMethod, message]);

  useEffect(() => {
    if (orderId && success !== null) {
      verifyPayment();
    } else {
      setLoading(false);
      setVerificationStatus({
        isVerified: false,
        message: 'Thông tin thanh toán không hợp lệ. Vui lòng liên hệ hỗ trợ.'
      });
    }
  }, [orderId, success, verifyPayment]);

  // 🧭 Điều hướng tự động phù hợp với domain hiện tại
  const baseUrl = window.location.origin;

  const handleViewOrders = () => {
    window.location.href = `${baseUrl}/myorders`;
  };

  const handleGoHome = () => {
    window.location.href = `${baseUrl}/`;
  };

  const handleShopMore = () => {
    window.location.href = `${baseUrl}/viewitems`;
  };

  return (
    <div className="verify">
      {loading ? (
        <div className="verify-container">
          <div className="spinner"></div>
          <p className="loading-text">Đang xác minh thanh toán của bạn...</p>
        </div>
      ) : (
        <div className="payment-status">
          <div className={`status-icon ${verificationStatus.isVerified ? 'success' : 'failure'}`}>
            {verificationStatus.isVerified ? '✓' : '✗'}
          </div>

          <h2>
            {verificationStatus.isVerified ? 'Thanh toán thành công!' : 'Có vấn đề khi thanh toán'}
          </h2>

          <p>{verificationStatus.message}</p>

          <div className="action-buttons">
            {verificationStatus.isVerified ? (
              <>
                <button className="view-orders-btn" onClick={handleViewOrders}>
                  Xem đơn hàng của tôi
                </button>
                <button className="shop-more-btn" onClick={handleShopMore}>
                  Tiếp tục mua sắm
                </button>
              </>
            ) : (
              <button className="go-home-btn" onClick={handleGoHome}>
                Quay lại trang chủ
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Verify;
