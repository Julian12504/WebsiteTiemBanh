# 🧪 Testing Guide - Hướng dẫn Kiểm thử

## 📋 Tổng quan

Dự án sử dụng các công cụ testing sau:
- **Backend**: Jest + Supertest
- **Frontend**: Vitest + React Testing Library
- **Admin**: Vitest + React Testing Library
- **CI/CD**: GitHub Actions

---

## 🎯 Test Coverage Goals

| Module | Target Coverage | Current Status |
|--------|----------------|----------------|
| Backend | ≥ 80% | ✅ |
| Frontend | ≥ 80% | 🚧 In Progress |
| Admin | ≥ 80% | 🚧 In Progress |

---

## 🚀 Chạy Tests

### Backend Tests
```bash
cd Backend
npm test                    # Chạy tất cả tests
npm run test:watch         # Chạy tests ở chế độ watch
npm run test:coverage      # Tạo báo cáo coverage
```

### Frontend Tests
```bash
cd Frontend
npm test                    # Chạy tests ở chế độ watch
npm run test:run           # Chạy tests một lần
npm run test:ui            # Mở Vitest UI
npm run test:coverage      # Tạo báo cáo coverage
```

### Admin Tests
```bash
cd Admin
npm test                    # Chạy tests ở chế độ watch
npm run test:run           # Chạy tests một lần
npm run test:ui            # Mở Vitest UI
npm run test:coverage      # Tạo báo cáo coverage
```

### Chạy tất cả tests
```bash
# Từ thư mục root
npm run test:all           # (Nếu đã cấu hình)
```

---

## 📝 Quy tắc đặt tên Test Cases

### Backend (Jest)
- Format: `TC_<MODULE>_<NUMBER>: Description`
- Example: `TC_AUTH_001: User should have permission to view items`

### Frontend (Vitest)
- Format: `TC_FE_<COMPONENT>_<NUMBER>: Description`
- Example: `TC_FE_HEADER_001: Should render header with main heading`

### Admin (Vitest)
- Format: `TC_ADMIN_<COMPONENT>_<NUMBER>: Description`
- Example: `TC_ADMIN_SIDEBAR_001: Should render sidebar container`

---

## 🧪 Loại Tests

### 1. Unit Tests
- **Backend**: Controllers, Models, Services, Middleware
- **Frontend/Admin**: Components, Utils, Hooks

### 2. Integration Tests
- **Backend**: API Routes, Database Operations
- **Frontend/Admin**: Context + Components, API Integration

### 3. E2E Tests (Planned)
- User flows với Cypress/Playwright
- Critical paths testing

---

## 📊 Coverage Reports

### Xem Coverage Reports

#### Backend
```bash
cd Backend
npm run test:coverage
# Open: Backend/coverage/index.html
```

#### Frontend
```bash
cd Frontend
npm run test:coverage
# Open: Frontend/coverage/index.html
```

#### Admin
```bash
cd Admin
npm run test:coverage
# Open: Admin/coverage/index.html
```

### CI/CD Coverage
- Coverage reports tự động upload lên **Codecov** sau mỗi commit
- Xem tại: https://codecov.io/gh/Julian12504/WebsiteTiemBanh

---

## 🔧 Configuration Files

### Backend: `jest.config.cjs`
```javascript
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js',
    'routes/**/*.js',
    'middleware/**/*.js',
  ],
};
```

### Frontend/Admin: `vitest.config.js`
```javascript
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
    },
  },
});
```

---

## ✅ Best Practices

### 1. Naming Conventions
- Test files: `*.test.js` hoặc `*.test.jsx`
- Test suites: Mô tả component/module đang test
- Test cases: Bắt đầu với mã TC và mô tả rõ ràng

### 2. Test Structure (AAA Pattern)
```javascript
it('TC_XXX_001: Should do something', () => {
  // Arrange - Setup
  const data = { ... };
  
  // Act - Execute
  const result = doSomething(data);
  
  // Assert - Verify
  expect(result).toBe(expected);
});
```

### 3. Mock Data
- Sử dụng mock data nhất quán
- Tạo fixtures cho test data
- Mock external dependencies (axios, localStorage, etc.)

### 4. Coverage Goals
- Aim for ≥ 80% coverage
- Focus on critical paths
- Don't chase 100% - test what matters

---

## 🐛 Debugging Tests

### Vitest UI (Frontend/Admin)
```bash
npm run test:ui
```
- Interactive UI để debug tests
- Xem test results, coverage real-time

### Jest Watch Mode (Backend)
```bash
npm run test:watch
```
- Re-run tests khi file thay đổi
- Filter tests by pattern

### Debug trong VS Code
1. Add breakpoint trong test file
2. Run "Debug Jest Tests" configuration
3. Step through code

---

## 📚 Writing Tests

### Example: Component Test (Frontend)
```javascript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Header from '../../components/Header/Header';

describe('Header Component', () => {
  it('TC_FE_HEADER_001: Should render header', () => {
    render(<Header />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
```

### Example: API Test (Backend)
```javascript
import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../server';

describe('User API', () => {
  it('TC_API_001: Should login user', async () => {
    const response = await request(app)
      .post('/api/user/login')
      .send({ email: 'test@test.com', password: 'pass123' });
    
    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });
});
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
1. **On Push/PR**: Tự động chạy tests
2. **Tests Pass**: Build applications
3. **Coverage**: Upload to Codecov
4. **Merge**: Deploy to production

### Workflow File: `.github/workflows/ci.yml`
- Backend tests
- Frontend tests + build
- Admin tests + build
- Coverage reporting

---

## 📖 Resources

### Documentation
- [Vitest](https://vitest.dev/)
- [Jest](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Supertest](https://github.com/visionmedia/supertest)

### Test Files Location
```
Backend/tests/              # Backend tests
Frontend/src/__tests__/     # Frontend tests
Admin/src/__tests__/        # Admin tests
```

---

## 🎓 Team Guidelines

### Before Commit
1. Run tests locally: `npm test`
2. Check coverage: `npm run test:coverage`
3. Fix failing tests
4. Ensure coverage ≥ 80%

### Code Review Checklist
- [ ] All tests passing
- [ ] New features have tests
- [ ] Bug fixes have regression tests
- [ ] Coverage maintained or improved

---

## 📞 Support

Nếu gặp vấn đề với testing:
1. Check logs trong CI/CD pipeline
2. Review test error messages
3. Debug locally với test:ui hoặc watch mode
4. Tham khảo documentation

**Happy Testing! 🧪**
