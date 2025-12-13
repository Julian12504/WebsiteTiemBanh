# Chiến Lược Kiểm Thử (Test Strategy)
## Website Tiệm Bánh - Cake Fantasy

**Ngày tạo:** 10/12/2025  
**Dự án:** WebsiteTiemBanh  
**Mục tiêu:** Đảm bảo chất lượng phần mềm thông qua các cấp độ kiểm thử tự động và thủ công

---

## 📋 Tổng Quan

Chiến lược kiểm thử được thiết kế theo mô hình **Test Pyramid**, kết hợp giữa kiểm thử tự động và thủ công để đảm bảo:
- **Độ tin cậy cao** (reliability)
- **Phát hiện lỗi sớm** (early bug detection)
- **Tự động hóa tối đa** (maximize automation)
- **Phản hồi nhanh** (quick feedback)

```
        ┌─────────────────────┐
        │  Acceptance Tests   │  ← Thủ công (Manual)
        │   (User Stories)    │
        ├─────────────────────┤
        │    E2E Tests        │  ← Tự động (Cypress)
        │  (System Tests)     │
        ├─────────────────────┤
        │ Integration Tests   │  ← Tự động (Supertest)
        │   (API Testing)     │
        ├─────────────────────┤
        │    Unit Tests       │  ← Tự động (Vitest/Jest)
        │ (Component/Logic)   │
        └─────────────────────┘
           Test Pyramid
```

---

## 🎯 Các Cấp Độ Kiểm Thử (Test Levels)

### 1️⃣ Unit Test (Kiểm Thử Đơn Vị) - TỰ ĐỘNG

#### **Mục đích**
Kiểm thử các đơn vị nhỏ nhất của code (function, component) một cách độc lập.

#### **Công cụ**
- **Frontend & Admin:** Vitest + React Testing Library
- **Backend:** Jest + Supertest

#### **Khi nào chạy**
- ✅ Mỗi khi commit code (Git hooks)
- ✅ Trong CI/CD pipeline (GitHub Actions)
- ✅ Khi developer đang code (watch mode)

#### **Ví dụ cụ thể từ dự án**

##### Frontend - Test Component React
```javascript
// File: Frontend/src/__tests__/components/LoginPopup.test.jsx
// Mục đích: Test component LoginPopup render đúng và xử lý sự kiện

describe('LoginPopup Component', () => {
  it('TC_LOGIN_001: Should render login form', () => {
    renderLoginPopup();
    // Kiểm tra tiêu đề "Đăng nhập" xuất hiện
    expect(screen.getByText(/Đăng nhập/i)).toBeInTheDocument();
  });

  it('TC_LOGIN_002: Should validate email input', () => {
    renderLoginPopup();
    const emailInput = screen.getByPlaceholderText(/Email/i);
    // Kiểm tra người dùng có thể nhập email
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput).toHaveValue('test@example.com');
  });
});
```

**Kết quả mong đợi:**
```
✓ Frontend/src/__tests__/components/LoginPopup.test.jsx (5 tests) 234ms
  ✓ TC_LOGIN_001: Should render login form
  ✓ TC_LOGIN_002: Should validate email input
  ✓ TC_LOGIN_003: Should have password field
  ✓ TC_LOGIN_004: Should have submit button
  ✓ TC_LOGIN_005: Should toggle to register mode
```

##### Backend - Test API Controller Logic
```javascript
// File: Backend/tests/auth.test.js
// Mục đích: Test logic xử lý đăng nhập

describe('User Authentication', () => {
  it('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/api/user/register')
      .send({
        name: 'Test User',
        email: 'newuser@test.com',
        password: 'password123'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body).toHaveProperty('token');
  });
});
```

#### **Cách chạy**
```powershell
# Frontend Unit Tests
cd Frontend
npm run test              # Watch mode
npm run test:run          # Run once
npm run test:coverage     # With coverage report

# Admin Unit Tests
cd Admin
npm run test:run

# Backend Unit Tests
cd Backend
npm test
npm run test:coverage
```

#### **Phạm vi kiểm thử Unit Test**

**Frontend/Admin:**
- ✅ Component rendering (hiển thị đúng UI)
- ✅ User interactions (click, input, submit)
- ✅ State management (useState, useContext)
- ✅ Props validation
- ✅ Conditional rendering

