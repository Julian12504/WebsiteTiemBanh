import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './List.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import ConfirmDialog from '../../Components/ConfirmDialog/ConfirmDialog';
import { AdminAuthContext } from '../../context/AdminAuthContext';
import { useCallback } from 'react';

const List = ({url}) => {
  const [list, setList] = useState([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { token, hasRole } = useContext(AdminAuthContext);

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        setError("Thiếu mã xác thực. Vui lòng đăng nhập lại.");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${url}/api/item/list`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000 
      });

      if (response.data.success) {
        setList(response.data.data);
      } else {
        setError(response.data.message || "Không lấy được danh sách sản phẩm");
        toast.error("Không lấy được danh sách sản phẩm");
      }
    } catch (error) {
      let errorMessage;
      if (error.response) {
        errorMessage = error.response.data?.message || `Lỗi máy chủ: ${error.response.status}`;
        if (error.response.status === 401) {
          errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
        }
      } else if (error.request) {
        errorMessage = "Không phản hồi từ máy chủ. Vui lòng kiểm tra kết nối.";
      } else {
        errorMessage = error.message;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [token, url]);

  const handleDeleteClick = (itemId, itemName) => {
    setItemToDelete({ id: itemId, name: itemName });
    setIsConfirmOpen(true);
  };

  const cancelDelete = () => {
    setIsConfirmOpen(false);
    setItemToDelete(null);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const response = await axios.post(`${url}/api/item/remove`, 
        { item_id: itemToDelete.id },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        fetchList();
      } else {
        toast.error("Lỗi khi xóa sản phẩm");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Không xóa được sản phẩm");
    } finally {
      setIsConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const handleEdit = (itemId) => {
    navigate(`/edit-item/${itemId}`);
  }

  const handleBarcode = (itemId) => {
    navigate(`/item-barcode/${itemId}`);
  }

  const handleBulkBarcode = () => {
    navigate('/bulk-barcode');
  }

  // Chuyển đổi category từ tiếng Anh sang tiếng Việt
  const translateCategory = (category) => {
    const categoryMap = {
      'Cake': 'Bánh',
      'Cake Ingredients': 'Nguyên liệu làm bánh',
      'Party Items': 'Đồ trang trí tiệc'
    };
    return categoryMap[category] || category;
  };

  // Filter items based on search term
  const filteredItems = list.filter(item => {
    const searchTermLower = searchTerm.toLowerCase();
    const translatedCategory = translateCategory(item.category);
    return (
      item.name.toLowerCase().includes(searchTermLower) ||
      item.category.toLowerCase().includes(searchTermLower) ||
      translatedCategory.toLowerCase().includes(searchTermLower) ||
      (item.sku && item.sku.toLowerCase().includes(searchTermLower)) ||
      (item.barcode && item.barcode.toLowerCase().includes(searchTermLower))
    );
  });

  useEffect(() => {
    fetchList();
  }, [fetchList, token]);

  return (
    <div className='list-container'>
      <div className="list-header">
        <h2>Danh sách sản phẩm kho</h2>
        <div className="list-actions">
          <button className="add-new-btn" onClick={() => navigate('/add')}>
            Thêm sản phẩm mới
          </button>
          <button className="bulk-barcode-btn" onClick={handleBulkBarcode}>
            In tem mã vạch hàng loạt
          </button>
        </div>
      </div>

      <div className="list-search">
        <input 
          type="text" 
          placeholder="Tìm theo tên, danh mục, SKU hoặc mã vạch..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải sản phẩm...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <div className="error-message">
            <h3>Lỗi khi tải danh sách sản phẩm</h3>
            <p>{error}</p>
            <button className="retry-button" onClick={fetchList}>Thử lại</button>
          </div>
        </div>
      ) : (
        <div className="list-table">
          <div className="list-table-format title">
            <b>Ảnh</b>
            <b>Số lượng</b>
            <b>Tên sản phẩm</b>
            <b>Danh mục</b>
            <b>SKU</b>
            <b>Giá nhập</b>
            <b>Giá bán</b>
            {hasRole('admin') && <b>Lợi nhuận</b>}
            <b>Thao tác</b>
          </div>

          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const costPrice = parseFloat(item.cost_price) || 0;
              const sellingPrice = parseFloat(item.selling_price) || 0;
              const profit = sellingPrice - costPrice;
              const profitMargin = costPrice > 0 ? (profit / sellingPrice * 100).toFixed(1) : 0;

              const stockDisplay = item.is_loose 
                ? `${parseFloat(item.stock_quantity).toFixed(1)} ${item.unit}`
                : Math.floor(item.stock_quantity);

              const isLowStock = parseFloat(item.stock_quantity) <= parseFloat(item.reorder_level);

              return (
                <div className="list-table-format" key={item.id}>
                  <img src={item.image} alt={item.name} />
                  <p className="item-quantity">
                    <span className={`quantity-badge ${isLowStock ? 'low-stock' : ''}`}>
                      {stockDisplay}
                    </span>
                  </p>
                  <p className="item-name">
                    {item.name}
                    {item.weight_value && <span className="item-weight">({item.weight_value}{item.weight_unit})</span>}
                  </p>
                  <p className="item-category">{translateCategory(item.category)}</p>
                  <p className="item-sku">{item.sku || 'Chưa có SKU'}</p>
                  <p className="item-cost">{hasRole('admin') ? `${costPrice.toLocaleString('vi-VN')} VNĐ` : "-"}</p>
                  <p className="item-price">{sellingPrice.toLocaleString('vi-VN')} VNĐ</p>
                  {hasRole('admin') && (
                    <p className={`item-profit ${profit > 0 ? 'profit-positive' : 'profit-negative'}`}>
                      {profit.toLocaleString('vi-VN')} VNĐ
                      <span className="profit-margin">({profitMargin}%)</span>
                    </p>
                  )}
                  <div className="action-buttons">
                    {hasRole('admin') && (
                      <button 
                        className="edit-btn" 
                        onClick={() => handleEdit(item.id)}
                      >
                        Sửa
                      </button>
                    )}
                    <button 
                      className="barcode-btn" 
                      onClick={() => handleBarcode(item.id)}
                      title="Sinh mã vạch"
                    >
                      Mã vạch
                    </button>
                    {hasRole('owner') && (
                      <button 
                        className="delete-btn" 
                        onClick={() => handleDeleteClick(item.id, item.name)}
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-items">
              {searchTerm ? `Không tìm thấy sản phẩm phù hợp với "${searchTerm}"` : 'Chưa có sản phẩm nào'}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title="Xác nhận xóa"
        message={itemToDelete ? `Bạn có chắc chắn muốn xóa "${itemToDelete.name}"? Thao tác này không thể hoàn tác.` : ""}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}

export default List;
