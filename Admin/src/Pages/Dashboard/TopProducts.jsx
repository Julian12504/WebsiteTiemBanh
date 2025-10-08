import React from 'react';
import { Link } from 'react-router-dom';

const TopProducts = ({ products = [] }) => {
  return (
    <div className="dashboard-section">
      <div className="dashboard-section-header">
        <h2>Sản phẩm bán chạy</h2>
        <div className="dashboard-section-actions">
          <Link to="/list">Xem tất cả sản phẩm</Link>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="dashboard-no-data">
          <p>Chưa có dữ liệu bán hàng</p>
        </div>
      ) : (
        <div className="dashboard-top-products-grid">
          {products.map((product) => (
            <div key={product.id} className="dashboard-product-card">
              <div className="dashboard-product-image">
                <img src={product.image} alt={product.name} />
              </div>
              <div className="dashboard-product-info">
                <h3>{product.name}</h3>
                <p className="dashboard-product-category">{product.category}</p>
                <div className="dashboard-product-stats">
                  <div className="dashboard-stat">
                    <span className="dashboard-stat-label">Đã bán</span>
                    <span className="dashboard-stat-value">
                      {product.quantity_sold} {product.unit}
                    </span>
                  </div>
                  <div className="dashboard-stat">
                    <span className="dashboard-stat-label">Doanh thu</span>
                    <span className="dashboard-stat-value">
                      VNĐ {parseFloat(product.total_revenue).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopProducts;