**Backend:**
- ✅ Controller logic (xử lý request/response)
- ✅ Model methods (CRUD operations)
- ✅ Validation functions (email, password format)
- ✅ Helper/utility functions
- ✅ Middleware (authentication, authorization)

#### **Coverage Target**
- **Mục tiêu:** ≥ 80% code coverage
- **Hiện tại:** 
  - Frontend: ~70% (cần bổ sung tests cho ProductDetail, Cart)
  - Admin: ~65% (cần bổ sung tests cho Orders, Dashboard)
  - Backend: ~75% (cần bổ sung tests cho GRN, Supplier)

---

### 2️⃣ Integration Test (Kiểm Thử Tích Hợp) - TỰ ĐỘNG

#### **Mục đích**
Kiểm thử sự tương tác giữa các module/component với nhau, đặc biệt là:
- API endpoints với Database
- Frontend components với Backend API
- Third-party services (Cloudinary, Payment gateway)

#### **Công cụ**
- **Backend API:** Supertest + Jest
- **Database:** MySQL test database hoặc mock Sequelize

#### **Khi nào chạy**
- ✅ Sau khi Unit Tests pass
- ✅ Trong CI/CD pipeline
- ✅ Trước khi merge Pull Request

#### **Ví dụ cụ thể từ dự án**

##### Test API Endpoint với Database
```javascript
// File: Backend/tests/order.test.js
// Mục đích: Test toàn bộ flow đặt hàng từ API → Controller → Model → Database

describe('Order API Integration Tests', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Setup: Tạo user và đăng nhập để lấy token
    const loginRes = await request(app)
      .post('/api/user/login')
      .send({ email: 'test@test.com', password: 'password123' });
    
    authToken = loginRes.body.token;
    userId = loginRes.body.userId;
  });

  it('TC_ORDER_INT_001: Should create order successfully', async () => {
    const orderData = {
      items: [
        { itemId: 1, quantity: 2 },
        { itemId: 2, quantity: 1 }
      ],
      deliveryAddress: 'Số 123, Quận 1, TP.HCM',
      paymentMethod: 'COD'
    };

    const response = await request(app)
      .post('/api/order/place')
      .set('Authorization', `Bearer ${authToken}`)
      .send(orderData);

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.orderId).toBeDefined();

    // Verify order was saved in database
    const order = await Order.findByPk(response.body.orderId);
    expect(order).not.toBeNull();
    expect(order.userId).toBe(userId);
    expect(order.status).toBe('Pending');
  });

  it('TC_ORDER_INT_002: Should fail when user not authenticated', async () => {
    const response = await request(app)
      .post('/api/order/place')
      .send({ items: [] });

    expect(response.status).toBe(401);
    expect(response.body.message).toContain('Not authorized');
  });
});
```

##### Test Cart API với Item Database
```javascript
// File: Backend/tests/cart.test.js
// Mục đích: Test giỏ hàng tương tác với database items

describe('Cart Integration Tests', () => {
  it('TC_CART_INT_001: Should add item to cart', async () => {
    const response = await request(app)
      .post('/api/cart/add')
      .set('Authorization', `Bearer ${token}`)
      .send({ itemId: 5, quantity: 3 });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Verify item exists in database
    const item = await Item.findByPk(5);
    expect(item).not.toBeNull();
  });
});
```

#### **Cách chạy**
```powershell
# Backend Integration Tests (đã có)
cd Backend
npm test -- tests/order.test.js
npm test -- tests/cart.test.js
npm test -- tests/search.test.js

# Chạy tất cả integration tests
npm test
```

#### **Phạm vi Integration Test**

**Backend API Testing:**
- ✅ POST /api/user/register (tạo user mới)
- ✅ POST /api/user/login (đăng nhập + trả token)
- ✅ POST /api/order/place (đặt hàng)
- ✅ POST /api/cart/add (thêm vào giỏ)
- ✅ GET /api/item/list (lấy danh sách sản phẩm)
- ⚠️ Cần bổ sung:
  - POST /api/item/add (admin thêm sản phẩm)
  - POST /api/grn/add (nhập kho)
  - PUT /api/order/status (cập nhật trạng thái)
  - GET /api/review/list (lấy đánh giá)

