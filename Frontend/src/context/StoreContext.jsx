import { createContext, useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { toast } from "react-toastify";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const url = "http://localhost:4000";
  const [token, setToken] = useState("");
  const [item_list, setItemList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🛒 Thêm sản phẩm vào giỏ
  const addToCart = async (id, quantity = 1) => {
    if (!id) {
      console.error("ID sản phẩm không hợp lệ");
      return;
    }

    if (!token) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
      return;
    }

    setLoading(true);

    try {
      // Cập nhật số lượng mới
      const newQuantity = quantity;

      // Cập nhật tạm thời trong giao diện (optimistic UI)
      setCartItems(prev => ({
        ...prev,
        [id]: newQuantity
      }));

      console.log(`🛍 Cập nhật giỏ hàng: Sản phẩm ${id} số lượng = ${newQuantity}`);
      return true;
    } catch (err) {
      console.error("Lỗi khi thêm vào giỏ:", err);

      // Khôi phục lại trạng thái trước đó
      setCartItems(prev => {
        const prevQty = prev[id] || 0;
        return { ...prev, [id]: prevQty };
      });

      setError("Không thể cập nhật giỏ hàng");
      toast.error("Không thể cập nhật giỏ hàng");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ❌ Xóa hoặc giảm số lượng trong giỏ hàng
  const removeFromCart = async (itemId) => {
    if (!itemId) {
      console.error("ID sản phẩm không hợp lệ khi xóa");
      return;
    }

    setLoading(true);

    try {
      const currentQuantity = cartItems[itemId] || 0;
      if (currentQuantity <= 0) {
        console.warn(`Sản phẩm ${itemId} đã có số lượng = 0`);
        setLoading(false);
        return;
      }

      const newQuantity = currentQuantity - 1;
      console.log(`Giảm số lượng sản phẩm ${itemId}: ${currentQuantity} → ${newQuantity}`);

      // Cập nhật tạm thời giao diện
      setCartItems(prev => ({
        ...prev,
        [itemId]: newQuantity,
      }));

      // Nếu đã đăng nhập thì cập nhật server
      if (token) {
        if (newQuantity > 0) {
          console.log(`Cập nhật số lượng sản phẩm ${itemId} = ${newQuantity}`);
          const response = await axios.post(
            `${url}/api/cart/add`,
            { item_id: itemId, quantity: newQuantity },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          if (!response.data.success)
            throw new Error(response.data.message || "Cập nhật giỏ hàng thất bại");
        } else {
          console.log(`Xóa sản phẩm ${itemId} khỏi giỏ`);
          const response = await axios.post(
            `${url}/api/cart/remove`,
            { item_id: itemId },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          if (!response.data.success)
            throw new Error(response.data.message || "Xóa sản phẩm thất bại");
        }
      }
    } catch (err) {
      console.error("Lỗi khi xóa sản phẩm:", err);
      // Hoàn tác lại thao tác vừa rồi
      setCartItems(prev => ({
        ...prev,
        [itemId]: (prev[itemId] || 0) + 1,
      }));
      setError(err.message || "Không thể cập nhật giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  // 💰 Tính tổng tiền giỏ hàng
  const getTotalCartAmount = () => {
    if (!item_list || item_list.length === 0) {
      console.log("Danh sách sản phẩm trống, không thể tính tổng");
      return 0;
    }

    let total = 0;
    for (const itemId in cartItems) {
      if (cartItems[itemId] > 0) {
        const itemInfo = item_list.find(
          product =>
            String(product._id) === String(itemId) ||
            product.id === itemId ||
            String(product.id) === String(itemId)
        );

        if (itemInfo) {
          const price = parseFloat(itemInfo.price || itemInfo.selling_price || 0);
          const qty = parseFloat(cartItems[itemId]);

          if (!isNaN(price) && !isNaN(qty) && price > 0 && qty > 0) {
            const subtotal = price * qty;
            total += subtotal;
            console.log(`🧾 ${itemId}: ${qty} x ${price} = ${subtotal}`);
          } else {
            console.warn(`Giá hoặc số lượng không hợp lệ cho sản phẩm ${itemId}`);
          }
        } else {
          console.warn(`Không tìm thấy sản phẩm ${itemId} trong danh sách`);
          setCartItems(prev => {
            const newCart = { ...prev };
            delete newCart[itemId];
            return newCart;
          });
        }
      }
    }

    console.log(`💵 Tổng tiền giỏ hàng: ${total}`);
    return total;
  };

  // 📦 Lấy danh sách sản phẩm từ server
  const fetchItemList = async () => {
    try {
      const response = await axios.get(`${url}/api/item/list`);
      setItemList(response.data.data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách sản phẩm:", err);
      setError(err.response?.data?.message || "Không thể tải danh sách sản phẩm");
    }
  };

  // 🚪 Đăng xuất
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common['Authorization'];
    setToken("");
    setCartItems({});
  }, []);

  // 🛍 Lấy giỏ hàng của người dùng từ server
  const fetchUserCart = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await axios.get(`${url}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("📥 Dữ liệu giỏ hàng từ server:", response.data);

      if (response.data.success) {
        const cartData = {};
        const items = response.data.data?.items || response.data.data || [];

        items.forEach(item => {
          const itemId = item.item_id || item.id || item._id;
          if (itemId) {
            cartData[itemId] = item.quantity;
            console.log(`✅ Thêm sản phẩm ${itemId} với số lượng ${item.quantity}`);
          }
        });

        setCartItems(cartData);
      } else {
        console.warn("Không thể lấy giỏ hàng:", response.data);
      }
    } catch (err) {
      console.error("Lỗi khi tải giỏ hàng người dùng:", err);
      if (err.response?.status === 401) {
        console.warn("Phiên đăng nhập hết hạn → tự động đăng xuất");
        logout();
      }
      setError(err.response?.data?.message || "Không thể tải giỏ hàng");
    } finally {
      setLoading(false);
    }
  }, [token, url, logout]);

  // 🧍‍♂️ Lấy ID người dùng từ token
  const getUserId = () => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch (error) {
      console.error("Lỗi khi giải mã token:", error);
      return null;
    }
  };

  // ⚙️ Khởi động: lấy danh sách sản phẩm + token lưu sẵn
  useEffect(() => {
    async function initData() {
      await fetchItemList();
      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        console.log("🔑 Token đã lưu, khôi phục đăng nhập");
        setToken(savedToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      }
    }
    initData();
  }, []);

  // 🔄 Lấy giỏ hàng khi token thay đổi
  useEffect(() => {
    if (token) {
      console.log("🔁 Token hợp lệ - đang tải dữ liệu giỏ hàng");
      fetchUserCart();
    }
  }, [token, fetchUserCart]);

  const contextValue = {
    item_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
    loading,
    error,
    logout,
    getUserId,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

StoreContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default StoreContextProvider;
