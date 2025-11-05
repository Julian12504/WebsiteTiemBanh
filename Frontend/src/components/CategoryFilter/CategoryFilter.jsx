import { useState, useContext } from 'react';
import './CategoryFilter.css';
import PropTypes from 'prop-types';
import { StoreContext } from '../../context/StoreContext';

const CategoryFilter = ({ 
  category = 'All',
  setCategory = () => {},
  onSearch = () => {},
  onPriceChange = () => {},
  onSortChange = () => {},
  searchTerm = '',
  minPrice = 0,
  maxPrice = 1000000,
  sortBy = 'newest'
}) => {
  const { item_list } = useContext(StoreContext);
  
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);
  const [localSortBy, setLocalSortBy] = useState(sortBy);

  // Map hiển thị tiếng Việt
  const labelMap = {
    'Cake': 'Bánh',
    'Cake Ingredients': 'Nguyên liệu làm bánh',
    'Party Items': 'Đồ trang trí tiệc'
  };

  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    if (onSearch) onSearch(value);
  };

  // Xử lý lọc giá
  const handleMinPriceChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setLocalMinPrice(value);
    if (onPriceChange) onPriceChange(value, localMaxPrice);
  };

  const handleMaxPriceChange = (e) => {
    const value = parseInt(e.target.value) || 1000000;
    setLocalMaxPrice(value);
    if (onPriceChange) onPriceChange(localMinPrice, value);
  };

  // Xử lý sắp xếp
  const handleSortChange = (e) => {
    const value = e.target.value;
    setLocalSortBy(value);
    if (onSortChange) onSortChange(value);
  };

  // Đặt lại filters
  const handleReset = () => {
    setLocalSearchTerm('');
    setLocalMinPrice(0);
    setLocalMaxPrice(1000000);
    setLocalSortBy('newest');
    setCategory('All');
    if (onSearch) onSearch('');
    if (onPriceChange) onPriceChange(0, 1000000);
    if (onSortChange) onSortChange('newest');
  };

  // Tính số sản phẩm theo danh mục
  const getCategoryCount = (cat) => {
    return item_list.filter(item => item.category === cat).length;
  };

  // Danh sách danh mục
  const categories = [
    { key: 'All', label: 'Tất cả sản phẩm' },
    { key: 'Cake', label: labelMap['Cake'] },
    { key: 'Cake Ingredients', label: labelMap['Cake Ingredients'] },
    { key: 'Party Items', label: labelMap['Party Items'] }
  ];

  return (
    <div className='category-filter'>
      {/* Header với title */}
      <div className='filter-header'>
        <div className='filter-header-left'>
          <h1>Tìm Sản Phẩm</h1>
        </div>
      </div>

      {/* Search Bar */}
      <div className='search-bar-wrapper'>
        <input
          type='text'
          className='search-input'
          placeholder='🔍 Tìm kiếm sản phẩm...'
          value={localSearchTerm}
          onChange={handleSearch}
        />
      </div>

      {/* Filters Section - Always Visible */}
      <div className='filters-section'>
          {/* Category Filter */}
          <div className='filter-group'>
            <h3>📂 Danh Mục</h3>
            <div className='category-buttons'>
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  className={`category-btn ${category === cat.key ? 'active' : ''}`}
                  onClick={() => setCategory(cat.key)}
                >
                  <span className='btn-label'>{cat.label}</span>
                  {cat.key !== 'All' && (
                    <span className='category-count'>
                      ({getCategoryCount(cat.key)})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div className='filter-group'>
            <h3>💰 Khoảng Giá</h3>
            <div className='price-filter'>
              <div className='price-input-group'>
                <label>Từ:</label>
                <input
                  type='number'
                  value={localMinPrice}
                  onChange={handleMinPriceChange}
                  placeholder='0'
                  min='0'
                />
                <span>đ</span>
              </div>
              <span className='price-separator'>-</span>
              <div className='price-input-group'>
                <label>Đến:</label>
                <input
                  type='number'
                  value={localMaxPrice}
                  onChange={handleMaxPriceChange}
                  placeholder='1,000,000'
                  min={localMinPrice}
                />
                <span>đ</span>
              </div>
            </div>
            <div className='price-range'>
              <input
                type='range'
                min='0'
                max='1000000'
                step='10000'
                value={localMinPrice}
                onChange={handleMinPriceChange}
                className='range-slider'
              />
              <input
                type='range'
                min='0'
                max='1000000'
                step='10000'
                value={localMaxPrice}
                onChange={handleMaxPriceChange}
                className='range-slider'
              />
            </div>
          </div>

          {/* Sort Filter */}
          <div className='filter-group'>
            <h3>↕️ Sắp Xếp</h3>
            <select 
              className='sort-select'
              value={localSortBy}
              onChange={handleSortChange}
            >
              <option value='newest'>Mới nhất</option>
              <option value='price-low'>Giá: Thấp → Cao</option>
              <option value='price-high'>Giá: Cao → Thấp</option>
              <option value='name'>Tên: A → Z</option>
              <option value='rating'>Đánh giá cao nhất</option>
            </select>
          </div>

          {/* Reset Button */}
          <button className='reset-filters-btn' onClick={handleReset}>
            🔄 Đặt lại bộ lọc
          </button>
        </div>

      {/* Active Filters Display */}
      <div className='active-filters'>
        {category !== 'All' && (
          <span className='filter-tag'>
            Danh mục: {labelMap[category] || category}
            <button onClick={() => setCategory('All')}>×</button>
          </span>
        )}
        {localSearchTerm && (
          <span className='filter-tag'>
            Tìm kiếm: &quot;{localSearchTerm}&quot;
            <button onClick={() => {
              setLocalSearchTerm('');
              if (onSearch) onSearch('');
            }}>×</button>
          </span>
        )}
        {(localMinPrice > 0 || localMaxPrice < 1000000) && (
          <span className='filter-tag'>
            Giá: {localMinPrice.toLocaleString()} - {localMaxPrice.toLocaleString()} đ
            <button onClick={() => {
              setLocalMinPrice(0);
              setLocalMaxPrice(1000000);
              if (onPriceChange) onPriceChange(0, 1000000);
            }}>×</button>
          </span>
        )}
        {localSortBy !== 'newest' && (
          <span className='filter-tag'>
            Sắp xếp: {localSortBy}
            <button onClick={() => {
              setLocalSortBy('newest');
              if (onSortChange) onSortChange('newest');
            }}>×</button>
          </span>
        )}
      </div>

      <hr className='filter-divider' />
    </div>
  );
};

CategoryFilter.propTypes = {
  category: PropTypes.string,
  setCategory: PropTypes.func,
  onSearch: PropTypes.func,
  onPriceChange: PropTypes.func,
  onSortChange: PropTypes.func,
  searchTerm: PropTypes.string,
  minPrice: PropTypes.number,
  maxPrice: PropTypes.number,
  sortBy: PropTypes.string
};

export default CategoryFilter;