**Database Interactions:**
- ✅ CRUD operations qua Sequelize models
- ✅ Associations (User → Orders, Order → OrderItems)
- ✅ Transactions (đảm bảo data consistency)

---

### 3️⃣ System/E2E Test (Kiểm Thử Hệ Thống) - TỰ ĐỘNG

#### **Mục đích**
Giả lập hành vi người dùng thực tế trên trình duyệt, kiểm tra toàn bộ luồng nghiệp vụ từ đầu đến cuối.

#### **Công cụ**
- **Cypress** (recommended - modern, easy to debug)
- Hoặc Selenium/Playwright

#### **Khi nào chạy**
- ✅ Sau khi Integration Tests pass
- ✅ Trước khi release version mới
- ✅ Nightly builds (chạy vào ban đêm)

#### **Ví dụ cụ thể - User Journey**

##### Luồng 1: Đăng ký và Đăng nhập
```javascript
// File: cypress/e2e/user-registration.cy.js
// Mục đích: Test toàn bộ luồng đăng ký → đăng nhập → vào trang chủ

describe('E2E: User Registration and Login', () => {
  beforeEach(() => {
    // Mở trang chủ
    cy.visit('http://localhost:5173');
  });

  it('TC_E2E_001: New user can register and login successfully', () => {
    // Bước 1: Click nút "Đăng nhập"
    cy.contains('button', 'Đăng nhập').click();

    // Bước 2: Chuyển sang tab "Tạo tài khoản"
    cy.contains('Tạo tài khoản').click();

    // Bước 3: Điền form đăng ký
    cy.get('input[name="name"]').type('Nguyễn Văn A');
    cy.get('input[name="email"]').type(`testuser_${Date.now()}@example.com`);
    cy.get('input[name="password"]').type('MatKhau123!');

    // Bước 4: Click nút "Tạo tài khoản"
    cy.contains('button', 'Tạo tài khoản').click();

    // Bước 5: Kiểm tra đăng ký thành công
    cy.contains('Đăng ký thành công', { timeout: 5000 }).should('be.visible');

    // Bước 6: Chuyển sang tab "Đăng nhập"
    cy.contains('Đăng nhập').click();

    // Bước 7: Nhập thông tin đăng nhập
    cy.get('input[type="email"]').type('testuser@example.com');
    cy.get('input[type="password"]').type('MatKhau123!');

    // Bước 8: Click "Đăng nhập"
    cy.contains('button', 'Đăng nhập').click();

    // Bước 9: Verify đăng nhập thành công (xuất hiện tên user)
    cy.contains('Nguyễn Văn A', { timeout: 5000 }).should('be.visible');

    // Bước 10: Verify URL chuyển về trang chủ
    cy.url().should('eq', 'http://localhost:5173/');
  });
});
```

##### Luồng 2: Mua hàng End-to-End
```javascript
// File: cypress/e2e/checkout-flow.cy.js
// Mục đích: Test toàn bộ luồng mua hàng

describe('E2E: Complete Checkout Flow', () => {
  beforeEach(() => {
    // Login trước khi test
    cy.login('testuser@example.com', 'MatKhau123!');
    cy.visit('http://localhost:5173');
  });

  it('TC_E2E_002: User can browse, add to cart, and checkout', () => {
    // Bước 1: Tìm kiếm sản phẩm
    cy.get('input[placeholder*="Tìm kiếm"]').type('Bánh kem{enter}');

    // Bước 2: Click vào sản phẩm đầu tiên
    cy.get('.item-card').first().click();

    // Bước 3: Chờ trang chi tiết sản phẩm load
    cy.url().should('include', '/item/');

    // Bước 4: Chọn số lượng
    cy.get('button[aria-label="Tăng số lượng"]').click(); // Tăng lên 2

    // Bước 5: Thêm vào giỏ hàng
    cy.contains('button', 'Thêm vào giỏ').click();

    // Bước 6: Verify thông báo thành công
    cy.contains('Đã thêm vào giỏ hàng').should('be.visible');

    // Bước 7: Mở giỏ hàng
    cy.get('.cart-icon').click();

    // Bước 8: Verify sản phẩm trong giỏ
    cy.contains('Bánh kem').should('be.visible');
    cy.contains('Số lượng: 2').should('be.visible');

    // Bước 9: Tiến hành thanh toán
    cy.contains('button', 'Thanh toán').click();

    // Bước 10: Điền thông tin giao hàng
    cy.get('input[name="address"]').type('123 Nguyễn Huệ, Q1, TP.HCM');
    cy.get('input[name="phone"]').type('0901234567');

    // Bước 11: Chọn phương thức thanh toán
    cy.get('input[value="COD"]').check();

    // Bước 12: Xác nhận đặt hàng
    cy.contains('button', 'Đặt hàng').click();

    // Bước 13: Verify đơn hàng thành công
    cy.contains('Đặt hàng thành công', { timeout: 10000 }).should('be.visible');
    cy.url().should('include', '/orders');

    // Bước 14: Verify đơn hàng xuất hiện trong lịch sử
    cy.contains('123 Nguyễn Huệ').should('be.visible');
    cy.contains('Pending').should('be.visible');
  });
});
```

