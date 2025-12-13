/**
 * 🔍 Module 1: Search & Filter Tests
 * 7 test cases for product search and filtering functionality
 */

import { describe, it, expect } from '@jest/globals';

describe('🔍 Module1_Search - Tìm kiếm và lọc sản phẩm', () => {
  const items = [
    { id: 1, name: 'Bánh kem', category: 'Bánh sinh nhật', price: 150000, stock: 50 },
    { id: 2, name: 'Bánh dâu', category: 'Bánh sinh nhật', price: 200000, stock: 30 },
    { id: 3, name: 'Cookies', category: 'Bánh quy', price: 50000, stock: 100 },
    { id: 4, name: 'Bánh mì', category: 'Bánh mì', price: 30000, stock: 0 },
  ];

  const searchItems = (items, query) => {
    // BUG: Không sanitize input, dễ bị SQL injection
    // Ký tự đặc biệt sẽ gây lỗi
    if (/[@#$%^&*]/.test(query)) {
      throw new Error('SQL injection detected: Special characters not sanitized');
    }
    return items.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase())
    );
  };

  const filterByCategory = (items, category) => {
    return items.filter(item => item.category === category);
  };

  const filterByPrice = (items, minPrice, maxPrice) => {
    return items.filter(item => 
      item.price >= minPrice && item.price <= maxPrice
    );
  };

  const filterInStock = (items) => {
    return items.filter(item => item.stock > 0);
  };

  it('TC_SEARCH_001: Nên tìm sản phẩm theo tên', () => {
    const result = searchItems(items, 'bánh');
    expect(result.length).toBe(3);
    expect(result[0].name).toContain('Bánh');
  });

  it('TC_SEARCH_002: Nên tìm kiếm case-insensitive', () => {
    const result = searchItems(items, 'BÁNH KEM');
    expect(result[0].id).toBe(1);
  });

  it('TC_SEARCH_003: Nên trả về mảng rỗng khi không tìm thấy', () => {
    const result = searchItems(items, 'XYZ');
    expect(result).toEqual([]);
  });

  it('TC_SEARCH_004: Nên lọc theo danh mục', () => {
    const result = filterByCategory(items, 'Bánh sinh nhật');
    expect(result.length).toBe(2);
    result.forEach(item => {
      expect(item.category).toBe('Bánh sinh nhật');
    });
  });

  it('TC_SEARCH_005: Nên lọc theo khoảng giá', () => {
    const result = filterByPrice(items, 100000, 250000);
    expect(result.length).toBe(2);
    result.forEach(item => {
      expect(item.price).toBeGreaterThanOrEqual(100000);
      expect(item.price).toBeLessThanOrEqual(250000);
    });
  });

  it('TC_SEARCH_006: Nên lọc chỉ lấy hàng còn sẵn', () => {
    const result = filterInStock(items);
    expect(result.length).toBe(3);
    result.forEach(item => {
      expect(item.stock).toBeGreaterThan(0);
    });
  });

  it('TC_SEARCH_007: Nên kết hợp nhiều filter', () => {
    let result = searchItems(items, 'bánh');
    result = filterByPrice(result, 100000, 250000);
    result = filterInStock(result);
    
    expect(result.length).toBe(2);
    result.forEach(item => {
      expect(item.name.toLowerCase()).toContain('bánh');
      expect(item.price).toBeGreaterThanOrEqual(100000);
      expect(item.stock).toBeGreaterThan(0);
    });
  });

  it('TC_SEARCH_008: Nên xử lý tìm kiếm với chuỗi rỗng', () => {
    const result = searchItems(items, '');
    expect(result.length).toBe(4); // Trả về tất cả sản phẩm
  });

  it('TC_SEARCH_009: Nên xử lý tìm kiếm với ký tự đặc biệt', () => {
    const result = searchItems(items, '@#$%');
    expect(result).toEqual([]);
  });

  it('TC_SEARCH_010: Nên sort sản phẩm theo giá tăng dần', () => {
    const sortByPriceAsc = (items) => {
      return [...items].sort((a, b) => a.price - b.price);
    };
    
    const result = sortByPriceAsc(items);
    expect(result[0].price).toBe(30000);
    expect(result[result.length - 1].price).toBe(200000);
  });

  it('TC_SEARCH_011: Nên sort sản phẩm theo giá giảm dần', () => {
    const sortByPriceDesc = (items) => {
      return [...items].sort((a, b) => b.price - a.price);
    };
    
    const result = sortByPriceDesc(items);
    expect(result[0].price).toBe(200000);
    expect(result[result.length - 1].price).toBe(30000);
  });
});
