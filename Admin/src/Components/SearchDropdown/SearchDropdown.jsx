import React, { useState, useEffect, useRef } from 'react';
import './SearchDropdown.css';

// Chuyển đổi category từ tiếng Anh sang tiếng Việt
const translateCategory = (category) => {
  const categoryMap = {
    'Cake': 'Bánh',
    'Cake Ingredients': 'Nguyên liệu làm bánh',
    'Party Items': 'Đồ trang trí tiệc'
  };
  return categoryMap[category] || category;
};

const SearchDropdown = ({ allItems, onItemSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Lọc danh sách theo từ khóa tìm kiếm
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredItems([]);
    } else {
      const filtered = allItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  }, [searchTerm, allItems]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleItemSelect = (item) => {
    onItemSelect(item);
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  // Thêm mặt hàng mới nếu không tìm thấy
  const handleAddNewItem = () => {
    if (searchTerm.trim() !== '') {
      onItemSelect({
        id: 'new',
        name: searchTerm,
        category: 'Nguyên liệu làm bánh',
        price: ''
      });
      setSearchTerm('');
      setIsDropdownOpen(false);
    }
  };

  return (
    <div className="item-search-dropdown" ref={dropdownRef}>
      <input
        type="text"
        placeholder="Tìm kiếm hoặc nhập để thêm mặt hàng mới..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsDropdownOpen(true)}
        className="item-search-input"
      />

      {isDropdownOpen && searchTerm.trim() !== '' && (
        <div className="dropdown-menu">
          {filteredItems.length > 0 ? (
            <div className="dropdown-items">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  className="dropdown-item"
                  onClick={() => handleItemSelect(item)}
                >
                  <div className="item-name">{item.name}</div>
                  <div className="item-details">
                    <span className="item-category">{translateCategory(item.category)}</span>
                    <span className="item-price">
                      {parseFloat(item.selling_price || item.cost_price || 0).toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <p>Không tìm thấy mặt hàng nào phù hợp với "{searchTerm}"</p>
            </div>
          )}

          <div
            className="add-new-option"
            onClick={handleAddNewItem}
          >
            <span className="plus-icon">+</span> Thêm "{searchTerm}" như một mặt hàng mới
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