##### Luồng 3: Admin quản lý sản phẩm
```javascript
// File: cypress/e2e/admin-product-management.cy.js
// Mục đích: Test admin thêm/sửa/xóa sản phẩm

describe('E2E: Admin Product Management', () => {
  beforeEach(() => {
    // Login với admin account
    cy.loginAdmin('admin@cakefantasy.com', 'Admin123!');
    cy.visit('http://localhost:5174'); // Admin panel port
  });

  it('TC_E2E_003: Admin can add new product', () => {
    // Bước 1: Navigate to Add Product
    cy.contains('Thêm mặt hàng').click();

    // Bước 2: Upload ảnh sản phẩm
    cy.get('input[type="file"]').attachFile('test-cake.jpg');

    // Bước 3: Điền thông tin
    cy.get('input[name="name"]').type('Bánh Tiramisu');
    cy.get('textarea[name="description"]').type('Bánh Tiramisu Ý chính hiệu');
    cy.get('select[name="category"]').select('Cake');
    cy.get('input[name="cost_price"]').type('150000');
    cy.get('input[name="selling_price"]').type('200000');

    // Bước 4: Submit form
    cy.contains('button', 'Thêm mặt hàng').click();

    // Bước 5: Verify thành công
    cy.contains('Thêm mặt hàng thành công', { timeout: 5000 }).should('be.visible');

    // Bước 6: Verify chuyển về trang List
    cy.url().should('include', '/list');

    // Bước 7: Tìm sản phẩm vừa thêm
    cy.contains('Bánh Tiramisu').should('be.visible');
  });
});
```

#### **Cách setup Cypress**
```powershell
# Cài đặt Cypress
npm install --save-dev cypress

# Mở Cypress Test Runner (GUI)
npx cypress open

# Chạy tests headless (CI/CD)
npx cypress run

# Chạy 1 test cụ thể
npx cypress run --spec "cypress/e2e/checkout-flow.cy.js"
```

#### **Phạm vi E2E Test**

**User Flows (Frontend):**
- ⚠️ Đăng ký → Đăng nhập → Trang chủ
- ⚠️ Tìm kiếm → Xem chi tiết → Thêm giỏ hàng → Thanh toán
- ⚠️ Xem lịch sử đơn hàng
- ⚠️ Đánh giá sản phẩm
- ⚠️ Cập nhật thông tin cá nhân

**Admin Flows (Admin Panel):**
- ⚠️ Đăng nhập admin
- ⚠️ Thêm/Sửa/Xóa sản phẩm
- ⚠️ Xem danh sách đơn hàng
- ⚠️ Cập nhật trạng thái đơn hàng
- ⚠️ Nhập kho (GRN)
- ⚠️ Xem báo cáo thống kê

**Note:** ⚠️ = Chưa implement, cần tạo mới

---

### 4️⃣ Acceptance Test (Kiểm Thử Chấp Nhận) - THỦ CÔNG

#### **Mục đích**
Kiểm tra phần mềm có đáp ứng đúng yêu cầu nghiệp vụ (User Stories) hay không, thực hiện bởi:
- Tester/QA
- Product Owner
- End Users (Beta testing)

