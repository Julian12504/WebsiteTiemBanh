// ExploreCategories.jsx
import './ExploreCategories.css'
import PropTypes from 'prop-types';
import { category_list } from '../../assets/assets'

const ExploreCategories = ({ category, setCategory }) => {
  // Map hiển thị tiếng Việt
  const labelMap = {
    'Cake': 'Bánh',
    'Cake Ingredients': 'Nguyên liệu làm bánh',
    'Party Items': 'Đồ trang trí tiệc'
  };

  return (
    <div className='explore-categories' id='explore-categories'>
      <h1>Tìm sản phẩm theo danh mục</h1>
      <p className='explore-categories-text'>Lọc sản phẩm theo danh mục</p>

      <div className='explore-category-list'>
        {category_list.map((item, index) => (
          <div
            key={index}
            className={`explore-category-list-item ${category === item.category ? 'active' : ''}`}
            onClick={() => setCategory(prev => prev === item.category ? "All" : item.category)}
          >
            <img
              className={category === item.category ? 'active' : ''}
              src={item.category_image}
              alt={labelMap[item.category] || item.category}
            />
            <p>{labelMap[item.category] || item.category}</p>
          </div>
        ))}
      </div>

      <hr />  
    </div>
  )
}

ExploreCategories.propTypes = {
  category: PropTypes.string.isRequired,
  setCategory: PropTypes.func.isRequired,
};

export default ExploreCategories
