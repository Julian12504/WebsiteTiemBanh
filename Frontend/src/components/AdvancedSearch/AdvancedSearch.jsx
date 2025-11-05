import { useState, useContext } from 'react';
import './AdvancedSearch.css';
import PropTypes from 'prop-types';
import { StoreContext } from '../../context/StoreContext';

const AdvancedSearch = ({ onResults }) => {
  const { item_list } = useContext(StoreContext);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all'); // all, name, description, category
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const labelMap = {
    'Cake': 'Bánh',
    'Cake Ingredients': 'Nguyên liệu làm bánh',
    'Party Items': 'Đồ trang trí tiệc'
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === '') {
      setResults([]);
      setShowResults(false);
      return;
    }

    const queryLower = query.toLowerCase();
    let filtered = item_list;

    // Tìm kiếm theo loại
    switch (searchType) {
      case 'name':
        filtered = filtered.filter(item =>
          item.name.toLowerCase().includes(queryLower)
        );
        break;
      case 'description':
        filtered = filtered.filter(item =>
          item.description && item.description.toLowerCase().includes(queryLower)
        );
        break;
      case 'category':
        filtered = filtered.filter(item =>
          item.category.toLowerCase().includes(queryLower) ||
          labelMap[item.category]?.toLowerCase().includes(queryLower)
        );
        break;
      case 'all':
      default:
        filtered = filtered.filter(item =>
          item.name.toLowerCase().includes(queryLower) ||
          (item.description && item.description.toLowerCase().includes(queryLower)) ||
          item.category.toLowerCase().includes(queryLower)
        );
        break;
    }

    setResults(filtered.slice(0, 8)); // Limit to 8 results
    setShowResults(true);

    if (onResults) {
      onResults(filtered);
    }
  };

  const handleResultClick = () => {
    setSearchQuery('');
    setShowResults(false);
    setResults([]);
  };

  return (
    <div className='advanced-search'>
      <button
        className='advanced-search-btn'
        onClick={() => setIsOpen(!isOpen)}
      >
        🔍 Tìm Kiếm Nâng Cao
      </button>

      {isOpen && (
        <div className='advanced-search-panel'>
          <div className='search-header'>
            <h3>Tìm Kiếm Nâng Cao</h3>
            <button
              className='close-btn'
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          <div className='search-type-selector'>
            <label>Tìm kiếm theo:</label>
            <select
              value={searchType}
              onChange={(e) => {
                setSearchType(e.target.value);
                handleSearch({ target: { value: searchQuery } });
              }}
            >
              <option value='all'>Tất cả</option>
              <option value='name'>Tên sản phẩm</option>
              <option value='description'>Mô tả</option>
              <option value='category'>Danh mục</option>
            </select>
          </div>

          <div className='search-input-wrapper'>
            <input
              type='text'
              className='advanced-search-input'
              placeholder={`Nhập ${
                searchType === 'name'
                  ? 'tên sản phẩm'
                  : searchType === 'description'
                  ? 'mô tả'
                  : searchType === 'category'
                  ? 'danh mục'
                  : 'để tìm kiếm'
              }...`}
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

          {showResults && (
            <div className='search-results'>
              {results.length > 0 ? (
                <div className='results-list'>
                  <p className='results-count'>
                    Tìm thấy {results.length} kết quả
                  </p>
                  {results.map((item) => (
                    <div key={item.id || item._id} className='result-item'>
                      <img src={item.image} alt={item.name} />
                      <div className='result-info'>
                        <h4>{item.name}</h4>
                        <p className='result-category'>
                          {labelMap[item.category] || item.category}
                        </p>
                        <p className='result-price'>
                          {(item.selling_price || item.cost_price || 0).toLocaleString()} đ
                        </p>
                      </div>
                      <button
                        className='result-action-btn'
                        onClick={() => handleResultClick(item.id || item._id)}
                      >
                        Xem →
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='no-results'>
                  <p>😔 Không tìm thấy sản phẩm phù hợp</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

AdvancedSearch.propTypes = {
  onResults: PropTypes.func
};

export default AdvancedSearch;