#### **Công cụ**
- **Excel/Google Sheets** (test case management)
- **Word/PDF** (test report)
- **Jira/Trello** (bug tracking)

#### **Khi nào thực hiện**
- ✅ Sau khi tất cả automated tests pass
- ✅ Trước khi release cho khách hàng
- ✅ UAT (User Acceptance Testing) phase

#### **Template Test Case**

##### Excel Test Case Format
| Test ID | User Story | Test Scenario | Test Steps | Expected Result | Actual Result | Status | Bug ID | Tester | Date |
|---------|-----------|---------------|------------|-----------------|---------------|--------|--------|--------|------|
| TC_ACC_001 | US-001: Người dùng đăng ký tài khoản | Đăng ký với email hợp lệ | 1. Mở trang chủ<br>2. Click "Đăng nhập"<br>3. Click "Tạo tài khoản"<br>4. Nhập tên: "Nguyễn Văn A"<br>5. Nhập email: "test@gmail.com"<br>6. Nhập password: "Pass123!"<br>7. Click "Tạo tài khoản" | - Hiện thông báo "Đăng ký thành công"<br>- Tự động đăng nhập<br>- Chuyển về trang chủ<br>- Hiển thị tên "Nguyễn Văn A" | - Hiện thông báo OK<br>- Đăng nhập OK<br>- Về trang chủ OK<br>- Hiển thị tên OK | ✅ PASS | - | Nguyễn B | 10/12/2025 |
| TC_ACC_002 | US-001 | Đăng ký với email trùng | 1. Mở trang đăng ký<br>2. Nhập email đã tồn tại: "existing@gmail.com"<br>3. Nhập các field khác<br>4. Click "Tạo tài khoản" | Hiện lỗi "Email đã được sử dụng" | Hiện lỗi đúng | ✅ PASS | - | Nguyễn B | 10/12/2025 |
| TC_ACC_003 | US-002: Người dùng tìm kiếm sản phẩm | Tìm kiếm bằng tên sản phẩm | 1. Vào trang chủ<br>2. Nhập "bánh kem" vào ô tìm kiếm<br>3. Nhấn Enter | Hiển thị danh sách các sản phẩm có chứa "bánh kem" | Không hiển thị kết quả | ❌ FAIL | BUG-101 | Nguyễn B | 10/12/2025 |

##### Word Test Report Format
```
===================================
 BÁO CÁO KIỂM THỬ CHẤP NHẬN (UAT)
===================================

Dự án: Website Tiệm Bánh - Cake Fantasy
Version: 1.0.0
Ngày test: 10/12/2025
Tester: Nguyễn Văn B

-----------------------------------
1. TỔNG QUAN
-----------------------------------
Tổng số test cases: 25
- Passed: 22 (88%)
- Failed: 3 (12%)
- Blocked: 0

Các module được test:
✅ User Authentication (5/5 Pass)
✅ Product Catalog (8/8 Pass)
⚠️ Shopping Cart (4/5 Pass - 1 Failed)
⚠️ Checkout (3/5 Pass - 2 Failed)
✅ Admin Panel (2/2 Pass)

-----------------------------------
2. CHI TIẾT LỖI PHÁT HIỆN
-----------------------------------

BUG-101: Tìm kiếm không trả kết quả
- Severity: HIGH
- Module: Product Search
- Steps to reproduce:
  1. Vào trang chủ
  2. Nhập "bánh kem" vào search box
  3. Nhấn Enter
- Expected: Hiển thị danh sách bánh kem
- Actual: Màn hình trống
- Screenshot: bug-101-search.png

BUG-102: Không thể xóa item khỏi giỏ hàng
- Severity: MEDIUM
- Module: Shopping Cart
- Steps to reproduce:
  1. Thêm sản phẩm vào giỏ
  2. Click nút "X" để xóa
- Expected: Item biến mất khỏi giỏ
- Actual: Không có gì xảy ra
- Screenshot: bug-102-cart.png

-----------------------------------
3. KẾT LUẬN VÀ KHUYẾN NGHỊ
-----------------------------------
✅ Hệ thống cơ bản hoạt động tốt
❌ Cần fix 3 bugs trước khi release
⚠️ Khuyến nghị:
  - Cải thiện validation form đăng ký
  - Thêm loading indicator khi submit
  - Tối ưu performance trang danh sách sản phẩm

-----------------------------------
4. SIGN-OFF
-----------------------------------
Tester: _________________ (Nguyễn Văn B)
QA Lead: ________________
Product Owner: ________________
```

