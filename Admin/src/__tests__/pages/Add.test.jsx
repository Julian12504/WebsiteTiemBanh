import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AdminAuthContext } from '../../context/AdminAuthContext';
import Add from '../../Pages/Add/Add';

vi.mock('axios');

describe('Add Component - Add Product Page', () => {
  const mockUrl = 'http://localhost:4000';
  const mockToken = 'mock-admin-token';
  const mockHasRole = vi.fn(() => true);

  const renderAdd = () => {
    return render(
      <BrowserRouter>
        <AdminAuthContext.Provider value={{ token: mockToken, hasRole: mockHasRole }}>
          <Add url={mockUrl} />
        </AdminAuthContext.Provider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('TC_ADMIN_ADD_001: Should render add product form', () => {
    renderAdd();
    // Page header uses Vietnamese text 'Thêm mặt hàng mới'
    expect(screen.getByText(/Thêm mặt hàng mới/i)).toBeInTheDocument();
  });

  it('TC_ADMIN_ADD_002: Should have name input field', () => {
    renderAdd();
    // Input placeholder in Add.jsx: 'Nhập tên mặt hàng'
    const nameInput = screen.getByPlaceholderText(/Nhập tên mặt hàng/i);
    expect(nameInput).toBeInTheDocument();
  });

  it('TC_ADMIN_ADD_003: Should have category select dropdown', () => {
    renderAdd();
    // select has label 'Danh mục*' so use getByLabelText
    const categorySelect = screen.getByLabelText(/Danh mục\*/i);
    expect(categorySelect).toBeInTheDocument();
  });

  it('TC_ADMIN_ADD_004: Should update input values on change', () => {
    renderAdd();
    const nameInput = screen.getByPlaceholderText(/Nhập tên mặt hàng/i);
    
    fireEvent.change(nameInput, { target: { value: 'Test Cake' } });
    expect(nameInput).toHaveValue('Test Cake');
  });

  it('TC_ADMIN_ADD_005: Should have cost price and selling price fields', () => {
    renderAdd();
    // Labels in Add.jsx: 'Giá vốn (VNĐ)*' and 'Giá bán (VNĐ)'
    const costPriceInput = screen.getByLabelText(/Giá vốn \(VNĐ\)\*/i);
    const sellingPriceInput = screen.getByLabelText(/Giá bán \(VNĐ\)/i);
    
    expect(costPriceInput).toBeInTheDocument();
    expect(sellingPriceInput).toBeInTheDocument();
  });

  it('TC_ADMIN_ADD_006: Should have image upload section', () => {
    renderAdd();
    // Image upload labeled by 'Ảnh sản phẩm'
    const uploadLabel = screen.getByText(/Ảnh sản phẩm/i);
    expect(uploadLabel).toBeInTheDocument();
  });

  it('TC_ADMIN_ADD_007: Should have submit button', () => {
    renderAdd();
    // Submit button text in Add.jsx is exactly 'Thêm mặt hàng'
    const submitButton = screen.getByRole('button', { name: /Thêm mặt hàng/i });
    expect(submitButton).toBeInTheDocument();
  });
});
