import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './EditItem.css';
import { AdminAuthContext } from '../../context/AdminAuthContext';
import AccessDenied from "../../Components/AccessDenied/AccessDenied";

const EditItem = ({ url }) => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { token, hasRole } = useContext(AdminAuthContext);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    cost_price: '',
    selling_price: '',
    unit: 'g',
    is_loose: false,
    min_order_quantity: '50',
    increment_step: '10',
    weight_value: '',
    weight_unit: 'g',
    pieces_per_pack: '',
    reorder_level: '5',
    barcode: '',
    customSKU: '',
    image: null
  });

  useEffect(() => {
    // Lấy chi tiết mặt hàng khi mount
    const fetchItemDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${url}/api/item/${itemId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.data.success) {
          const item = response.data.data;
          setFormData({
            name: item.name || '',
            description: item.description || '',
            category: item.category || '',
            cost_price: item.cost_price || '',
            selling_price: item.selling_price || '',
            unit: item.unit || 'g',
            is_loose: item.is_loose || false,
            min_order_quantity: item.min_order_quantity || '50',
            increment_step: item.increment_step || '10',
            weight_value: item.weight_value || '',
            weight_unit: item.weight_unit || 'g',
            pieces_per_pack: item.pieces_per_pack || '',
            reorder_level: item.reorder_level || '5',
            barcode: item.barcode || '',
            customSKU: item.sku || '',
            image: null
          });
          setPreview(item.image);
        } else {
          toast.error("Không thể lấy thông tin mặt hàng");
          navigate('/list');
        }
      } catch (error) {
        console.error("Error fetching item details:", error);
        toast.error(error.response?.data?.message || "Lỗi khi tải chi tiết mặt hàng");
        navigate('/list');
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [itemId, url, navigate, token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prevData => ({ ...prevData, image: file }));

      // Tạo URL xem trước
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Tạo form data để gửi
      const submitData = new FormData();
      submitData.append('item_id', itemId);
      submitData.append('name', formData.name);
      submitData.append('description', formData.description || '');
      submitData.append('cost_price', formData.cost_price);
      submitData.append('selling_price', formData.selling_price);
      submitData.append('unit', formData.unit);
      submitData.append('is_loose', formData.is_loose);
      submitData.append('min_order_quantity', formData.min_order_quantity);
      submitData.append('increment_step', formData.increment_step);
      submitData.append('weight_value', formData.weight_value || '');
      submitData.append('weight_unit', formData.weight_unit || 'g');
      submitData.append('pieces_per_pack', formData.pieces_per_pack || '');
      submitData.append('reorder_level', formData.reorder_level || '5');
      submitData.append('barcode', formData.barcode || '');
      submitData.append('customSKU', formData.customSKU || '');
      if (formData.image) submitData.append('image', formData.image);

      const response = await axios.post(`${url}/api/item/update`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        toast.success("Cập nhật mặt hàng thành công");
        navigate('/list');
      } else {
        toast.error(response.data.message || "Cập nhật mặt hàng thất bại");
      }
    } catch (error) {
      console.error("Error updating item:", error);
      console.log("Error response:", error.response);
      toast.error(error.response?.data?.message || "Lỗi khi cập nhật mặt hàng");
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra quyền admin (nếu cần bật)
  // if (!hasRole('admin')) return <AccessDenied />;

  if (loading) {
    return (
      <div className="edit-page-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải chi tiết mặt hàng…</p>
      </div>
    );
  }

  return (
    <div className="edit-page-container">
      <div className="edit-page-header">
        <h1>Chỉnh sửa mặt hàng</h1>
        <button 
          className="back-button"
          onClick={() => navigate('/list')}
        >
          Quay lại danh sách
        </button>
      </div>

      <div className="edit-page-content">
        <div className="item-preview-section">
          <div className="preview-image-container">
            {preview ? (
              <img src={preview} alt="Xem trước" className="item-preview-image" />
            ) : (
              <div className="no-image-placeholder">Chưa có ảnh</div>
            )}
          </div>
          <div className="current-details">
            <h3>Thông tin hiện tại</h3>
            <p className="detail-item"><span>Tên:</span> {formData.name}</p>
            <p className="detail-item"><span>Danh mục:</span> {formData.category}</p>
            <p className="detail-item"><span>SKU:</span> {formData.customSKU}</p>
            <p className="detail-item"><span>Giá vốn:</span> VNĐ {formData.cost_price}</p>
            <p className="detail-item"><span>Giá bán:</span> VNĐ {formData.selling_price}</p>
            <p className="detail-item"><span>Đơn vị:</span> {formData.unit}</p>
            {formData.is_loose && (
              <p className="detail-item"><span>Loại:</span> Bán theo khối lượng/thể tích</p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="edit-page-form">
          <div className="form-section basic-details">
            <h3>Thông tin cơ bản</h3>
            
            <div className="form-group">
              <label htmlFor="name">Tên mặt hàng</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nhập tên mặt hàng"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Mô tả</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Nhập mô tả mặt hàng"
                rows="5"
              />
            </div>

            <div className="form-group category-display">
              <label>Danh mục</label>
              <p className="category-value">{formData.category}</p>
              <small>Danh mục không thể thay đổi sau khi tạo mặt hàng.</small>
            </div>

            <div className="form-group">
              <label htmlFor="image">Cập nhật ảnh</label>
              <div className="file-input-container">
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input"
                />
                <label htmlFor="image" className="custom-file-input">
                  Chọn tệp
                </label>
                <span className="file-name">
                  {formData.image ? formData.image.name : "Chưa chọn tệp"}
                </span>
              </div>
            </div>
          </div>

          <div className="form-section pricing-details">
            <h3>Giá & Tồn kho</h3>
            
            <div className="form-row">
              <div className="form-group half-width">
                <label htmlFor="cost_price">Giá vốn (VNĐ)</label>
                <input
                  type="number"
                  id="cost_price"
                  name="cost_price"
                  step="0.01"
                  min="0"
                  value={formData.cost_price}
                  onChange={handleChange}
                  placeholder="Nhập giá vốn"
                />
              </div>
              
              <div className="form-group half-width">
                <label htmlFor="selling_price">Giá bán (VNĐ)</label>
                <input
                  type="number"
                  id="selling_price"
                  name="selling_price"
                  step="0.01"
                  min="0"
                  value={formData.selling_price}
                  onChange={handleChange}
                  placeholder="Nhập giá bán"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="reorder_level">Ngưỡng nhập lại</label>
              <input
                type="number"
                id="reorder_level"
                name="reorder_level"
                min="1"
                value={formData.reorder_level}
                onChange={handleChange}
                placeholder="Nhập ngưỡng nhập lại"
              />
              <small className="form-helper-text">
                Số lượng tối thiểu trước khi cần nhập hàng.
              </small>
            </div>
          </div>
          
          <div className="form-section measurement-details">
            <h3>Định lượng & Số lượng</h3>
            
            <div className="form-group">
              <label htmlFor="unit">Đơn vị tính</label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
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
                  checked={formData.is_loose}
                  onChange={handleChange}
                />
                <span>Bán theo khối lượng/thể tích</span>
              </label>
              <small className="form-helper-text">
                Bật cho các mặt hàng bán lẻ theo trọng lượng/thể tích (ví dụ: bột, chất lỏng).
              </small>
            </div>
            
            {formData.is_loose && (
              <>
                <div className="form-row">
                  <div className="form-group half-width">
                    <label htmlFor="min_order_quantity">Lượng mua tối thiểu</label>
                    <input
                      type="number"
                      id="min_order_quantity"
                      name="min_order_quantity"
                      min="1"
                      step="1"
                      value={formData.min_order_quantity}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group half-width">
                    <label htmlFor="increment_step">Bước tăng mỗi lần</label>
                    <input
                      type="number"
                      id="increment_step"
                      name="increment_step"
                      min="1"
                      step="1"
                      value={formData.increment_step}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <small className="form-helper-text">
                  Mua tối thiểu {formData.min_order_quantity} {formData.unit}, tăng theo bước {formData.increment_step} {formData.unit}.
                </small>
              </>
            )}
            
            <div className="form-row">
              <div className="form-group half-width">
                <label htmlFor="weight_value">Khối lượng/Thể tích đóng gói</label>
                <input
                  type="number"
                  id="weight_value"
                  name="weight_value"
                  min="0"
                  step="1"
                  value={formData.weight_value}
                  onChange={handleChange}
                  placeholder="VD: 500"
                />
              </div>
              <div className="form-group half-width">
                <label htmlFor="weight_unit">Đơn vị</label>
                <select
                  id="weight_unit"
                  name="weight_unit"
                  value={formData.weight_unit}
                  onChange={handleChange}
                >
                  <option value="g">Gam (g)</option>
                  <option value="ml">Mililit (ml)</option>
                </select>
              </div>
            </div>
            
            {formData.category !== 'Cake Ingredients' && (
              <div className="form-group">
                <label htmlFor="pieces_per_pack">Số lượng trong 1 gói</label>
                <input
                  type="number"
                  id="pieces_per_pack"
                  name="pieces_per_pack"
                  min="1"
                  step="1"
                  value={formData.pieces_per_pack}
                  onChange={handleChange}
                  placeholder="VD: 12"
                />
                <small className="form-helper-text">
                  Áp dụng với mặt hàng đóng theo chiếc/cái (nếu có).
                </small>
              </div>
            )}
          </div>
          
          <div className="form-section identification-details">
            <h3>Nhận dạng</h3>
            
            <div className="form-group">
              <label htmlFor="barcode">Mã vạch</label>
              <input
                type="text"
                id="barcode"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                placeholder="Nhập mã vạch"
              />
              <small className="form-helper-text">
                Nếu có mã vạch, hãy quét hoặc nhập thủ công.
              </small>
            </div>
            
            <div className="form-group">
              <label htmlFor="customSKU">SKU tùy chỉnh</label>
              <input
                type="text"
                id="customSKU"
                name="customSKU"
                value={formData.customSKU}
                onChange={handleChange}
                placeholder="Nhập SKU tùy chỉnh"
                disabled
              />
              <small className="form-helper-text">
                SKU không thể thay đổi sau khi tạo mặt hàng.
              </small>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => navigate('/list')}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="save-btn"
              disabled={loading}
            >
              {loading ? 'Đang lưu thay đổi…' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItem;