#### **User Stories cần test**

**Epic 1: User Management**
- US-001: Người dùng có thể đăng ký tài khoản
- US-002: Người dùng có thể đăng nhập
- US-003: Người dùng có thể đăng xuất
- US-004: Người dùng có thể reset password

**Epic 2: Product Browsing**
- US-005: Người dùng xem danh sách sản phẩm theo category
- US-006: Người dùng tìm kiếm sản phẩm
- US-007: Người dùng xem chi tiết sản phẩm
- US-008: Người dùng xem đánh giá sản phẩm

**Epic 3: Shopping & Checkout**
- US-009: Người dùng thêm sản phẩm vào giỏ hàng
- US-010: Người dùng cập nhật số lượng trong giỏ
- US-011: Người dùng xóa item khỏi giỏ
- US-012: Người dùng thanh toán đơn hàng
- US-013: Người dùng xem lịch sử đơn hàng

**Epic 4: Admin Functions**
- US-014: Admin thêm sản phẩm mới
- US-015: Admin cập nhật thông tin sản phẩm
- US-016: Admin xóa sản phẩm
- US-017: Admin xem và cập nhật trạng thái đơn hàng
- US-018: Admin nhập kho (GRN)

#### **Checklist kiểm thử thủ công**

**Functional Testing:**
- [ ] Tất cả buttons đều hoạt động
- [ ] Tất cả links đều dẫn đúng trang
- [ ] Forms validate đúng
- [ ] Error messages hiển thị rõ ràng
- [ ] Success messages hiển thị đúng

**UI/UX Testing:**
- [ ] Layout hiển thị đẹp trên Desktop
- [ ] Responsive trên Mobile/Tablet
- [ ] Màu sắc, font chữ nhất quán
- [ ] Images load đúng và nhanh
- [ ] Không có lỗi chính tả

**Performance Testing:**
- [ ] Trang load < 3 giây
- [ ] Không bị lag khi scroll
- [ ] Search trả kết quả nhanh

**Security Testing:**
- [ ] Không truy cập được admin khi chưa login
- [ ] Password được ẩn khi nhập
- [ ] Session timeout sau 30 phút không hoạt động

---

## 📂 Cấu Trúc Thư Mục Test

