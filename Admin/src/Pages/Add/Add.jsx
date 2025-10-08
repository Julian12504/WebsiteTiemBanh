import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Add.css";
import assets from "../../assets/assets";
import { toast } from "react-toastify";
import axios from "axios";
import { AdminAuthContext } from '../../context/AdminAuthContext';
import AccessDenied from "../../Components/AccessDenied/AccessDenied";

const Add = ({url}) => {
  const navigate = useNavigate();
  const { token, hasRole } = useContext(AdminAuthContext);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    name: '',
    description: '',
    category: 'Bakery', 
    barcode: '',
    customSKU: '',
    cost_price: '',
    selling_price: '',
    unit: 'piece',
    is_loose: false,
    min_order_quantity: '1',
    increment_step: '1',
    weight_value: '',
    weight_unit: 'g',
    pieces_per_pack: '',
    reorder_level: '5'
  });

  // Check if user has admin privileges
  // if (!hasRole('admin')) {
  //   return <AccessDenied />;
  // }

  const onChangeHandler = (event) => {
    const name = event.target.name;
    let value = event.target.value;
    
    if (name === 'is_loose') {
      value = event.target.checked;
    }
    
    if (name === 'category') {
      const newUnit = value === 'Cake Ingredients' ? 'g' : 'piece';
      const newIsLoose = value === 'Cake Ingredients';
      
      setData((prevData) => ({ 
        ...prevData, 
        [name]: value,
        unit: newUnit,
        is_loose: newIsLoose,
        min_order_quantity: newIsLoose ? '50' : '1',
        increment_step: newIsLoose ? '10' : '1'
      }));
      return;
    }
    
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    // Validate required fields
    if (!data.name || !data.category || !data.cost_price) {
      toast.error("Vui lòng nhập Tên, Danh mục và Giá vốn.");
      return;
    }

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description || '');
    formData.append("category", data.category);
    formData.append("cost_price", data.cost_price);
    formData.append("selling_price", data.selling_price || data.cost_price);
    formData.append("unit", data.unit);
    formData.append("is_loose", data.is_loose);
    formData.append("min_order_quantity", data.min_order_quantity);
    formData.append("increment_step", data.increment_step);
    formData.append("weight_value", data.weight_value || '');
    formData.append("weight_unit", data.weight_unit || 'g');
    formData.append("pieces_per_pack", data.pieces_per_pack || '');
    formData.append("reorder_level", data.reorder_level || '5');
    if (data.barcode) formData.append("barcode", data.barcode);
    if (data.customSKU) formData.append("customSKU", data.customSKU);
    if (image) formData.append("image", image);

    try {
      setLoading(true);
      const response = await axios.post(
        `${url}/api/item/add`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success(response.data.message || "Thêm mặt hàng thành công");
        if (response.data.sku) {
          toast.info(`Mã SKU: ${response.data.sku}`);
        }
        
        setData({
          name: "",
          description: "",
          category: "Bakery",
          barcode: "",
          customSKU: "",
          cost_price: "",
          selling_price: "",
          unit: "piece",
          is_loose: false,
          min_order_quantity: "1",
          increment_step: "1",
          weight_value: "",
          weight_unit: "g",
          pieces_per_pack: "",
          reorder_level: "5"
        });
        setImage(null);
        navigate('/list');
      } else {
        toast.error(response.data.message || "Không thể thêm mặt hàng");
      }
    } catch (error) {
      console.error("Error while adding item:", error);
      toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi thêm mặt hàng.");
    } finally {
      setLoading(false);
    }
  };

  // Giữ value tiếng Anh để không ảnh hưởng logic, chỉ đổi nhãn hiển thị
  const categoryLabel = {
    "Bakery": "Bánh kem",
    "Cake Ingredients": "Nguyên liệu làm bánh",
    "Party Items": "Đồ trang trí tiệc"
  };

  return (
    <div className="add-item-container">
      <div className="add-item-header">
        <h2>Thêm mặt hàng mới</h2>
        <button className="back-btn" onClick={() => navigate('/list')}>Quay lại danh sách</button>
      </div>

      <form className="add-item-form" onSubmit={onSubmitHandler}>
        <div className="form-columns">
          <div className="form-column">
            <div className="add-img-upload">
              <label className="form-label">Ảnh sản phẩm</label>
              <div className="image-upload-container">
                <label htmlFor="image" className="image-upload-label">
                  <img
                    src={image ? URL.createObjectURL(image) : assets.upload_area}
                    alt="Tải ảnh"
                    className="upload-preview"
                  />
                  <div className="upload-text">
                    {image ? "Đổi ảnh" : "Bấm để tải ảnh lên"}
                  </div>
                </label>
                <input 
                  onChange={(e) => setImage(e.target.files[0])} 
                  type="file" 
                  id="image" 
                  accept="image/*"
                  hidden 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="category">Danh mục*</label>
              <select 
                id="category" 
                name="category" 
                value={data.category} 
                onChange={onChangeHandler}
                required
                className="form-input"
              >
                <option value="Bakery">{categoryLabel["Bakery"]}</option>
                <option value="Cake Ingredients">{categoryLabel["Cake Ingredients"]}</option>
                <option value="Party Items">{categoryLabel["Party Items"]}</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="cost_price">Giá vốn (VNĐ)*</label>
              <input 
                type="number" 
                id="cost_price" 
                name="cost_price" 
                value={data.cost_price} 
                onChange={onChangeHandler}
                placeholder="0" 
                min="0" 
                step="1"
                required
                className="form-input"
              />
              <small className="form-helper-text">
                Giá nhập ban đầu (đơn vị: VNĐ).
              </small>
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="selling_price">Giá bán (VNĐ)</label>
              <input 
                type="number" 
                id="selling_price" 
                name="selling_price" 
                value={data.selling_price} 
                onChange={onChangeHandler}
                placeholder="0" 
                min="0" 
                step="1"
                className="form-input"
              />
              <small className="form-helper-text">
                Để trống để tạm dùng giá vốn. Có thể cập nhật sau.
              </small>
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="reorder_level">Mức tồn tối thiểu</label>
              <input 
                type="number" 
                id="reorder_level" 
                name="reorder_level" 
                value={data.reorder_level} 
                onChange={onChangeHandler}
                placeholder="5" 
                min="1" 
                className="form-input"
              />
              <small className="form-helper-text">
                Khi tồn kho xuống dưới mức này, hệ thống sẽ nhắc nhập thêm.
              </small>
            </div>
          </div>

          <div className="form-column">
            <div className="form-group">
              <label className="form-label" htmlFor="name">Tên mặt hàng*</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                value={data.name} 
                onChange={onChangeHandler}
                placeholder="Nhập tên mặt hàng"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">Mô tả</label>
              <textarea 
                id="description" 
                name="description" 
                rows="4" 
                value={data.description} 
                onChange={onChangeHandler}
                placeholder="Mô tả ngắn gọn về mặt hàng"
                className="form-input textarea"
              ></textarea>
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="unit">Đơn vị tính</label>
              <select 
                id="unit" 
                name="unit" 
                value={data.unit} 
                onChange={onChangeHandler}
                className="form-input"
              >
                <option value="g">Gam (g)</option>
                <option value="ml">Mililit (ml)</option>
                <option value="piece">Cái (piece)</option>
              </select>
            </div>
            
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="is_loose" 
                  checked={data.is_loose} 
                  onChange={onChangeHandler}
                />
                <span>Bán theo khối lượng/thể tích</span>
              </label>
              <small className="form-helper-text">
                Bật cho các mặt hàng bán lẻ theo trọng lượng/thể tích (vd: bột, siro…).
              </small>
            </div>
            
            {data.is_loose && (
              <>
                <div className="form-row">
                  <div className="form-group half-width">
                    <label className="form-label" htmlFor="min_order_quantity">Lượng mua tối thiểu</label>
                    <input 
                      type="number" 
                      id="min_order_quantity" 
                      name="min_order_quantity" 
                      value={data.min_order_quantity} 
                      onChange={onChangeHandler}
                      min="1" 
                      step="1"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group half-width">
                    <label className="form-label" htmlFor="increment_step">Bước tăng mỗi lần</label>
                    <input 
                      type="number" 
                      id="increment_step" 
                      name="increment_step" 
                      value={data.increment_step} 
                      onChange={onChangeHandler}
                      min="1" 
                      step="1"
                      className="form-input"
                    />
                  </div>
                </div>
                <small className="form-helper-text">
                  Mua tối thiểu {data.min_order_quantity} {data.unit}, tăng theo bước {data.increment_step} {data.unit}.
                </small>
              </>
            )}
            
            <div className="form-row">
              <div className="form-group half-width">
                <label className="form-label" htmlFor="weight_value">Khối lượng/Thể tích đóng gói</label>
                <input 
                  type="number" 
                  id="weight_value" 
                  name="weight_value" 
                  value={data.weight_value} 
                  onChange={onChangeHandler}
                  placeholder="VD: 500" 
                  min="0" 
                  step="1"
                  className="form-input"
                />
              </div>
              <div className="form-group half-width">
                <label className="form-label" htmlFor="weight_unit">Đơn vị</label>
                <select 
                  id="weight_unit" 
                  name="weight_unit" 
                  value={data.weight_unit} 
                  onChange={onChangeHandler}
                  className="form-input"
                >
                  <option value="g">Gam (g)</option>
                  <option value="ml">Mililit (ml)</option>
                </select>
              </div>
            </div>
            
            {data.category !== 'Cake Ingredients' && (
              <div className="form-group">
                <label className="form-label" htmlFor="pieces_per_pack">Số lượng trong 1 gói</label>
                <input 
                  type="number" 
                  id="pieces_per_pack" 
                  name="pieces_per_pack" 
                  value={data.pieces_per_pack} 
                  onChange={onChangeHandler}
                  placeholder="VD: 12" 
                  min="1" 
                  step="1"
                  className="form-input"
                />
                <small className="form-helper-text">
                  Dùng cho mặt hàng đóng theo chiếc/cái (nếu áp dụng).
                </small>
              </div>
            )}
            
            <div className="form-group">
              <label className="form-label" htmlFor="barcode">Mã vạch (không bắt buộc)</label>
              <input 
                type="text" 
                id="barcode" 
                name="barcode" 
                value={data.barcode} 
                onChange={onChangeHandler}
                placeholder="Quét mã vạch hoặc nhập thủ công"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="customSKU">SKU tùy chỉnh (không bắt buộc)</label>
              <input 
                type="text" 
                id="customSKU" 
                name="customSKU" 
                value={data.customSKU} 
                onChange={onChangeHandler}
                placeholder="Nhập SKU riêng nếu cần"
                className="form-input"
              />
              <small className="form-helper-text">
                Để trống để hệ thống tự sinh SKU. Nếu có mã vạch, SKU sẽ ưu tiên dùng mã vạch.
              </small>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={() => navigate('/list')}>Hủy</button>
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="button-spinner"></span>
                Đang thêm…
              </>
            ) : (
              "Thêm mặt hàng"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Add;
