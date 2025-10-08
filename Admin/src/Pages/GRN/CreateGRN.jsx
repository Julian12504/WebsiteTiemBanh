import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AdminAuthContext } from '../../context/AdminAuthContext';
import SearchDropdown from '../../Components/SearchDropdown/SearchDropdown';
import ConfirmDialog from '../../Components/ConfirmDialog/ConfirmDialog';
import './CreateGRN.css';

const CreateGRN = ({ url }) => {
  const [formData, setFormData] = useState({
    supplierId: '',
    referenceNumber: '',
    deliveryDate: new Date().toISOString().split('T')[0],
    notes: '',
    items: [
      {
        itemId: '',
        name: '',
        category: 'Cake Ingredients',
        quantity: 1,
        unitPrice: '',
        sellingPrice: '',
        sku: '',
        barcode: '',
        unit: 'g',
        isNew: true,
      },
    ],
  });

  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  const { token } = useContext(AdminAuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSuppliers();
    fetchItems();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${url}/api/supplier/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setSuppliers(response.data.data);
      } else {
        toast.error('Không thể tải danh sách nhà cung cấp');
      }
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      toast.error(err.response?.data?.message || 'Lỗi tải danh sách nhà cung cấp');
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${url}/api/item/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data?.success) setItems(response.data.data || []);
    } catch (err) {
      console.error('Error fetching items:', err);
    }
  };

  const generateSKU = (category) => {
    const prefixes = {
      'Cake Ingredients': 'CI',
      'Cake': 'CT',
      'Party Items': 'PI',
    };
    const prefix = prefixes[category] || 'IT';
    const timestamp = Date.now().toString().slice(-6);
    const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `${prefix}${timestamp}${randomNum}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    if (field === 'category' && updatedItems[index].isNew) {
      updatedItems[index].sku = generateSKU(value);
    }

    setFormData((prev) => ({ ...prev, items: updatedItems }));
    validateItemField(index, field, value);
  };

  const handleSearchItemSelect = (index, selectedItem) => {
    const updatedItems = [...formData.items];

    if (selectedItem.id === 'new') {
      // Tạo item mới
      const newCategory = 'Cake Ingredients';
      updatedItems[index] = {
        ...updatedItems[index],
        itemId: 'new',
        name: selectedItem.name || '',
        category: newCategory,
        quantity: updatedItems[index].quantity || 1,
        unitPrice: '',
        sellingPrice: '',
        sku: generateSKU(newCategory),
        barcode: '',
        unit: 'g',
        isNew: true,
      };
    } else {
      // Chọn item có sẵn
      const realId = selectedItem.id ?? selectedItem.item_id ?? selectedItem._id;
      updatedItems[index] = {
        ...updatedItems[index],
        itemId: realId,
        name: selectedItem.name,
        category: selectedItem.category,
        quantity: updatedItems[index].quantity || 1,
        unitPrice: updatedItems[index].unitPrice || selectedItem.cost_price || '',
        sellingPrice: updatedItems[index].sellingPrice || selectedItem.selling_price || '',
        sku: selectedItem.sku || '',
        barcode: selectedItem.barcode || '',
        unit: selectedItem.unit || 'piece',
        isNew: false,
      };
    }

    setFormData((prev) => ({ ...prev, items: updatedItems }));
    validateItem(index);
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          itemId: '',
          name: '',
          category: 'Cake Ingredients',
          quantity: 1,
          unitPrice: '',
          sellingPrice: '',
          sku: generateSKU('Cake Ingredients'),
          barcode: '',
          unit: 'g',
          isNew: true,
        },
      ],
    }));
  };

  const handleRemoveClick = (index) => {
    if (formData.items.length <= 1) {
      toast.warning('Cần ít nhất 1 dòng hàng trong GRN');
      return;
    }
    setItemToRemove(index);
    setIsConfirmOpen(true);
  };

  const confirmRemove = () => {
    const updatedItems = formData.items.filter((_, i) => i !== itemToRemove);
    setFormData((prev) => ({ ...prev, items: updatedItems }));
    setIsConfirmOpen(false);
    setItemToRemove(null);
  };

  const cancelRemove = () => {
    setIsConfirmOpen(false);
    setItemToRemove(null);
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      return total + (Number(item.quantity) * (parseFloat(item.unitPrice) || 0));
    }, 0);
  };

  const validateField = (name, value) => {
    let error = '';
    if (!value) {
      if (name === 'supplierId') error = 'Vui lòng chọn nhà cung cấp';
      if (name === 'referenceNumber') error = 'Vui lòng nhập số hóa đơn';
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateItemField = (index, field, value) => {
    let error = '';
    if (!value && field === 'name') {
      error = 'Vui lòng nhập tên hàng';
    } else if (
      (field === 'quantity' || field === 'unitPrice') &&
      (!value || isNaN(value) || parseFloat(value) <= 0)
    ) {
      error = field === 'quantity' ? 'Phải > 0' : 'Phải là số dương';
    }
    setErrors((prev) => {
      const itemErrors = { ...(prev.items || {}) };
      if (!itemErrors[index]) itemErrors[index] = {};
      itemErrors[index][field] = error;
      return { ...prev, items: itemErrors };
    });
  };

  const validateItem = (index) => {
    const item = formData.items[index];
    const itemErrors = {};
    if (!item.name) itemErrors.name = 'Vui lòng nhập tên hàng';
    if (!item.quantity || isNaN(item.quantity) || parseFloat(item.quantity) <= 0) {
      itemErrors.quantity = 'Phải > 0';
    }
    if (!item.unitPrice || isNaN(item.unitPrice) || parseFloat(item.unitPrice) <= 0) {
      itemErrors.unitPrice = 'Phải là số dương';
    }
    setErrors((prev) => {
      const itemsErrors = { ...(prev.items || {}) };
      itemsErrors[index] = itemErrors;
      return { ...prev, items: itemsErrors };
    });
    return Object.keys(itemErrors).length === 0;
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    if (!formData.supplierId) {
      newErrors.supplierId = 'Vui lòng chọn nhà cung cấp';
      isValid = false;
    }
    if (!formData.referenceNumber) {
      newErrors.referenceNumber = 'Vui lòng nhập số hóa đơn';
      isValid = false;
    }

    formData.items.forEach((item, index) => {
      // Kiểm tra name có giá trị (trim để loại bỏ space)
      const trimmedName = (item.name || '').trim();
      
      if (!trimmedName) {
        toast.error(`Dòng ${index + 1}: Vui lòng nhập tên mặt hàng`);
        isValid = false;
      }
      
      if (!item.category) {
        toast.error(`Dòng ${index + 1}: Vui lòng chọn danh mục`);
        isValid = false;
      }
      
      if (!item.quantity || parseFloat(item.quantity) <= 0) {
        toast.error(`Dòng ${index + 1}: Số lượng phải lớn hơn 0`);
        isValid = false;
      }
      
      if (!item.unitPrice || parseFloat(item.unitPrice) <= 0) {
        toast.error(`Dòng ${index + 1}: Giá nhập phải lớn hơn 0`);
        isValid = false;
      }
    });

    setErrors(newErrors);
    if (!isValid) {
      toast.error('Vui lòng kiểm tra lại thông tin các dòng hàng');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Debug: Kiểm tra data trước khi validate
    console.log('=== DEBUG SUBMIT ===');
    console.log('Form Data Items:', formData.items.map((item, i) => ({
      index: i,
      name: item.name,
      nameLength: item.name?.length,
      category: item.category,
      quantity: item.quantity,
      unitPrice: item.unitPrice
    })));
    
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const submitData = {
        supplier_id: Number(formData.supplierId),
        po_reference: formData.referenceNumber,
        received_date: formData.deliveryDate,
        notes: formData.notes,
        items: formData.items.map((item) => ({
          item_id: item.itemId === 'new' ? null : Number(item.itemId),
          name: item.name,
          category: item.category,
          sku: item.sku,
          barcode: item.barcode,
          unit: item.unit,
          received_quantity: Number(item.quantity),
          unit_price: Number(item.unitPrice),
          selling_price: item.sellingPrice ? Number(item.sellingPrice) : null,
          isNew: item.isNew
        })),
      };

      console.log('Submitting GRN data:', submitData);

      const response = await axios.post(`${url}/api/grn/create`, submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        toast.success('Tạo GRN thành công');
        navigate('/grn');
      } else {
        toast.error(response.data.message || 'Không thể tạo GRN');
      }
    } catch (err) {
      console.error('Error creating GRN:', err);
      let errorMessage = 'Lỗi tạo GRN';
      if (err.response) {
        if (err.response.data?.errors) {
          const serverErrors = err.response.data.errors;
          errorMessage = 'Vui lòng kiểm tra các lỗi sau:';
          Object.keys(serverErrors).forEach((field) => {
            errorMessage += `\n- ${serverErrors[field].join(', ')}`;
          });
        } else {
          errorMessage = err.response.data?.message || errorMessage;
        }
      }
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBlur = (field) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  const handleItemBlur = (index, field) => {
    setTouchedFields((prev) => {
      const itemsTouched = { ...(prev.items || {}) };
      if (!itemsTouched[index]) itemsTouched[index] = {};
      itemsTouched[index][field] = true;
      return { ...prev, items: itemsTouched };
    });
  };

  const hasError = (field) => touchedFields[field] && errors[field];
  const hasItemError = (index, field) =>
    touchedFields.items?.[index]?.[field] && errors.items?.[index]?.[field];

  const translateUnit = (unit) => {
    const unitMap = {
      'piece': 'cái',
      'g': 'g',
      'kg': 'kg',
      'ml': 'ml',
      'l': 'l',
      'box': 'hộp',
      'pack': 'gói',
      'bottle': 'chai',
      'can': 'lon'
    };
    return unitMap[unit] || unit || 'cái';
  };

  return (
    <div className="create-grn-container">
      <div className="create-grn-header">
        <h1>Tạo phiếu nhập (GRN)</h1>
        <button className="back-button" onClick={() => navigate('/grn')}>
          Quay lại danh sách GRN
        </button>
      </div>

      <form onSubmit={handleSubmit} className="create-grn-form">
        <div className="grn-form-card">
          <div className="form-row">
            <div className={`form-group ${hasError('supplierId') ? 'has-error' : ''}`}>
              <label htmlFor="supplierId">Nhà cung cấp *</label>
              <select
                id="supplierId"
                name="supplierId"
                value={formData.supplierId}
                onChange={handleInputChange}
                onBlur={() => handleBlur('supplierId')}
                required
              >
                <option value="">Chọn nhà cung cấp</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
              {hasError('supplierId') && (
                <div className="error-message">{errors.supplierId}</div>
              )}
            </div>

            <div
              className={`form-group ${hasError('referenceNumber') ? 'has-error' : ''}`}
            >
              <label htmlFor="referenceNumber">Số hóa đơn *</label>
              <input
                type="text"
                id="referenceNumber"
                name="referenceNumber"
                value={formData.referenceNumber}
                onChange={handleInputChange}
                onBlur={() => handleBlur('referenceNumber')}
                placeholder="VD: INV-001"
                required
              />
              {hasError('referenceNumber') && (
                <div className="error-message">{errors.referenceNumber}</div>
              )}
            </div>

            <div className="form-group">
              <label>Số tham chiếu GRN</label>
              <input
                type="text"
                value="Sẽ được tạo tự động"
                disabled
                className="disabled-input"
                style={{
                  backgroundColor: '#f5f5f5',
                  color: '#666',
                  cursor: 'not-allowed'
                }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="deliveryDate">Ngày mua *</label>
              <input
                type="date"
                id="deliveryDate"
                name="deliveryDate"
                value={formData.deliveryDate}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Ghi chú (không bắt buộc)</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="2"
              placeholder="Ghi chú thêm cho phiếu GRN này"
            />
          </div>

          <div className="items-section">
            <div className="items-header">
              <h3>Danh sách mặt hàng</h3>
              <button type="button" className="add-item-btn" onClick={addItem}>
                Thêm dòng hàng
              </button>
            </div>

            <div className="items-table-container">
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Mặt hàng *</th>
                    <th className="item-code-col">SKU/Mã vạch</th>
                    <th>Danh mục</th>
                    <th>Số lượng *</th>
                    <th>Giá nhập (VNĐ) *</th>
                    <th>Giá bán (VNĐ)</th>
                    <th>Thành tiền (VNĐ)</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => (
                    <tr
                      key={index}
                      className={
                        Object.values(errors.items?.[index] || {}).some(Boolean)
                          ? 'has-error-row'
                          : ''
                      }
                    >
                      <td className="search-dropdown-cell">
                        <SearchDropdown
                          allItems={items}
                          onItemSelect={(selectedItem) =>
                            handleSearchItemSelect(index, selectedItem)
                          }
                        />
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) =>
                            handleItemChange(index, 'name', e.target.value)
                          }
                          onBlur={() => handleItemBlur(index, 'name')}
                          className={`item-name-input ${
                            hasItemError(index, 'name') ? 'has-error' : ''
                          }`}
                          placeholder="Nhập tên mặt hàng"
                          required
                        />
                        {hasItemError(index, 'name') && (
                          <div className="error-message">
                            {errors.items[index].name}
                          </div>
                        )}
                      </td>
                      <td className="item-code-col">
                        {item.isNew ? (
                          <span className="sku-badge">{item.sku || 'Tự sinh'}</span>
                        ) : (
                          <span className="sku-badge">
                            {item.sku || item.barcode || 'N/A'}
                          </span>
                        )}
                      </td>
                      <td>
                        <select
                          value={item.category}
                          onChange={(e) =>
                            handleItemChange(index, 'category', e.target.value)
                          }
                          required
                        >
                          <option value="Cake">Bánh</option>
                          <option value="Cake Ingredients">Nguyên liệu</option>
                          <option value="Party Items">Đồ trang trí</option>
                        </select>
                      </td>
                      <td>
                        <div className="quantity-with-unit">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(index, 'quantity', e.target.value)
                            }
                            onBlur={() => handleItemBlur(index, 'quantity')}
                            min={item.unit === 'g' || item.unit === 'ml' ? '0.1' : '1'}
                            step={item.unit === 'g' || item.unit === 'ml' ? '0.1' : '1'}
                            className={hasItemError(index, 'quantity') ? 'has-error' : ''}
                            required
                          />
                          {item.isNew ? (
                            <select
                              value={item.unit}
                              onChange={(e) =>
                                handleItemChange(index, 'unit', e.target.value)
                              }
                              className="unit-selector"
                            >
                              {item.category === 'Cake Ingredients' ? (
                                <>
                                  <option value="g">g</option>
                                  <option value="ml">ml</option>
                                  <option value="piece">cái</option>
                                </>
                              ) : (
                                <option value="piece">cái</option>
                              )}
                            </select>
                          ) : (
                            <span className="unit-display">{translateUnit(item.unit)}</span>
                          )}
                        </div>
                        {hasItemError(index, 'quantity') && (
                          <div className="error-message">
                            {errors.items[index].quantity}
                          </div>
                        )}
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleItemChange(index, 'unitPrice', e.target.value)
                          }
                          onBlur={() => handleItemBlur(index, 'unitPrice')}
                          step="0.01"
                          min="0.01"
                          placeholder="0.00"
                          className={hasItemError(index, 'unitPrice') ? 'has-error' : ''}
                          required
                        />
                        {hasItemError(index, 'unitPrice') && (
                          <div className="error-message">
                            {errors.items[index].unitPrice}
                          </div>
                        )}
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.sellingPrice}
                          onChange={(e) =>
                            handleItemChange(index, 'sellingPrice', e.target.value)
                          }
                          step="0.01"
                          min="0.01"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="item-total">
                        {(
                          (Number(item.quantity) || 0) *
                          (parseFloat(item.unitPrice) || 0)
                        ).toFixed(2)}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="remove-item-btn"
                          onClick={() => handleRemoveClick(index)}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="6" className="total-label">
                      Tổng cộng:
                    </td>
                    <td colSpan="2" className="total-value">
                      VNĐ {calculateTotal().toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate('/grn')}
            >
              Hủy
            </button>
            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="spinner"></span>
                  Đang tạo…
                </>
              ) : (
                'Tạo GRN'
              )}
            </button>
          </div>
        </div>
      </form>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Xác nhận xóa"
        message="Bạn có chắc muốn xóa dòng hàng này khỏi GRN?"
        onConfirm={confirmRemove}
        onCancel={cancelRemove}
      />
    </div>
  );
};

export default CreateGRN;   