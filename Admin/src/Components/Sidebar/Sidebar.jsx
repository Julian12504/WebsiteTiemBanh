import React, { useContext } from 'react'
import './Sidebar.css'
import assets from '../../assets/assets'
import { NavLink } from 'react-router-dom'
import { AdminAuthContext } from '../../context/AdminAuthContext'

const Sidebar = () => {
  const { hasRole } = useContext(AdminAuthContext);

  return (
    <div className='sidebar'>
      <div className="sidebar-options">
        {/* Trang tổng quan - chỉ cho admin */}
        {hasRole('admin') && (
          <NavLink to='/dashboard' className="sidebar-option" title="Bảng điều khiển">
            <img src={assets.dashboard_icon} alt=''/>
            <p>Bảng điều khiển</p>
          </NavLink>
        )}
        
        {/* Báo cáo - chỉ cho admin */}
        {hasRole('admin') && (
          <NavLink to='/reports' className="sidebar-option" title="Báo cáo">
            <img src={assets.reports_icon} alt=''/>
            <p>Báo cáo</p>
          </NavLink>
        )}
        
        {/* Thêm sản phẩm - hiển thị cho mọi vai trò */}
        <NavLink to='/add' className="sidebar-option" title="Thêm sản phẩm mới">
          <img src={assets.add_icon} alt=''/>
          <p>Thêm sản phẩm</p>
        </NavLink>
        
        {/* Danh sách tồn kho - cho tất cả */}
        <NavLink to='/list' className="sidebar-option" title="Danh sách sản phẩm tồn kho">
          <img src={assets.order_icon} alt=''/>
          <p>Tồn kho</p>
        </NavLink>
        
        {/* Đơn hàng - cho tất cả */}
        <NavLink to='/orders' className="sidebar-option" title="Quản lý đơn hàng">
          <img src={assets.basket_icon} alt=''/>
          <p>Đơn hàng</p>
        </NavLink>
        
        {/* Nhà cung cấp - chỉ cho admin */}
        {hasRole('admin') && (
          <NavLink to="/suppliers" className="sidebar-option" title="Nhà cung cấp">
            <img src={assets.supplier_icon} alt=''/>
            <p>Nhà cung cấp</p>
          </NavLink>
        )}
        
        {/* Phiếu nhập hàng - cho tất cả */}
        <NavLink to='/grn' className="sidebar-option" title="Phiếu nhập hàng (GRN)">
          <img src={assets.grn_icon} alt=''/>
          <p>Phiếu nhập</p>
        </NavLink>
        
        {/* Quản lý nhân viên - chỉ cho admin */}
        {hasRole('admin') && (
          <NavLink to='/employee-management' className="sidebar-option" title="Quản lý người dùng / nhân viên">
            <img src={assets.user_icon || assets.add_icon} alt=''/>
            <p>Quản lý nhân viên</p>
          </NavLink>
        )}
      </div>
    </div>
  )
}

export default Sidebar
