import React, { useState, useEffect, useContext, useCallback } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { AdminAuthContext } from '../../context/AdminAuthContext';
import './POS.css';

const POS = ({ url }) => {
  const { token } = useContext(AdminAuthContext);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountReceived, setAmountReceived] = useState('');
  const [change, setChange] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState([]);

  // Chuyển đổi category từ tiếng Anh sang tiếng Việt
  const translateCategory = (category) => {
    const categoryMap = {
      'Cake': 'Bánh',
      'Cake Ingredients': 'Nguyên liệu làm bánh',
      'Party Items': 'Đồ trang trí tiệc'
    };
    return categoryMap[category] || category;
  };

  // Lấy danh sách sản phẩm
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${url}/api/item/list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        const items = response.data.data;
        setProducts(items);
        setFilteredProducts(items);
        const uniqueCategories = [...new Set(items.map(item => translateCategory(item.category)))];
        setCategories(uniqueCategories);
      } else {
        setError("Không thể tải danh sách sản phẩm");
        toast.error("Không thể tải kho hàng");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Lỗi khi tải sản phẩm, vui lòng thử lại.");
      toast.error(error.response?.data?.message || "Lỗi khi tải sản phẩm");
    } finally {
      setLoading(false);
    }
  }, [url, token]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Lọc sản phẩm
  useEffect(() => {
    let filtered = products;
    if (categoryFilter !== 'all') {
      // Tìm category gốc từ category đã dịch
      const originalCategory = Object.keys({
        'Cake': 'Bánh',
        'Cake Ingredients': 'Nguyên liệu làm bánh',
        'Party Items': 'Đồ trang trí tiệc'
      }).find(key => translateCategory(key) === categoryFilter);
      filtered = filtered.filter(p => p.category === originalCategory);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.sku?.toLowerCase().includes(term) ||
        p.barcode?.toLowerCase().includes(term)
      );
    }
    setFilteredProducts(filtered);
  }, [products, searchTerm, categoryFilter]);

  // Cập nhật tổng tiền
  useEffect(() => {
    const newTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotal(newTotal);
    setAmountReceived('');
    setChange(0);
  }, [cart]);

  // Tính tiền thối
  useEffect(() => {
    if (amountReceived) {
      const received = parseFloat(amountReceived);
      const changeAmount = received - total;
      setChange(changeAmount >= 0 ? changeAmount : 0);
    } else {
      setChange(0);
    }
  }, [amountReceived, total]);

  // Thêm sản phẩm vào giỏ
  const addToCart = (product) => {
    if (product.stock_quantity <= 0) {
      toast.error(`${product.name} đã hết hàng`);
      return;
    }

    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity + 1 > product.stock_quantity) {
        toast.error(`Chỉ còn ${product.stock_quantity} ${product.unit} trong kho`);
        return;
      }
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, {
        id: product.id,
        name: product.name,
        price: parseFloat(product.selling_price),
        quantity: 1,
        unit: product.unit,
        image: product.image,
        stock: product.stock_quantity
      }]);
    }
    toast.success(`Đã thêm ${product.name} vào giỏ`);
  };

  // Cập nhật số lượng
  const updateQuantity = (id, newQuantity) => {
    const product = products.find(p => p.id === id);
    const cartItem = cart.find(item => item.id === id);
    if (!product || !cartItem) return;

    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== id));
      toast.info(`Đã xóa ${cartItem.name} khỏi giỏ`);
      return;
    }

    if (newQuantity > product.stock_quantity) {
      toast.error(`Chỉ còn ${product.stock_quantity} ${product.unit} trong kho`);
      return;
    }

    setCart(cart.map(item => item.id === id ? { ...item, quantity: newQuantity } : item));
  };

  // Xóa sản phẩm
  const removeItem = (id) => setCart(cart.filter(item => item.id !== id));
  const clearCart = () => {
    setCart([]);
    setCustomerInfo({ firstName: '', lastName: '', phone: '' });
    setPaymentMethod('cash');
    setAmountReceived('');
    setChange(0);
  };

  // Thanh toán
  const processSale = async () => {
    if (cart.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }
    if (paymentMethod === 'cash' && (!amountReceived || parseFloat(amountReceived) < total)) {
      toast.error("Số tiền nhận phải lớn hơn hoặc bằng tổng tiền");
      return;
    }

    try {
      setProcessing(true);
      const orderData = {
        items: cart.map(item => ({ id: item.id, quantity: item.quantity })),
        customer: {
          firstName: customerInfo.firstName || 'Khách',
          lastName: customerInfo.lastName || 'Lẻ',
          contactNumber: customerInfo.phone || '',
        },
        payment: true,
        paymentMethod,
        amount: total,
        status: 'Delivered',
        orderType: 'pos'
      };

      const response = await axios.post(`${url}/api/order/create-pos`, orderData, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (response.data.success) {
        toast.success("Thanh toán thành công");
        generateReceipt(response.data.orderId, orderData);
        clearCart();
      } else toast.error(response.data.message || "Không thể xử lý giao dịch");
    } catch (error) {
      console.error("Error processing sale:", error);
      toast.error(error.response?.data?.message || "Lỗi xử lý giao dịch");
    } finally {
      setProcessing(false);
    }
  };

  // In hóa đơn
  const generateReceipt = (orderId, orderData) => {
    const receiptWindow = window.open('', '_blank');
    receiptWindow.document.write(`
      <html>
        <head>
          <title>Hóa đơn #${orderId}</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; width: 80mm; }
            .receipt { width: 100%; }
            .receipt-header { text-align: center; border-bottom: 1px dashed #000; margin-bottom: 10px; }
            .receipt-header h1 { font-size: 18px; margin: 0; }
            .receipt-header p { font-size: 12px; margin: 2px 0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 4px; font-size: 12px; text-align: left; }
            td:last-child, th:last-child { text-align: right; }
            .total-line { display: flex; justify-content: space-between; font-size: 12px; margin: 4px 0; }
            .grand-total { font-weight: bold; border-top: 1px solid #000; padding-top: 4px; }
            .receipt-footer { text-align: center; border-top: 1px dashed #000; padding-top: 10px; font-size: 12px; }
            @media print { body { width: 80mm; margin: 0; } }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="receipt-header">
              <h1>Cake Shop</h1>
              <p>123 Đường Bánh Ngọt, TP. HCM</p>
              <p>Điện thoại: 0909 123 456</p>
              <p>Hóa đơn #${orderId}</p>
              <p>${new Date().toLocaleString('vi-VN')}</p>
            </div>

            <div class="customer-info">
              <p>Khách hàng: ${orderData.customer.firstName} ${orderData.customer.lastName}</p>
              ${orderData.customer.contactNumber ? `<p>SĐT: ${orderData.customer.contactNumber}</p>` : ''}
            </div>

            <table>
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>SL</th>
                  <th>Đơn giá</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                ${cart.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity} ${item.unit}</td>
                    <td>${item.price.toLocaleString('vi-VN')} ₫</td>
                    <td>${(item.price * item.quantity).toLocaleString('vi-VN')} ₫</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="total-line"><span>Tạm tính:</span><span>${total.toLocaleString('vi-VN')} ₫</span></div>
            <div class="total-line grand-total"><span>Tổng cộng:</span><span>${total.toLocaleString('vi-VN')} ₫</span></div>
            <div class="total-line"><span>Hình thức thanh toán:</span><span>${paymentMethod === 'cash' ? 'Tiền mặt' : paymentMethod === 'card' ? 'Thẻ' : 'Online'}</span></div>
            ${paymentMethod === 'cash' ? `
              <div class="total-line"><span>Khách đưa:</span><span>${parseFloat(amountReceived).toLocaleString('vi-VN')} ₫</span></div>
              <div class="total-line"><span>Tiền thối:</span><span>${change.toLocaleString('vi-VN')} ₫</span></div>
            ` : ''}
            <div class="receipt-footer"><p>Cảm ơn quý khách! Hẹn gặp lại!</p></div>
          </div>
          <script>
            window.onload = function() { window.print(); setTimeout(() => window.close(), 500); };
          </script>
        </body>
      </html>
    `);
    receiptWindow.document.close();
  };

  return (
    <div className="pos-container">
      <div className="pos-header">
        <h1>Bán hàng (POS)</h1>
      </div>

      <div className="pos-layout">
        {/* Trái - Danh sách sản phẩm */}
        <div className="pos-products-section">
          <div className="pos-search-container">
            <input
              type="text"
              placeholder="Tìm theo tên, SKU hoặc mã vạch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pos-search-input"
            />

            <div className="pos-category-filter">
              <button className={categoryFilter === 'all' ? 'active' : ''} onClick={() => setCategoryFilter('all')}>
                Tất cả
              </button>
              {categories.map(category => (
                <button key={category} className={categoryFilter === category ? 'active' : ''} onClick={() => setCategoryFilter(category)}>
                  {category}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="pos-loading"><div className="loading-spinner"></div><p>Đang tải sản phẩm...</p></div>
          ) : error ? (
            <div className="pos-error"><p>{error}</p><button onClick={fetchProducts}>Thử lại</button></div>
          ) : (
            <div className="pos-products-grid">
              {filteredProducts.length === 0 ? (
                <p className="no-products-message">Không có sản phẩm</p>
              ) : (
                filteredProducts.map(product => (
                  <div 
                    key={product.id} 
                    className={`pos-product-card ${product.stock_quantity <= 0 ? 'out-of-stock' : ''}`}
                    onClick={() => product.stock_quantity > 0 && addToCart(product)}
                  >
                    <div className="pos-product-image"><img src={product.image} alt={product.name} /></div>
                    <div className="pos-product-info">
                      <h3>{product.name}</h3>
                      <p className="pos-product-price">{parseFloat(product.selling_price).toLocaleString('vi-VN')} ₫</p>
                      <p className={`pos-product-stock ${product.stock_quantity <= product.reorder_level ? 'low-stock' : ''}`}>
                        {product.stock_quantity > 0
                          ? `Còn: ${product.stock_quantity} ${product.unit}`
                          : 'Hết hàng'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Phải - Giỏ hàng */}
        <div className="pos-cart-section">
          <div className="pos-cart-header">
            <h2>Giỏ hàng</h2>
            <button className="clear-cart-btn" onClick={clearCart} disabled={cart.length === 0}>Xóa tất cả</button>
          </div>

          <div className="pos-cart-items">
            {cart.length === 0 ? (
              <p className="empty-cart-message">Chưa có sản phẩm</p>
            ) : (
              cart.map(item => (
                <div key={item.id} className="pos-cart-item">
                  <div className="pos-cart-item-image"><img src={item.image} alt={item.name} /></div>
                  <div className="pos-cart-item-details">
                    <h4>{item.name}</h4>
                    <p className="pos-cart-item-price">{item.price.toLocaleString('vi-VN')} ₫</p>
                  </div>
                  <div className="pos-cart-item-quantity">
                    <button className="quantity-btn minus" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                    <span>{item.quantity} {item.unit}</span>
                    <button className="quantity-btn plus" onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock}>+</button>
                  </div>
                  <div className="pos-cart-item-subtotal">
                    {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                  </div>
                  <button className="remove-item-btn" onClick={() => removeItem(item.id)}>×</button>
                </div>
              ))
            )}
          </div>

          <div className="pos-cart-totals">
            <div className="pos-cart-total"><span>Tạm tính:</span><span>{total.toLocaleString('vi-VN')} ₫</span></div>
            <div className="pos-cart-total grand-total"><span>Tổng cộng:</span><span>{total.toLocaleString('vi-VN')} ₫</span></div>
          </div>

          <div className="pos-customer-info">
            <h3>Thông tin khách hàng (tuỳ chọn)</h3>
            <div className="pos-form-row">
              <div className="pos-form-group">
                <label>Họ</label>
                <input type="text" value={customerInfo.firstName} onChange={(e) => setCustomerInfo({...customerInfo, firstName: e.target.value})} placeholder="Họ" />
              </div>
              <div className="pos-form-group">
                <label>Tên</label>
                <input type="text" value={customerInfo.lastName} onChange={(e) => setCustomerInfo({...customerInfo, lastName: e.target.value})} placeholder="Tên" />
              </div>
            </div>
            <div className="pos-form-group">
              <label>Số điện thoại</label>
              <input type="text" value={customerInfo.phone} onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})} placeholder="SĐT" />
            </div>
          </div>

          <div className="pos-payment-section">
            <h3>Thanh toán</h3>
            <div className="pos-payment-methods">
              <button className={`payment-method-btn ${paymentMethod === 'cash' ? 'active' : ''}`} onClick={() => setPaymentMethod('cash')}>Tiền mặt</button>
              <button className={`payment-method-btn ${paymentMethod === 'card' ? 'active' : ''}`} onClick={() => setPaymentMethod('card')}>Thẻ</button>
              <button className={`payment-method-btn ${paymentMethod === 'online' ? 'active' : ''}`} onClick={() => setPaymentMethod('online')}>Online</button>
            </div>

            {paymentMethod === 'cash' && (
              <div className="pos-cash-payment">
                <div className="pos-form-group">
                  <label>Số tiền khách đưa (VNĐ)</label>
                  <input type="number" value={amountReceived} onChange={(e) => setAmountReceived(e.target.value)} placeholder="0" min={total} />
                </div>
                <div className="pos-change-amount">
                  <span>Tiền thối:</span>
                  <span>{change.toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>
            )}
          </div>

          <button
            className="pos-checkout-btn"
            disabled={cart.length === 0 || processing || (paymentMethod === 'cash' && (!amountReceived || parseFloat(amountReceived) < total))}
            onClick={processSale}
          >
            {processing ? 'Đang xử lý...' : 'Hoàn tất giao dịch'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS;
