import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'test-secret-key';

/**
 * Tạo JWT token cho user
 */
export const generateUserToken = (userId) => {
  return jwt.sign({ userId, role: 'user' }, SECRET_KEY, { expiresIn: '1h' });
};

/**
 * Tạo JWT token cho admin
 */
export const generateAdminToken = (adminId) => {
  return jwt.sign({ adminId, role: 'admin' }, SECRET_KEY, { expiresIn: '1h' });
};

/**
 * Mock dữ liệu người dùng
 */
export const createMockUser = (overrides = {}) => {
  const timestamp = Date.now();
  return {
    name: 'Test User',
    email: `test-${timestamp}@example.com`,
    password: 'TestPassword123',
    phone: '0123456789',
    address: '123 Đường ABC, TP.HCM',
    ...overrides,
  };
};

/**
 * Mock dữ liệu sản phẩm
 */
export const createMockItem = (overrides = {}) => {
  const timestamp = Date.now();
  return {
    name: `Bánh Test ${timestamp}`,
    description: 'Bánh test description',
    category: 'Bánh sinh nhật',
    price: 150000,
    stock: 50,
    sku: `SKU-${timestamp}`,
    ...overrides,
  };
};

/**
 * Mock dữ liệu giỏ hàng
 */
export const createMockCartItem = (overrides = {}) => {
  return {
    itemId: 1,
    quantity: 2,
    price: 150000,
    ...overrides,
  };
};

/**
 * Mock dữ liệu đơn hàng
 */
export const createMockOrder = (overrides = {}) => {
  const timestamp = Date.now();
  return {
    userId: 1,
    items: [
      {
        itemId: 1,
        quantity: 2,
        price: 150000,
      },
    ],
    totalAmount: 300000,
    address: `123 Đường ABC-${timestamp}, TP.HCM`,
    firstName: 'Nguyen',
    lastName: 'Van A',
    contactNumber: '0123456789',
    paymentMethod: 'test',
    ...overrides,
  };
};

export default {
  generateUserToken,
  generateAdminToken,
  createMockUser,
  createMockItem,
  createMockCartItem,
  createMockOrder,
};