```
WebsiteTiemBanh/
│
├── Frontend/
│   ├── src/
│   │   └── __tests__/                     ← Unit Tests (Vitest)
│   │       ├── components/
│   │       │   ├── Header.test.jsx        ✅ Đã có
│   │       │   ├── Footer.test.jsx        ✅ Đã có
│   │       │   ├── LoginPopup.test.jsx    ✅ Đã có
│   │       │   ├── ItemDisplay.test.jsx   ✅ Đã có
│   │       │   ├── CategoryFilter.test.jsx  ⚠️ Cần tạo
│   │       │   └── Navbar.test.jsx          ⚠️ Cần tạo
│   │       ├── pages/
│   │       │   ├── Home.test.jsx            ⚠️ Cần tạo
│   │       │   ├── Cart.test.jsx            ⚠️ Cần tạo
│   │       │   └── PlaceOrder.test.jsx      ⚠️ Cần tạo
│   │       └── setup.js                   ✅ Đã có
│   ├── cypress/                           ⚠️ CẦN TẠO MỚI
│   │   ├── e2e/                          ← E2E Tests (Cypress)
│   │   │   ├── user-registration.cy.js
│   │   │   ├── checkout-flow.cy.js
│   │   │   ├── product-search.cy.js
│   │   │   └── order-history.cy.js
│   │   ├── fixtures/
│   │   │   └── test-data.json
│   │   ├── support/
│   │   │   ├── commands.js
│   │   │   └── e2e.js
│   │   └── cypress.config.js
│   └── vitest.config.js                   ✅ Đã có
│
├── Admin/
│   ├── src/
│   │   └── __tests__/                     ← Unit Tests (Vitest)
│   │       ├── components/
│   │       │   ├── Sidebar.test.jsx       ✅ Đã có
│   │       │   └── Navbar.test.jsx        ✅ Đã có
│   │       ├── pages/
│   │       │   ├── Add.test.jsx           ✅ Đã có
│   │       │   ├── List.test.jsx            ⚠️ Cần tạo
│   │       │   ├── Orders.test.jsx          ⚠️ Cần tạo
│   │       │   └── Dashboard.test.jsx       ⚠️ Cần tạo
│   │       └── setup.js                   ✅ Đã có
│   ├── cypress/                           ⚠️ CẦN TẠO MỚI
│   │   └── e2e/                          ← E2E Tests (Cypress)
│   │       ├── admin-login.cy.js
│   │       ├── product-management.cy.js
│   │       └── order-management.cy.js
│   └── vitest.config.js                   ✅ Đã có
│
├── Backend/
│   ├── tests/                             ← Integration Tests (Jest+Supertest)
│   │   ├── auth.test.js                   ✅ Đã có
│   │   ├── cart.test.js                   ✅ Đã có
│   │   ├── order.test.js                  ✅ Đã có
│   │   ├── search.test.js                 ✅ Đã có
│   │   ├── item.test.js                     ⚠️ Cần tạo
│   │   ├── grn.test.js                      ⚠️ Cần tạo
│   │   ├── review.test.js                   ⚠️ Cần tạo
│   │   ├── setup.js                       ✅ Đã có
│   │   └── testUtils.js                   ✅ Đã có
│   └── jest.config.js                     ✅ Đã có
│
├── test-reports/                          ⚠️ CẦN TẠO MỚI
│   ├── unit-test-coverage/               ← Unit test coverage HTML
│   ├── integration-test-results/         ← API test results
│   ├── e2e-test-videos/                  ← Cypress videos
│   ├── e2e-test-screenshots/             ← Cypress screenshots
│   └── acceptance-test-reports/          ← Manual test reports (Excel/PDF)
│       ├── UAT_Report_v1.0.0.xlsx
│       └── UAT_Report_v1.0.0.pdf
│
├── cypress.config.js                      ⚠️ CẦN TẠO (root level)
├── TEST_STRATEGY.md                       ✅ File này
├── TESTING_GUIDE.md                       ✅ Đã có
└── .github/
    └── workflows/
        └── ci.yml                         ✅ Đã cấu hình (chạy unit + integration tests)
```

---

## 🚀 CI/CD Integration

### GitHub Actions Workflow

```yaml
# File: .github/workflows/ci.yml (đã có, đang hoạt động)

name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # 1. UNIT TESTS - Backend
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        working-directory: ./Backend
        run: npm ci
      - name: Run Unit Tests
        working-directory: ./Backend
        run: npm test
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./Backend/coverage/coverage-final.json
          flags: backend

  # 2. UNIT TESTS - Frontend
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
      - name: Install dependencies
        working-directory: ./Frontend
        run: npm ci
      - name: Run Unit Tests
        working-directory: ./Frontend
        run: npm run test:run
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./Frontend/coverage/coverage-final.json
          flags: frontend

  # 3. UNIT TESTS - Admin
  admin-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        working-directory: ./Admin
        run: npm ci
      - name: Run Unit Tests
        working-directory: ./Admin
        run: npm run test:run
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./Admin/coverage/coverage-final.json
          flags: admin

  # 4. E2E TESTS - Cypress (CẦN THÊM)
  e2e-tests:
    runs-on: ubuntu-latest
    needs: [frontend-tests, backend-tests]
    steps:
      - uses: actions/checkout@v3
      - name: Start Backend
        working-directory: ./Backend
        run: |
          npm ci
          npm start &
          sleep 10
      - name: Start Frontend
        working-directory: ./Frontend
        run: |
          npm ci
          npm run dev &
          sleep 10
      - name: Run Cypress Tests
        uses: cypress-io/github-action@v5
        with:
          working-directory: ./Frontend
          wait-on: 'http://localhost:5173, http://localhost:4000'
      - name: Upload Cypress Videos
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: cypress-videos
          path: Frontend/cypress/videos
```

### Test Execution Trigger

