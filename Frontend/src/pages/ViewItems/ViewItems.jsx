import { useState, useContext, useMemo } from 'react'
import './ViewItems.css'
import CategoryFilter from '../../Components/CategoryFilter/CategoryFilter'
import ItemDisplay from '../../Components/ItemDisplay/ItemDisplay'
import { StoreContext } from '../../context/StoreContext'

// Function để bỏ dấu tiếng Việt
const removeVietnameseTones = (str) => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

const ViewItems = () => {
  const { item_list } = useContext(StoreContext);
  const [category, setCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [sortBy, setSortBy] = useState('newest');

  // Lọc sản phẩm theo tất cả điều kiện
  const filteredItems = useMemo(() => {
    let result = item_list;

    // Lọc theo danh mục
    if (category !== 'All') {
      result = result.filter(item => item.category === category);
    }

    // Lọc theo tìm kiếm
    if (searchTerm.trim()) {
      const searchNormalized = removeVietnameseTones(searchTerm);
      result = result.filter(item => {
        const nameNormalized = removeVietnameseTones(item.name);
        const descNormalized = removeVietnameseTones(item.description || '');
        return (
          nameNormalized.includes(searchNormalized) ||
          descNormalized.includes(searchNormalized)
        );
      });
    }

    // Lọc theo giá
    result = result.filter(item => {
      const price = item.selling_price || item.cost_price || 0;
      return price >= minPrice && price <= maxPrice;
    });

    // Sắp xếp
    result = [...result].sort((a, b) => {
      const priceA = a.selling_price || a.cost_price || 0;
      const priceB = b.selling_price || b.cost_price || 0;

      switch (sortBy) {
        case 'price-low':
          return priceA - priceB;
        case 'price-high':
          return priceB - priceA;
        case 'name':
          return a.name.localeCompare(b.name, 'vi');
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
        default:
          return 0;
      }
    });

    return result;
  }, [item_list, category, searchTerm, minPrice, maxPrice, sortBy]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handlePriceChange = (min, max) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
  };

  return (
    <div className="view-items">
      <div className="view-items-sidebar">
        <CategoryFilter 
          category={category}
          setCategory={setCategory}
          onSearch={handleSearch}
          onPriceChange={handlePriceChange}
          onSortChange={handleSortChange}
          searchTerm={searchTerm}
          minPrice={minPrice}
          maxPrice={maxPrice}
          sortBy={sortBy}
        />
      </div>
      
      <div className="view-items-content">
        <ItemDisplay 
          category={category} 
          customItems={filteredItems}
        />
      </div>
    </div>
  )
}

export default ViewItems