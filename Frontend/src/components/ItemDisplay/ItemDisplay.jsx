// ItemDisplay.jsx
import React, { useContext } from 'react'
import './ItemDisplay.css'
import { StoreContext } from '../../context/StoreContext'
import Items from '../Items/Items'

const ItemDisplay = ({ category, customItems }) => {
  const { item_list } = useContext(StoreContext);

  // 👉 Map nhãn hiển thị tiếng Việt
  const categoryLabel = {
    'All': 'Tất cả sản phẩm',
    'Cake': 'Bánh',
    'Cake Ingredients': 'Nguyên liệu làm bánh',
    'Party Items': 'Đồ trang trí tiệc'
  };

  // Data hiển thị
  const displayItems = customItems || (
    category === "All" ? item_list : item_list.filter((item) => item.category === category)
  );

  // Tiêu đề
  const title = customItems
    ? `Kết quả tìm kiếm (${displayItems.length})`
    : categoryLabel[category] || category;

  return (
    <div className='item-display' id='item-display'>
      <h2>{title}</h2>
      <div className="item-display-list">
        {displayItems.map((item) => (
          <Items
            key={item.id}
            id={item.id}
            name={item.name}
            price={item.selling_price || item.cost_price || 0}
            image={item.image}
            category={item.category}
            weight_value={item.weight_value}
            weight_unit={item.weight_unit}
            unit={item.unit}
            rating={item.rating || 0}
            stock_quantity={item.stock_quantity || 0}
          />
        ))}
      </div>
    </div>
  )
}

export default ItemDisplay