**Mỗi khi commit code:**
```
Git Push → GitHub Actions triggered
  ↓
1. Unit Tests (Frontend + Admin + Backend) - 2 phút
  ↓ (nếu PASS)
2. Integration Tests (Backend API) - 1 phút
  ↓ (nếu PASS)
3. E2E Tests (Cypress) - 5 phút
  ↓
✅ Merge được approve
```

---

## 📊 Báo Cáo và Metrics

### Coverage Report (Tự động)

**Codecov Dashboard:**
- Frontend: 70% → Target: 80%
- Admin: 65% → Target: 80%
- Backend: 75% → Target: 85%

**Generated Reports:**
- `Frontend/coverage/index.html` - Xem coverage chi tiết
- `Backend/coverage/lcov-report/index.html` - Backend coverage
- `cypress/reports/mochawesome.html` - E2E test results

### Test Execution Report

```
╔════════════════════════════════════════════════╗
║        TEST EXECUTION SUMMARY                  ║
╠════════════════════════════════════════════════╣
║ Frontend Unit Tests:     18 passed             ║
║ Admin Unit Tests:        17 passed             ║
║ Backend Unit Tests:      24 passed             ║
║ Backend Integration:     12 passed             ║
║ E2E Tests (Cypress):     0 passed (chưa có)    ║
║ Acceptance Tests:        0/25 (chưa test)      ║
╠════════════════════════════════════════════════╣
║ TOTAL AUTOMATED:         71 passed ✅          ║
║ TOTAL MANUAL:            0/25 pending ⚠️       ║
╚════════════════════════════════════════════════╝
```

---

## ✅ Checklist Triển Khai

### Đã Hoàn Thành
- [x] **Unit Tests - Frontend** (18 tests)
  - [x] Header, Footer, LoginPopup, ItemDisplay
  - [x] Vitest config
  - [x] Test setup với mocks
- [x] **Unit Tests - Admin** (17 tests)
  - [x] Sidebar, Navbar, Add page
  - [x] Vitest config
- [x] **Unit Tests - Backend** (24 tests)
  - [x] Auth, Cart, Order, Search
  - [x] Jest config với Supertest
- [x] **Integration Tests - Backend** (12 tests)
  - [x] API endpoints với database
- [x] **CI/CD Pipeline**
  - [x] GitHub Actions workflow
  - [x] Codecov integration

### Cần Làm Tiếp
- [ ] **Bổ sung Unit Tests**
  - [ ] Frontend: Cart, PlaceOrder, ProductDetail (thêm ~15 tests)
  - [ ] Admin: Orders, Dashboard, List (thêm ~20 tests)
  - [ ] Backend: Item, GRN, Review controllers (thêm ~10 tests)
  
- [ ] **Tạo E2E Tests với Cypress**
  - [ ] Setup Cypress cho Frontend
  - [ ] Viết 5-10 user journey tests
  - [ ] Tích hợp vào CI/CD
  
- [ ] **Acceptance Testing (Manual)**
  - [ ] Tạo Excel template với 25 test cases
  - [ ] Thực hiện UAT
  - [ ] Viết báo cáo Word/PDF
  
- [ ] **Performance Testing** (Optional)
  - [ ] Load testing với Artillery/k6
  - [ ] Frontend performance với Lighthouse

---

## 🎓 Tài Liệu Tham Khảo

### Tools Documentation
- **Vitest:** https://vitest.dev/
- **React Testing Library:** https://testing-library.com/docs/react-testing-library/intro/
- **Jest:** https://jestjs.io/
- **Supertest:** https://github.com/ladjs/supertest
- **Cypress:** https://docs.cypress.io/

### Best Practices
- **Testing Trophy:** https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications
- **AAA Pattern:** Arrange → Act → Assert
- **Test Naming:** Should [do something] when [condition]

---

## 📝 Ghi Chú

**Ưu tiên triển khai:**
1. Hoàn thiện Unit Tests (Frontend/Admin/Backend) - 1 tuần
2. Setup Cypress + viết E2E tests - 3 ngày
3. Thực hiện Acceptance Testing thủ công - 2 ngày
4. Viết báo cáo tổng hợp - 1 ngày

**Estimate tổng thời gian:** 2-3 tuần cho đầy đủ test coverage + reports

---

**Người tạo:** GitHub Copilot  
**Ngày cập nhật:** 10/12/2025  
**Version:** 1.0.0
