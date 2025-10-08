import { useContext, useEffect, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PlaceOrder = () => {
  const { getTotalCartAmount, token, item_list, cartItems, url } = useContext(StoreContext);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    contactNumber1: "",
    contactNumber2: "",
    specialInstructions: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

  const navigate = useNavigate();

  // 💰 Format tiền VNĐ
  const formatCurrency = (amount) => {
    if (isNaN(amount)) return "0 ₫";
    return amount.toLocaleString("vi-VN") + " ₫";
  };

  // 📱 Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "contactNumber1" || name === "contactNumber2") {
      validatePhoneNumber(name, value);
    }
  };

  // 📞 Kiểm tra định dạng số điện thoại VN
  const validatePhoneNumber = (field, value) => {
    if (field === "contactNumber2" && value === "") {
      setErrors((prev) => ({ ...prev, [field]: "" }));
      return;
    }

    const vnPhoneRegex = /^(0|\+84)(\d{9,10})$/;

    if (!vnPhoneRegex.test(value.replace(/\s|-/g, ""))) {
      setErrors((prev) => ({
        ...prev,
        [field]: "Số điện thoại không hợp lệ (VD: 0912345678 hoặc +84912345678)"
      }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // 🧾 Xác thực form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "Vui lòng nhập tên";
    if (!formData.lastName.trim()) newErrors.lastName = "Vui lòng nhập họ";
    if (!formData.address.trim()) newErrors.address = "Vui lòng nhập địa chỉ giao hàng";
    if (!formData.contactNumber1.trim()) newErrors.contactNumber1 = "Vui lòng nhập số điện thoại chính";
    if (formData.contactNumber2 && errors.contactNumber2) newErrors.contactNumber2 = errors.contactNumber2;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🚀 Gửi đơn hàng
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const orderItems = item_list
        .filter((item) => cartItems[item.id] > 0)
        .map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: cartItems[item.id]
        }));

      if (orderItems.length === 0) {
        setSubmitError("Giỏ hàng của bạn đang trống.");
        setIsSubmitting(false);
        return;
      }

      // 🧮 Tính tổng cộng
      const subtotal = getTotalCartAmount();
      const deliveryFee = 15000;
      const totalAmount = subtotal + deliveryFee;

      // 🔑 Lấy userId từ token
      let userId = null;
      if (token) {
        try {
          const tokenPayload = token.split(".")[1];
          const decodedPayload = JSON.parse(atob(tokenPayload));
          userId = decodedPayload.id;
        } catch {
          console.error("Không thể trích xuất userId từ token");
        }
      }

      const orderData = {
        userId,
        items: orderItems,
        amount: totalAmount,
        address: formData.address,
        firstName: formData.firstName,
        lastName: formData.lastName,
        contactNumber1: formData.contactNumber1,
        contactNumber2: formData.contactNumber2 || null,
        specialInstructions: formData.specialInstructions || null
      };

      const response = await axios.post(`${url}/api/order/place`, orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.data.success && response.data.url) {
        window.location.href = response.data.url; // Chuyển đến trang thanh toán
      } else {
        setSubmitError(response.data.message || "Không thể tạo đơn hàng");
      }
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);
      setSubmitError(
        error.response?.data?.message || "Không thể đặt hàng. Vui lòng thử lại sau."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 📍 Lấy vị trí người dùng (OpenStreetMap)
  const fetchLocation = () => {
    setLocationLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Trình duyệt không hỗ trợ định vị");
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          const data = await res.json();

          const addr = data.address;
          const formattedAddress = `${addr.road || ""} ${addr.house_number || ""}, ${
            addr.suburb || addr.neighbourhood || ""
          }, ${addr.city || addr.town || addr.village || ""}, ${addr.postcode || ""}`;

          setFormData((prev) => ({ ...prev, address: formattedAddress.trim() }));
        } catch {
          setLocationError("Không thể lấy địa chỉ của bạn. Vui lòng nhập thủ công.");
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        setLocationError(`Lỗi định vị: ${error.message}`);
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // 🛡️ Điều hướng nếu không có token hoặc giỏ hàng trống
  useEffect(() => {
    if (!token || getTotalCartAmount() === 0) {
      navigate("/cart");
    }
  }, [token]);

  return (
    <form className="place-order" onSubmit={handleSubmit}>
      {/* Cột trái - Thông tin giao hàng */}
      <div className="place-order-left">
        <p className="title">Thông tin giao hàng</p>

        <div className="multi-fields">
          <input
            type="text"
            placeholder="Tên"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            placeholder="Họ"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="address-field">
          <input
            type="text"
            placeholder="Địa chỉ giao hàng"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
          />
          <button
            type="button"
            className="location-btn"
            onClick={fetchLocation}
            disabled={locationLoading}
          >
            {locationLoading ? "Đang định vị..." : "Lấy vị trí của tôi"}
          </button>
        </div>

        {locationError && <p className="error-message">{locationError}</p>}

        <input
          type="text"
          placeholder="Số điện thoại chính"
          name="contactNumber1"
          value={formData.contactNumber1}
          onChange={handleInputChange}
          required
          className={errors.contactNumber1 ? "input-error" : ""}
        />
        {errors.contactNumber1 && <p className="error-message">{errors.contactNumber1}</p>}

        <input
          type="text"
          placeholder="Số điện thoại phụ (không bắt buộc)"
          name="contactNumber2"
          value={formData.contactNumber2}
          onChange={handleInputChange}
          className={errors.contactNumber2 ? "input-error" : ""}
        />
        {errors.contactNumber2 && <p className="error-message">{errors.contactNumber2}</p>}

        <textarea
          placeholder="Ghi chú cho đơn hàng (không bắt buộc)"
          name="specialInstructions"
          value={formData.specialInstructions}
          onChange={handleInputChange}
          rows="3"
          className="special-instructions"
        />
      </div>

      {/* Cột phải - Tổng đơn hàng */}
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Tổng đơn hàng</h2>
          <div>
            <div className="card-total-details">
              <p>Tạm tính</p>
              <p>{formatCurrency(getTotalCartAmount())}</p>
            </div>
            <hr />
            <div className="card-total-details">
              <p>Phí giao hàng</p>
              <p>{formatCurrency(getTotalCartAmount() === 0 ? 0 : 15000)}</p>
            </div>
            <hr />
            <div className="card-total-details">
              <b>Tổng cộng</b>
              <b>
                {formatCurrency(
                  getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 15000
                )}
              </b>
            </div>
          </div>

          {submitError && <p className="error-message">{submitError}</p>}

          <button
            type="submit"
            disabled={
              getTotalCartAmount() === 0 ||
              Object.values(errors).some((e) => e) ||
              isSubmitting
            }
          >
            {isSubmitting ? "Đang xử lý..." : "TIẾN HÀNH THANH TOÁN"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
