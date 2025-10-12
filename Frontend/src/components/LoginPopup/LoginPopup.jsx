import { useContext, useState } from 'react';
import './LoginPopup.css';
import assets from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const LoginPopup = ({ setShowLogin }) => {
  const { url, setToken } = useContext(StoreContext);

  const [currState, setCurrState] = useState("Đăng nhập");
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  const onLogin = async (event) => {
    event.preventDefault();
    
    // Kiểm tra xác nhận mật khẩu khi đăng ký
    if (currState === "Đăng ký") {
      if (data.password !== data.confirmPassword) {
        toast.error("Mật khẩu xác nhận không khớp!");
        return;
      }
      if (data.password.length < 6) {
        toast.error("Mật khẩu phải có ít nhất 6 ký tự!");
        return;
      }
    }
    
    let newUrl = url;
    if (currState === "Đăng nhập") {
      newUrl += "/api/user/login";
    } else {
      newUrl += "/api/user/register";
    }

    // Chuẩn bị dữ liệu gửi lên server (loại bỏ confirmPassword)
    const submitData = { ...data };
    if (currState === "Đăng ký") {
      delete submitData.confirmPassword;
    }

    try {
      const response = await axios.post(newUrl, submitData);

      if (response.data.success) {
        // Lưu token vào localStorage
        const authToken = response.data.token;
        setToken(authToken);
        localStorage.setItem("token", authToken);

        // Gắn token vào header mặc định
        axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

        toast.success("Đăng nhập thành công!");
        setShowLogin(false);
      } else {
        toast.error(response.data.message || "Tài khoản hoặc mật khẩu không đúng");
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      if (error.response?.status === 401) {
        toast.error("Tài khoản hoặc mật khẩu không đúng");
      } else if (error.response?.status === 400) {
        toast.error("Vui lòng kiểm tra lại thông tin đăng nhập");
      } else if (error.code === 'NETWORK_ERROR') {
        toast.error("Không thể kết nối đến server. Vui lòng thử lại sau");
      } else {
        toast.error(error.response?.data?.message || "Đăng nhập thất bại, vui lòng thử lại");
      }
    }
  };

  return (
    <div className="login-popup">
      <form onSubmit={onLogin} className="login-popup-container">
        <div className="login-popup-title">
          <h2>{currState}</h2>
          <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="Đóng" />
        </div>

        <div className="login-popup-inputs">
          {currState === "Đăng nhập" ? null : (
            <input
              name="name"
              onChange={onChangeHandler}
              value={data.name}
              type="text"
              placeholder="Họ và tên"
              required
            />
          )}
          <input
            name="email"
            onChange={onChangeHandler}
            value={data.email}
            type="email"
            placeholder="Email"
            required
          />
          <input
            name="password"
            onChange={onChangeHandler}
            value={data.password}
            type="password"
            placeholder="Mật khẩu"
            required
          />
          {currState === "Đăng ký" && (
            <input
              name="confirmPassword"
              onChange={onChangeHandler}
              value={data.confirmPassword}
              type="password"
              placeholder="Xác nhận mật khẩu"
              required
            />
          )}
        </div>

        <button type="submit">
          {currState === "Đăng ký" ? "Tạo tài khoản" : "Đăng nhập"}
        </button>


        {currState === "Đăng nhập" ? (
          <p>
            Chưa có tài khoản?{" "}
            <span onClick={() => {
              setCurrState("Đăng ký");
              setData({ name: "", email: "", password: "", confirmPassword: "" });
            }}>Đăng ký ngay</span>
          </p>
        ) : (
          <p>
            Đã có tài khoản?{" "}
            <span onClick={() => {
              setCurrState("Đăng nhập");
              setData({ name: "", email: "", password: "", confirmPassword: "" });
            }}>Đăng nhập tại đây</span>
          </p>
        )}
      </form>
    </div>
  );
};

export default LoginPopup;
