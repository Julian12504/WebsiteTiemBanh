import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import ItemDisplay from '../../components/ItemDisplay/ItemDisplay';

describe('ItemDisplay Component', () => {
  const mockUrl = 'http://localhost:4000';
  const mockToken = 'mock-token';
  const mockAddToCart = vi.fn();

  const mockItems = [
    {
      id: '1',
      name: 'Chocolate Cake',
      description: 'Delicious chocolate cake',
      selling_price: 25000,
      image: 'chocolate-cake.jpg',
      category: 'Cake',
      rating: 4.5,
      stock_quantity: 10,
      weight_value: 500,
      weight_unit: 'g',
      unit: 'piece'
    },
    {
      id: '2',
      name: 'Vanilla Cupcake',
      description: 'Sweet vanilla cupcake',
      selling_price: 15000,
      image: 'vanilla-cupcake.jpg',
      category: 'Cupcake',
      rating: 4.0,
      stock_quantity: 5,
      weight_value: 100,
      weight_unit: 'g',
      unit: 'piece'
    }
  ];

  const renderItemDisplay = (category = 'All', customItems = null) => {
    return render(
      <BrowserRouter>
        <StoreContext.Provider value={{ 
          url: mockUrl, 
          token: mockToken, 
          addToCart: mockAddToCart,
          item_list: mockItems 
        }}>
          <ItemDisplay category={category} customItems={customItems} />
        </StoreContext.Provider>
      </BrowserRouter>
    );
  };

  it('TC_FE_ITEM_001: Should render all items when category is "All"', () => {
    renderItemDisplay('All');
    expect(screen.getByText('Chocolate Cake')).toBeInTheDocument();
    expect(screen.getByText('Vanilla Cupcake')).toBeInTheDocument();
  });

  it('TC_FE_ITEM_002: Should filter items by category', () => {
    renderItemDisplay('Cake');
    expect(screen.getByText('Chocolate Cake')).toBeInTheDocument();
    expect(screen.queryByText('Vanilla Cupcake')).not.toBeInTheDocument();
  });

  it('TC_FE_ITEM_003: Should display item price correctly', () => {
    renderItemDisplay();
    // Price format is "25.000 VNĐ" with space, not "25.000₫"
    expect(screen.getByText(/25\.000/i)).toBeInTheDocument();
    expect(screen.getByText(/15\.000/i)).toBeInTheDocument();
  });

  it('TC_FE_ITEM_004: Should render empty state when no items match filter', () => {
    renderItemDisplay('Party Items'); // Category không có items
    expect(screen.queryByText('Chocolate Cake')).not.toBeInTheDocument();
    expect(screen.queryByText('Vanilla Cupcake')).not.toBeInTheDocument();
  });

  it('TC_FE_ITEM_005: Should display category title', () => {
    renderItemDisplay('All');
    expect(screen.getByText('Tất cả sản phẩm')).toBeInTheDocument();
  });
});
