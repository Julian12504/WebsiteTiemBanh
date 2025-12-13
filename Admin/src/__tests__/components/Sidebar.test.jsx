import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AdminAuthContext } from '../../context/AdminAuthContext';
import Sidebar from '../../Components/Sidebar/Sidebar';

describe('Sidebar Component', () => {
  const renderSidebar = (role = 'admin') => {
    const hasRole = vi.fn((requiredRole) => {
      if (role === 'admin') return true;
      return requiredRole === role;
    });

    return render(
      <BrowserRouter>
        <AdminAuthContext.Provider value={{ hasRole }}>
          <Sidebar />
        </AdminAuthContext.Provider>
      </BrowserRouter>
    );
  };

  it('TC_ADMIN_SIDEBAR_001: Should render sidebar container', () => {
    const { container } = renderSidebar();
    expect(container.querySelector('.sidebar')).toBeInTheDocument();
  });

  it('TC_ADMIN_SIDEBAR_002: Admin should see dashboard link', () => {
    renderSidebar('admin');
    expect(screen.getByText('Bảng điều khiển')).toBeInTheDocument();
  });

  it('TC_ADMIN_SIDEBAR_003: Admin should see reports link', () => {
    renderSidebar('admin');
    expect(screen.getByText('Báo cáo')).toBeInTheDocument();
  });

  it('TC_ADMIN_SIDEBAR_004: All users should see add product link', () => {
    renderSidebar('staff');
    expect(screen.getByText('Thêm sản phẩm')).toBeInTheDocument();
  });

  it('TC_ADMIN_SIDEBAR_005: All users should see inventory link', () => {
    renderSidebar('staff');
    expect(screen.getByText('Tồn kho')).toBeInTheDocument();
  });

  it('TC_ADMIN_SIDEBAR_006: All users should see orders link', () => {
    renderSidebar('staff');
    expect(screen.getByText('Đơn hàng')).toBeInTheDocument();
  });

  it('TC_ADMIN_SIDEBAR_007: Staff should not see dashboard link', () => {
    renderSidebar('staff');
    expect(screen.queryByText('Bảng điều khiển')).not.toBeInTheDocument();
  });
});
