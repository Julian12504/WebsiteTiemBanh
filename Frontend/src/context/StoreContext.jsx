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
  const [pendingCartItem, setPendingCartItem] = useState(null); // Lưu sản phẩm pending khi chưa đăng nhập
  const [showLoginPopup, setShowLoginPopup] = useState(false); // Hiển thị popup đăng nhập

  // 🛒 Thêm sản phẩm vào giỏ
  const addToCart = async (id, quantity = 1) => {
    if (!id) {
      console.error("ID sản phẩm không hợp lệ");
      return;
    }

    if (!token) {
      // Lưu sản phẩm pending và redirect đến trang đăng nhập
      const item = item_list.find(item => 
        String(item._id) === String(id) || 
        String(item.id) === String(id)
      );

      if (!item) {
        toast.error("Không tìm thấy sản phẩm");
        return;
      }

      const stockQuantity = parseFloat(item.stock_quantity) || 0;
      
      if (stockQuantity <= 0) {
        toast.error("Sản phẩm đã hết hàng");
        return;
      }

      // Lưu thông tin sản phẩm pending
      setPendingCartItem({
        id: id,
        quantity: quantity,
        item: item
      });

      toast.info("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
      
      // Hiển thị popup đăng nhập
      setShowLoginPopup(true);
      
      return false; // Trả về false để component biết chưa thành công
    }

    // Kiểm tra số lượng tồn kho trước khi thêm vào giỏ
    const item = item_list.find(item => 
      String(item._id) === String(id) || 
      String(item.id) === String(id)
    );

    if (!item) {
      toast.error("Không tìm thấy sản phẩm");
      return;
    }

    const stockQuantity = parseFloat(item.stock_quantity) || 0;
    const currentCartQuantity = cartItems[id] || 0;
    const totalQuantity = currentCartQuantity + quantity;

    if (stockQuantity <= 0) {
      toast.error("Sản phẩm đã hết hàng");
      return;
    }

    if (totalQuantity > stockQuantity) {
      toast.error(`Số lượng tồn kho chỉ còn ${stockQuantity} ${item.unit || 'cái'}`);
      return;
    }

    setLoading(true);

    try {
      // Cập nhật số lượng mới
      const newQuantity = totalQuantity;

      // Cập nhật tạm thời trong giao diện (optimistic UI)
      setCartItems(prev => ({
        ...prev,
        [id]: newQuantity
      }));

      console.log(`🛍 Thêm vào giỏ hàng: Sản phẩm ${id} số lượng = ${quantity} (Tổng: ${newQuantity})`);
      toast.success(`Đã thêm ${quantity} ${item.unit || 'cái'} vào giỏ hàng`);
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

  // ❌ Giảm số lượng trong giỏ hàng (giảm 1)
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

  // 🗑️ Xóa hoàn toàn sản phẩm khỏi giỏ hàng
  const clearFromCart = async (itemId) => {
    if (!itemId) {
      console.error("ID sản phẩm không hợp lệ khi xóa hoàn toàn");
      return;
    }

    setLoading(true);

    try {
      console.log(`🗑️ Xóa hoàn toàn sản phẩm ${itemId} khỏi giỏ hàng`);

      // Xóa khỏi state local
      setCartItems(prev => {
        const newCart = { ...prev };
        delete newCart[itemId];
        return newCart;
      });

      // Nếu đã đăng nhập thì xóa khỏi server
      if (token) {
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

      toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
      console.log(`✅ Đã xóa hoàn toàn sản phẩm ${itemId}`);
    } catch (err) {
      console.error("Lỗi khi xóa sản phẩm:", err);
      // Hoàn tác lại thao tác
      setCartItems(prev => ({
        ...prev,
        [itemId]: cartItems[itemId] || 0,
      }));
      toast.error("Không thể xóa sản phẩm khỏi giỏ hàng");
      setError(err.message || "Không thể xóa sản phẩm khỏi giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  // 🔢 Cập nhật số lượng sản phẩm trong giỏ
  const updateCartQuantity = async (itemId, newQuantity) => {
    if (!itemId || newQuantity < 0) {
      console.error("ID sản phẩm hoặc số lượng không hợp lệ");
      return;
    }

    // Tìm sản phẩm để kiểm tra số lượng tồn kho
    const item = item_list.find(item => 
      String(item._id) === String(itemId) ||
      item.id === itemId ||
      String(item.id) === String(itemId)
    );
    
    if (!item) {
      console.error("Không tìm thấy sản phẩm");
      return;
    }

    // Kiểm tra số lượng tồn kho
    const stockQuantity = parseFloat(item.stock_quantity) || 0;
    if (newQuantity > stockQuantity) {
      toast.error(`Số lượng tồn kho chỉ còn ${stockQuantity} ${item.unit || 'cái'}`);
      return;
    }

    setLoading(true);

    try {
      // Cập nhật số lượng mới
      setCartItems(prev => ({
        ...prev,
        [itemId]: newQuantity
      }));

      // Nếu đã đăng nhập thì cập nhật server
      if (token) {
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
      }

      console.log(`🔢 Cập nhật số lượng sản phẩm ${itemId}: ${newQuantity}`);
      return true;
    } catch (err) {
      console.error("Lỗi khi cập nhật số lượng:", err);
      toast.error("Không thể cập nhật số lượng sản phẩm");
      return false;
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
    toast.success("Đã đăng xuất thành công!");
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
      
      // Tự động thêm sản phẩm pending sau khi đăng nhập
      if (pendingCartItem) {
        console.log("🛒 Tự động thêm sản phẩm pending sau khi đăng nhập:", pendingCartItem);
        setTimeout(() => {
          addToCart(pendingCartItem.id, pendingCartItem.quantity);
          setPendingCartItem(null); // Xóa pending item sau khi thêm
          toast.success(`Đã thêm ${pendingCartItem.quantity} ${pendingCartItem.item.unit || 'cái'} "${pendingCartItem.item.name}" vào giỏ hàng!`);
        }, 1000); // Delay 1 giây để đảm bảo cart đã load xong
      }
    }
  }, [token, fetchUserCart, pendingCartItem]);

  const contextValue = {
    item_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    clearFromCart,
    updateCartQuantity,
    getTotalCartAmount,
    url,
    token,
    setToken,
    loading,
    error,
    logout,
    getUserId,
    pendingCartItem,
    setPendingCartItem,
    showLoginPopup,
    setShowLoginPopup,
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
