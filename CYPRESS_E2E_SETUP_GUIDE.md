# Hướng Dẫn Thiết Lập Cypress E2E Testing
## Website Tiệm Bánh - Cake Fantasy

---

## 📖 Mục Lục
1. [Giới thiệu Cypress](#giới-thiệu-cypress)
2. [Cài đặt và Cấu hình](#cài-đặt-và-cấu-hình)
3. [Cấu trúc thư mục](#cấu-trúc-thư-mục)
4. [Viết Test đầu tiên](#viết-test-đầu-tiên)
5. [Custom Commands](#custom-commands)
6. [Best Practices](#best-practices)
7. [Chạy Tests](#chạy-tests)
8. [CI/CD Integration](#cicd-integration)

---

## 🎯 Giới Thiệu Cypress

### Cypress là gì?
Cypress là framework kiểm thử E2E (End-to-End) hiện đại cho web applications, cho phép:
- ✅ Giả lập hành vi người dùng thực tế trên trình duyệt
- ✅ Test toàn bộ user journey từ đầu đến cuối
- ✅ Debug dễ dàng với Time Travel Debugging
- ✅ Tự động chụp screenshot/video khi test fail
- ✅ Không cần Selenium, WebDriver hay phụ thuộc phức tạp

### Tại sao chọn Cypress?
- **Fast:** Chạy nhanh hơn Selenium
- **Easy:** Syntax đơn giản, dễ học
- **Reliable:** Tự động retry và wait
- **Developer-friendly:** Hot reload, time travel debugging

---

## 🔧 Cài Đặt và Cấu Hình

### Bước 1: Cài đặt Cypress cho Frontend

```powershell
# Di chuyển vào thư mục Frontend
cd Frontend

# Cài đặt Cypress
npm install --save-dev cypress

# Cài đặt các dependencies bổ sung
npm install --save-dev @testing-library/cypress
npm install --save-dev cypress-file-upload
```

### Bước 2: Tạo file cấu hình Cypress

Tạo file `Frontend/cypress.config.js`:

```javascript
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    
    // Timeout settings
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    
    // Test settings
    retries: {
      runMode: 2,    // Retry 2 lần khi chạy headless
      openMode: 0    // Không retry khi chạy GUI
    },
    
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    
    // Môi trường test
    env: {
      apiUrl: 'http://localhost:4000',
      adminUrl: 'http://localhost:5174'
    },
    
    // Folder structure
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    fixturesFolder: 'cypress/fixtures',
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots'
  }
});
```

### Bước 3: Khởi tạo Cypress

```powershell
# Mở Cypress lần đầu để tạo thư mục
npx cypress open
```

Cypress sẽ tự động tạo cấu trúc thư mục:
```
Frontend/
├── cypress/
│   ├── e2e/           ← Nơi viết test files
│   ├── fixtures/      ← Test data (JSON)
│   └── support/       ← Custom commands, helpers
└── cypress.config.js
```

---

## 📂 Cấu Trúc Thư Mục

### Thư mục hoàn chỉnh

```
Frontend/
├── cypress/
│   ├── e2e/                          ← E2E Test Files
│   │   ├── user/
│   │   │   ├── registration.cy.js    # Đăng ký user
│   │   │   ├── login.cy.js           # Đăng nhập
│   │   │   └── profile.cy.js         # Cập nhật profile
│   │   ├── shopping/
│   │   │   ├── browse-products.cy.js # Duyệt sản phẩm
│   │   │   ├── product-detail.cy.js  # Xem chi tiết
│   │   │   ├── search.cy.js          # Tìm kiếm
│   │   │   └── filters.cy.js         # Lọc category
│   │   ├── cart/
│   │   │   ├── add-to-cart.cy.js     # Thêm vào giỏ
│   │   │   ├── update-cart.cy.js     # Sửa số lượng
│   │   │   └── remove-from-cart.cy.js# Xóa khỏi giỏ
│   │   ├── checkout/
│   │   │   ├── checkout-flow.cy.js   # Toàn bộ flow thanh toán
│   │   │   ├── payment-cod.cy.js     # Thanh toán COD
│   │   │   └── payment-momo.cy.js    # Thanh toán MoMo
│   │   └── orders/
│   │       ├── order-history.cy.js   # Lịch sử đơn hàng
│   │       └── order-tracking.cy.js  # Tracking đơn hàng
│   │
│   ├── fixtures/                     ← Test Data
│   │   ├── users.json                # Dữ liệu users test
│   │   ├── products.json             # Dữ liệu sản phẩm
│   │   └── orders.json               # Dữ liệu đơn hàng
│   │
│   ├── support/                      ← Helpers & Custom Commands
│   │   ├── commands.js               # Custom Cypress commands
│   │   ├── e2e.js                    # Global setup
│   │   └── pages/                    # Page Object Models
│   │       ├── LoginPage.js
│   │       ├── HomePage.js
│   │       ├── ProductPage.js
│   │       └── CheckoutPage.js
│   │
│   ├── videos/                       ← Test execution videos (auto-generated)
│   └── screenshots/                  ← Screenshots on failure (auto-generated)
│
└── cypress.config.js                 ← Cypress configuration
```

---

## ✍️ Viết Test Đầu Tiên

### Test 1: User Registration

Tạo file `Frontend/cypress/e2e/user/registration.cy.js`:

```javascript
describe('User Registration Flow', () => {
  
  beforeEach(() => {
    // Truy cập trang chủ trước mỗi test
    cy.visit('/');
  });

  it('TC_E2E_REG_001: Should register new user successfully', () => {
    // Bước 1: Click nút "Đăng nhập" trên header
    cy.contains('button', 'Đăng nhập').click();

    // Bước 2: Popup hiện ra, chuyển sang tab "Tạo tài khoản"
    cy.contains('Tạo tài khoản').click();

    // Bước 3: Điền form đăng ký
    const timestamp = Date.now();
    cy.get('input[name="name"]').type('Nguyễn Văn Test');
    cy.get('input[name="email"]').type(`testuser${timestamp}@example.com`);
    cy.get('input[name="password"]').type('TestPass123!');

    // Bước 4: Click nút submit
    cy.contains('button', 'Tạo tài khoản').click();

    // Bước 5: Verify đăng ký thành công
    cy.contains('Đăng ký thành công', { timeout: 5000 }).should('be.visible');

    // Bước 6: Verify tự động đăng nhập và hiển thị tên user
    cy.contains('Nguyễn Văn Test').should('be.visible');

    // Bước 7: Verify popup đóng
    cy.get('.login-popup').should('not.exist');
  });

  it('TC_E2E_REG_002: Should show error for duplicate email', () => {
    cy.contains('button', 'Đăng nhập').click();
    cy.contains('Tạo tài khoản').click();

    // Nhập email đã tồn tại
    cy.get('input[name="name"]').type('Test User 2');
    cy.get('input[name="email"]').type('existing@example.com');
    cy.get('input[name="password"]').type('TestPass123!');

    cy.contains('button', 'Tạo tài khoản').click();

    // Verify hiển thị lỗi
    cy.contains(/Email đã được sử dụng|Email already exists/i, { timeout: 5000 })
      .should('be.visible');
  });

  it('TC_E2E_REG_003: Should validate email format', () => {
    cy.contains('button', 'Đăng nhập').click();
    cy.contains('Tạo tài khoản').click();

    cy.get('input[name="name"]').type('Test User');
    cy.get('input[name="email"]').type('invalid-email');  // Email không hợp lệ
    cy.get('input[name="password"]').type('TestPass123!');

    cy.contains('button', 'Tạo tài khoản').click();

    // Verify lỗi validation
    cy.contains(/Email không hợp lệ|Invalid email/i).should('be.visible');
  });
});
```

### Test 2: Complete Checkout Flow

Tạo file `Frontend/cypress/e2e/checkout/checkout-flow.cy.js`:

```javascript
describe('Complete Checkout Flow - E2E', () => {
  
  before(() => {
    // Đăng nhập một lần trước khi chạy tất cả tests
    cy.login('testuser@example.com', 'TestPass123!');
  });

  beforeEach(() => {
    cy.visit('/');
  });

  it('TC_E2E_CHECKOUT_001: User can complete full purchase journey', () => {
    // ===== PHẦN 1: BROWSE & SELECT PRODUCT =====
    
    // Bước 1: Click vào category "Cake"
    cy.contains('Bánh').click();
    
    // Bước 2: Verify danh sách sản phẩm hiển thị
    cy.get('.item-card').should('have.length.greaterThan', 0);

    // Bước 3: Click vào sản phẩm đầu tiên
    cy.get('.item-card').first().within(() => {
      cy.get('img').click();
    });

    // Bước 4: Verify trang chi tiết sản phẩm
    cy.url().should('include', '/item/');
    cy.get('.product-detail').should('be.visible');

    // Lưu tên sản phẩm để verify sau
    cy.get('.product-name').invoke('text').as('productName');

    // ===== PHẦN 2: ADD TO CART =====

    // Bước 5: Tăng số lượng lên 2
    cy.get('button[aria-label*="Tăng"]').click();
    cy.get('.quantity-input').should('have.value', '2');

    // Bước 6: Thêm vào giỏ hàng
    cy.contains('button', /Thêm vào giỏ/i).click();

    // Bước 7: Verify thông báo thành công
    cy.contains(/Đã thêm vào giỏ/i, { timeout: 3000 }).should('be.visible');

    // ===== PHẦN 3: VIEW CART =====

    // Bước 8: Mở giỏ hàng
    cy.get('.cart-icon').click();
    cy.url().should('include', '/cart');

    // Bước 9: Verify sản phẩm trong giỏ
    cy.get('@productName').then((name) => {
      cy.contains(name).should('be.visible');
    });
    cy.contains('Số lượng').parent().should('contain', '2');

    // ===== PHẦN 4: CHECKOUT =====

    // Bước 10: Click "Thanh toán"
    cy.contains('button', /Thanh toán|Proceed to checkout/i).click();
    cy.url().should('include', '/order');

    // Bước 11: Điền thông tin giao hàng
    cy.get('input[name="firstName"]').clear().type('Nguyễn');
    cy.get('input[name="lastName"]').clear().type('Văn A');
    cy.get('input[name="email"]').should('not.be.empty'); // Email auto-fill
    cy.get('input[name="street"]').type('123 Nguyễn Huệ');
    cy.get('input[name="city"]').type('TP. Hồ Chí Minh');
    cy.get('input[name="state"]').type('Quận 1');
    cy.get('input[name="zipcode"]').type('700000');
    cy.get('input[name="country"]').type('Việt Nam');
    cy.get('input[name="phone"]').type('0901234567');

    // Bước 12: Chọn phương thức thanh toán COD
    cy.get('input[value="COD"]').check();

    // Bước 13: Click "Đặt hàng"
    cy.contains('button', /Đặt hàng|Place Order/i).click();

    // ===== PHẦN 5: VERIFY ORDER SUCCESS =====

    // Bước 14: Verify thông báo thành công
    cy.contains(/Đặt hàng thành công|Order placed successfully/i, { timeout: 10000 })
      .should('be.visible');

    // Bước 15: Chuyển đến trang orders
    cy.url().should('include', '/orders');

    // Bước 16: Verify đơn hàng xuất hiện
    cy.contains('123 Nguyễn Huệ').should('be.visible');
    cy.contains(/Pending|Đang xử lý/i).should('be.visible');
  });

  it('TC_E2E_CHECKOUT_002: Should calculate total price correctly', () => {
    // Thêm 2 sản phẩm khác nhau vào giỏ
    cy.visit('/');
    
    // Sản phẩm 1: Bánh kem (giả sử giá 200,000)
    cy.contains('Bánh kem').click();
    cy.contains('button', /Thêm vào giỏ/i).click();
    cy.wait(1000);

    // Quay lại trang chủ
    cy.visit('/');

    // Sản phẩm 2: Bánh mì (giả sử giá 50,000)
    cy.contains('Bánh mì').click();
    cy.get('button[aria-label*="Tăng"]').click(); // Số lượng = 2
    cy.contains('button', /Thêm vào giỏ/i).click();

    // Mở giỏ hàng
    cy.get('.cart-icon').click();

    // Verify tổng tiền = 200,000 + (50,000 * 2) = 300,000
    cy.get('.cart-total').should('contain', '300,000');
  });
});
```

---

## 🛠️ Custom Commands

### Tạo file `Frontend/cypress/support/commands.js`

```javascript
// Custom command: Đăng nhập
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/');
  cy.contains('button', 'Đăng nhập').click();
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.contains('button', 'Đăng nhập').click();
  
  // Chờ đăng nhập thành công
  cy.url().should('eq', Cypress.config().baseUrl + '/');
  
  // Lưu token vào localStorage nếu cần
  cy.window().its('localStorage.token').should('exist');
});

// Custom command: Đăng xuất
Cypress.Commands.add('logout', () => {
  cy.get('.user-dropdown').click();
  cy.contains('Đăng xuất').click();
  cy.window().its('localStorage.token').should('not.exist');
});

// Custom command: Thêm sản phẩm vào giỏ bằng API (nhanh hơn)
Cypress.Commands.add('addToCartAPI', (itemId, quantity = 1) => {
  cy.window().then((win) => {
    const token = win.localStorage.getItem('token');
    
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/api/cart/add`,
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: { itemId, quantity }
    }).then((response) => {
      expect(response.status).to.eq(200);
    });
  });
});

// Custom command: Clear giỏ hàng
Cypress.Commands.add('clearCart', () => {
  cy.window().then((win) => {
    const token = win.localStorage.getItem('token');
    
    cy.request({
      method: 'DELETE',
      url: `${Cypress.env('apiUrl')}/api/cart/clear`,
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  });
});

// Custom command: Seed database với test data
Cypress.Commands.add('seedDatabase', () => {
  cy.request('POST', `${Cypress.env('apiUrl')}/api/test/seed`);
});

// Custom command: Clean database
Cypress.Commands.add('cleanDatabase', () => {
  cy.request('POST', `${Cypress.env('apiUrl')}/api/test/clean`);
});
```

### Sử dụng Custom Commands

```javascript
describe('Shopping Flow with Custom Commands', () => {
  beforeEach(() => {
    cy.cleanDatabase();
    cy.seedDatabase();
    cy.login('testuser@example.com', 'password123');
  });

  it('Should add product using API', () => {
    // Thêm vào giỏ bằng API thay vì click qua UI (nhanh hơn)
    cy.addToCartAPI(1, 2);
    cy.addToCartAPI(5, 1);

    // Verify trên UI
    cy.visit('/cart');
    cy.get('.cart-item').should('have.length', 2);
  });

  afterEach(() => {
    cy.logout();
  });
});
```

---

## 📋 Test Data với Fixtures

### Tạo file `Frontend/cypress/fixtures/users.json`

```json
{
  "validUser": {
    "name": "Test User Valid",
    "email": "valid@test.com",
    "password": "ValidPass123!"
  },
  "adminUser": {
    "email": "admin@cakefantasy.com",
    "password": "AdminPass123!"
  },
  "invalidUsers": [
    {
      "name": "",
      "email": "test@test.com",
      "password": "Pass123!",
      "expectedError": "Name is required"
    },
    {
      "name": "Test User",
      "email": "invalid-email",
      "password": "Pass123!",
      "expectedError": "Invalid email format"
    },
    {
      "name": "Test User",
      "email": "test@test.com",
      "password": "123",
      "expectedError": "Password must be at least 8 characters"
    }
  ]
}
```

### Sử dụng Fixtures

```javascript
describe('User Registration with Fixtures', () => {
  beforeEach(() => {
    cy.fixture('users').as('usersData');
  });

  it('Should register with valid data', function() {
    const user = this.usersData.validUser;
    
    cy.visit('/');
    cy.contains('button', 'Đăng nhập').click();
    cy.contains('Tạo tài khoản').click();
    
    cy.get('input[name="name"]').type(user.name);
    cy.get('input[name="email"]').type(user.email);
    cy.get('input[name="password"]').type(user.password);
    
    cy.contains('button', 'Tạo tài khoản').click();
    cy.contains('Đăng ký thành công').should('be.visible');
  });

  it('Should show validation errors for invalid data', function() {
    this.usersData.invalidUsers.forEach((user) => {
      cy.visit('/');
      cy.contains('button', 'Đăng nhập').click();
      cy.contains('Tạo tài khoản').click();
      
      if (user.name) cy.get('input[name="name"]').type(user.name);
      cy.get('input[name="email"]').type(user.email);
      cy.get('input[name="password"]').type(user.password);
      
      cy.contains('button', 'Tạo tài khoản').click();
      cy.contains(user.expectedError).should('be.visible');
    });
  });
});
```

---

## 🎯 Best Practices

### 1. Sử dụng data-testid cho stable selectors

```jsx
// Component code
<button data-testid="add-to-cart-btn">Thêm vào giỏ</button>

// Cypress test
cy.get('[data-testid="add-to-cart-btn"]').click();
```

### 2. Tránh hardcode delays

```javascript
// ❌ BAD
cy.wait(5000); // Hardcode time

// ✅ GOOD
cy.contains('Loading...').should('not.exist');
cy.get('.product-list').should('be.visible');
```

### 3. Isolate tests (mỗi test độc lập)

```javascript
describe('Product Tests', () => {
  beforeEach(() => {
    // Reset state trước mỗi test
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('/');
  });
});
```

### 4. Sử dụng aliases

```javascript
cy.get('.product-name').invoke('text').as('productName');

// Sử dụng sau
cy.get('@productName').then((name) => {
  expect(name).to.include('Bánh');
});
```

### 5. Test theo user perspective

```javascript
// ✅ GOOD - Test theo hành vi user
it('User can add product to cart', () => {
  cy.contains('Bánh kem').click();
  cy.contains('Thêm vào giỏ').click();
  cy.contains('Đã thêm vào giỏ hàng').should('be.visible');
});

// ❌ BAD - Test implementation details
it('Should call addToCart API', () => {
  cy.window().its('store.dispatch').should('be.called');
});
```

---

## 🚀 Chạy Tests

### Chạy trong GUI (Development)

```powershell
# Mở Cypress Test Runner
cd Frontend
npx cypress open
```

Giao diện GUI cho phép:
- Chọn test cụ thể để chạy
- Xem real-time execution
- Time-travel debugging
- Auto-reload khi code thay đổi

### Chạy Headless (CI/CD)

```powershell
# Chạy tất cả tests
npx cypress run

# Chạy 1 file cụ thể
npx cypress run --spec "cypress/e2e/checkout/checkout-flow.cy.js"

# Chạy với browser cụ thể
npx cypress run --browser chrome

# Chạy và tạo báo cáo
npx cypress run --reporter mochawesome
```

### Chạy parallel (nhanh hơn)

```powershell
# Cài Cypress Dashboard (optional)
npm install --save-dev cypress-parallel

# Chạy parallel
npx cypress-parallel -s cypress run -t 4 -d cypress/e2e
```

---

## 🔄 CI/CD Integration

### Thêm vào GitHub Actions

Cập nhật file `.github/workflows/ci.yml`:

```yaml
# E2E Tests Job
e2e-tests:
  runs-on: ubuntu-latest
  needs: [frontend-tests, backend-tests]
  
  steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    # Start Backend
    - name: Start Backend Server
      working-directory: ./Backend
      run: |
        npm ci
        npm start &
        sleep 10
    
    # Start Frontend
    - name: Start Frontend
      working-directory: ./Frontend
      run: |
        npm ci
        npm run dev &
        sleep 10
    
    # Run Cypress Tests
    - name: Run Cypress E2E Tests
      uses: cypress-io/github-action@v5
      with:
        working-directory: ./Frontend
        wait-on: 'http://localhost:5173, http://localhost:4000'
        wait-on-timeout: 120
        browser: chrome
        headed: false
    
    # Upload artifacts nếu fail
    - name: Upload Cypress Screenshots
      if: failure()
      uses: actions/upload-artifact@v3
      with:
        name: cypress-screenshots
        path: Frontend/cypress/screenshots
    
    - name: Upload Cypress Videos
      if: failure()
      uses: actions/upload-artifact@v3
      with:
        name: cypress-videos
        path: Frontend/cypress/videos
```

---

## 📊 Reporting

### Cài đặt Mochawesome Reporter

```powershell
npm install --save-dev mochawesome mochawesome-merge mochawesome-report-generator
```

### Cập nhật `cypress.config.js`

```javascript
export default defineConfig({
  e2e: {
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'cypress/reports',
      overwrite: false,
      html: true,
      json: true,
      charts: true
    }
  }
});
```

### Generate HTML Report

```powershell
# Chạy tests
npx cypress run

# Merge JSON reports
npx mochawesome-merge cypress/reports/*.json > cypress/reports/report.json

# Generate HTML
npx marge cypress/reports/report.json --reportDir cypress/reports/html
```

Mở file `cypress/reports/html/index.html` để xem báo cáo đẹp.

---

## ✅ Checklist Triển Khai

- [ ] Cài đặt Cypress
- [ ] Tạo file `cypress.config.js`
- [ ] Tạo thư mục `cypress/e2e`
- [ ] Viết test đầu tiên (registration)
- [ ] Tạo custom commands (login, logout)
- [ ] Tạo fixtures (test data)
- [ ] Viết 5-10 critical user journeys
- [ ] Setup Mochawesome reporter
- [ ] Tích hợp vào CI/CD
- [ ] Document test scenarios

---

## 📚 Tài Liệu Tham Khảo

- **Cypress Docs:** https://docs.cypress.io/
- **Best Practices:** https://docs.cypress.io/guides/references/best-practices
- **Cypress Examples:** https://github.com/cypress-io/cypress-example-recipes
- **Testing Library Cypress:** https://testing-library.com/docs/cypress-testing-library/intro/

---

**Người tạo:** GitHub Copilot  
**Ngày:** 10/12/2025  
**Version:** 1.0.0
