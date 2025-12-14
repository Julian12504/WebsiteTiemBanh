# 🍰 Cake Fantasy - Hệ thống Quản lý Tiệm Bánh

[![Watch the video](https://img.youtube.com/vi/v1P57pXms24/maxresdefault.jpg)](https://www.youtube.com/watch?v=v1P57pXms24)
## 📚 Tổng quan

**Cake Fantasy** là một nền tảng **quản lý tiệm bánh** full-stack được thiết kế để xử lý toàn bộ quy trình kinh doanh: từ website bán hàng cho khách hàng, hệ thống quản trị nội bộ, cho đến backend API và cơ sở dữ liệu.

Dự án này không chỉ là một website thông thường — đây là một hệ thống hoàn chỉnh với **CI/CD pipeline** tự động hóa quá trình testing, building và deployment lên production, sử dụng **GitHub Actions** cho CI/CD và triển khai trên **Vercel** (Frontend/Admin) + **Railway** (Backend/Database).

---

## 🧩 Kiến trúc

Hệ thống bao gồm 3 ứng dụng độc lập trong một monorepo:

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Frontend      │      │   Admin Panel   │      │    Backend      │
│  (React+Vite)   │─────▶│  (React+Vite)   │─────▶│ (Express+MySQL) │
│  Port 5173      │      │  Port 5174      │      │  Port 4000      │
└─────────────────┘      └─────────────────┘      └─────────────────┘
        │                        │                         │
        └────────────────────────┴─────────────────────────┘
                                 │
                          ┌──────▼──────┐
                          │    MySQL    │
                          │  Database   │
                          └─────────────┘
```

---

## 🧱 Stack Overview

| Category | Tools / Frameworks | Version |
|----------|-------------------|---------|
| **Frontend** | React, Vite, Axios, React Router | React 18, Vite 5.x |
| **Admin** | React, Vite, Chart.js, Socket.io | React 18, Vite 5.x |
| **Backend** | Node.js, Express, Sequelize ORM | Node 20.19.6, Express 4.21.2 |
| **Database** | MySQL, UTF-8 encoding | MySQL 8.0 |
| **Authentication** | JWT, Bcrypt | - |
| **Payment** | MoMo Payment Gateway, Mock Payment | - |
| **Storage** | Cloudinary (images), Local uploads | - |
| **Testing** | Jest, Cypress, Vitest | Jest (Backend), Cypress 13.16.1 (E2E), Vitest 3.0.3 (Frontend) |
| **CI/CD** | GitHub Actions | Node 20, MySQL 8.0, Electron 138 |
| **Deployment** | Vercel (Frontend/Admin), Railway (Backend/DB) | - |
| **Containerization** | Docker, Docker Compose | - |

---

## 📁 Mục lục

* [🍰 Cake Fantasy - Hệ thống Quản lý Tiệm Bánh](#-cake-fantasy---hệ-thống-quản-lý-tiệm-bánh)
  * [📚 Tổng quan](#-tổng-quan)
  * [🧩 Kiến trúc](#-kiến-trúc)
  * [🧱 Stack Overview](#-stack-overview)
  * [🌐 Live Demo](#-live-demo)
  * [⚙️ Environment Setup](#%EF%B8%8F-environment-setup)
    * [1. Clone Repository](#1-clone-repository)
    * [2. Cài đặt Dependencies](#2-cài-đặt-dependencies)
  * [🧪 Local Development với Docker](#-local-development-với-docker)
    * [1. Cài đặt Docker](#1-cài-đặt-docker)
    * [2. Chạy toàn bộ stack với Docker Compose](#2-chạy-toàn-bộ-stack-với-docker-compose)
    * [3. Truy cập các services](#3-truy-cập-các-services)
  * [🛠️ Manual Setup (không dùng Docker)](#%EF%B8%8F-manual-setup-không-dùng-docker)
    * [1. Cài đặt MySQL Database](#1-cài-đặt-mysql-database)
    * [2. Cấu hình Backend](#2-cấu-hình-backend)
    * [3. Cấu hình Frontend](#3-cấu-hình-frontend)
    * [4. Cấu hình Admin Panel](#4-cấu-hình-admin-panel)
    * [5. Chạy các services](#5-chạy-các-services)
  * [🔌 API Endpoints](#-api-endpoints)
  * [📊 Database Schema](#-database-schema)
  * [🧪 Testing Strategy](#-testing-strategy)
  * [🚀 CI/CD Pipeline](#-cicd-pipeline)
  * [☁️ Production Deployment](#%EF%B8%8F-production-deployment)
    * [1. Deploy Backend lên Railway](#1-deploy-backend-lên-railway)
    * [2. Deploy MySQL Database lên Railway](#2-deploy-mysql-database-lên-railway)
    * [3. Deploy Frontend lên Vercel](#3-deploy-frontend-lên-vercel)
    * [4. Deploy Admin Panel lên Vercel](#4-deploy-admin-panel-lên-vercel)
  * [🐛 Troubleshooting](#-troubleshooting)
  * [📚 Documentation](#-documentation)
  * [📞 Liên hệ](#-liên-hệ)

---

## 🌐 Live Demo

| Service | URL | Mô tả |
|---------|-----|-------|
| 🛍️ **Customer Site** | [https://cake-shop-fe.vercel.app](https://cake-shop-fe.vercel.app/) | Website khách hàng - mua bánh online |
| 👨‍💼 **Admin Panel** | [https://cake-shop-admin-livid.vercel.app](https://cake-shop-admin-livid.vercel.app) | Quản lý tiệm bánh - dashboard, sản phẩm, đơn hàng |
| 🔌 **Backend API** | [https://cake-shop.up.railway.app](https://cake-shop.up.railway.app) | REST API + MySQL database |

**Tài khoản Admin:** `admin@gmail.com` / `admin123`

---

## ⚙️ Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/Julian12504/WebsiteTiemBanh.git
cd WebsiteTiemBanh
```

### 2. Cài đặt Dependencies

Dự án sử dụng **npm** cho tất cả 3 ứng dụng:

```bash
# Backend
cd Backend
npm install

# Frontend
cd ../Frontend
npm install

# Admin
cd ../Admin
npm install
```

---

## 🧪 Local Development với Docker

Bạn có thể chạy **toàn bộ stack** (Frontend + Admin + Backend + MySQL) chỉ với một lệnh Docker Compose.

### 1. Cài đặt Docker

Tải và cài đặt Docker Desktop:
👉 [Install Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 2. Chạy toàn bộ stack với Docker Compose

```bash
docker-compose up -d
```

Lệnh này sẽ:
- Build và chạy **Backend** (port 4000)
- Build và chạy **Frontend** (port 5173)
- Build và chạy **Admin** (port 5174)
- Khởi tạo **MySQL** database (port 3306)
- Tự động import database schema và sample data

**Đợi 2-3 phút** để tất cả containers khởi động hoàn tất.

### 3. Truy cập các services

| Service | URL | Tài khoản |
|---------|-----|-----------|
| 🌐 Frontend (Khách hàng) | http://localhost:5173 | - |
| 👨‍💼 Admin Panel | http://localhost:5174 | `admin@gmail.com` / `admin123` |
| 🔌 Backend API | http://localhost:4000 | - |
| 🗄️ MySQL Database | `localhost:3306` | `root` / `root` |

**Dừng tất cả services:**
```bash
docker-compose down
```

**Xem logs:**
```bash
docker-compose logs -f          # Tất cả services
docker-compose logs -f backend  # Chỉ backend
```

---

## 🛠️ Manual Setup (không dùng Docker)

Nếu không muốn dùng Docker, bạn có thể setup thủ công từng service:

### 1. Cài đặt MySQL Database

```bash
# Cài đặt MySQL 8.0+
# Windows: https://dev.mysql.com/downloads/installer/
# Mac: brew install mysql
# Linux: sudo apt install mysql-server

# Import database schema
mysql -u root -p < sql/cake_fantasy_db.sql
```

### 2. Cấu hình Backend

```bash
cd Backend
npm install

# Tạo file .env từ template
cp .env.example .env
```

Chỉnh sửa `Backend/.env`:
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=your_password
DB_NAME=cake_fantasy_db
JWT_SECRET=random#secret

# Cloudinary (upload ảnh sản phẩm)
CLOUDINARY_API_KEY=your_key
CLOUDINARY_SECRET_KEY=your_secret
CLOUDINARY_NAME=your_name

# MoMo Payment Gateway
MOMO_PARTNER_CODE=your_code
MOMO_ACCESS_KEY=your_key
MOMO_SECRET_KEY=your_secret
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
MOMO_QUERY_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/query
```

### 3. Cấu hình Frontend

```bash
cd Frontend
npm install

# Không cần .env cho local development
# Frontend sẽ tự động connect tới http://localhost:4000
```

### 4. Cấu hình Admin Panel

```bash
cd Admin
npm install

# Không cần .env cho local development
# Admin sẽ tự động connect tới http://localhost:4000
```

### 5. Chạy các services

Mở **3 terminal** riêng biệt:

**Terminal 1 - Backend:**
```bash
cd Backend
npm run server
# Backend running on http://localhost:4000
```

**Terminal 2 - Frontend:**
```bash
cd Frontend
npm run dev
# Frontend running on http://localhost:5173
```

**Terminal 3 - Admin:**
```bash
cd Admin
npm run dev
# Admin running on http://localhost:5174
```

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/user/register` | Đăng ký tài khoản khách hàng |
| POST | `/api/user/login` | Đăng nhập khách hàng |
| POST | `/api/admin/login` | Đăng nhập admin |

### Products (Items)

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/item/list` | Lấy danh sách sản phẩm | Public |
| GET | `/api/item/:id` | Lấy chi tiết sản phẩm | Public |
| POST | `/api/item/add` | Thêm sản phẩm mới | Admin |
| PUT | `/api/item/update/:id` | Cập nhật sản phẩm | Admin |
| DELETE | `/api/item/remove/:id` | Xóa sản phẩm | Admin |

### Orders

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/api/order/place` | Đặt hàng | User |
| GET | `/api/order/user/:userId` | Lấy đơn hàng của user | User |
| GET | `/api/order/list` | Lấy tất cả đơn hàng | Admin |
| PUT | `/api/order/status` | Cập nhật trạng thái đơn | Admin |

### Cart

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/api/cart/add` | Thêm vào giỏ hàng | User |
| GET | `/api/cart/:userId` | Lấy giỏ hàng của user | User |
| DELETE | `/api/cart/:userId` | Xóa giỏ hàng | User |

### Reviews

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/api/review/add` | Thêm đánh giá | User |
| GET | `/api/review/item/:itemId` | Lấy đánh giá sản phẩm | Public |

---

## 📊 Database Schema

Database: **cake_fantasy_db** (MySQL 8.0, UTF-8)

**9 bảng chính:**

| Bảng | Mô tả |
|------|-------|
| `users` | Tài khoản khách hàng |
| `admin_users` | Tài khoản admin |
| `items` | Sản phẩm (bánh) |
| `orders` | Đơn hàng |
| `order_items` | Chi tiết đơn hàng |
| `suppliers` | Nhà cung cấp |
| `grn_headers` | Phiếu nhập kho |
| `grn_details` | Chi tiết nhập kho |
| `reviews` | Đánh giá sản phẩm |

**Lưu ý:** Database hỗ trợ **UTF-8 (utf8mb4)** cho tiếng Việt có dấu.

---

## 🧪 Testing Strategy

Dự án có **coverage toàn diện** với 3 loại testing:

### Test Coverage Summary

| Test Type | Tool | Files | Test Cases | Pass Rate | Coverage |
|-----------|------|-------|------------|-----------|----------|
| **Unit & Integration** | Jest | Backend (4 modules) | 64 cases | 92.2% | Auth, Cart, Order, Search |
| **E2E Testing** | Cypress | Frontend (3 modules) | 27 cases | 100% | User flows, UI interactions |
| **Acceptance Testing** | Manual | Full system | 40 cases | 100% | Business requirements |
| **TOTAL** | - | - | **131 cases** | **95.4%** | - |

### Test Modules Breakdown

#### 📌 Module 1: User Management & Authentication (10 E2E cases)
- **Registration (4 cases):** Valid registration, duplicate email, invalid email format, required fields validation
- **Login (4 cases):** Valid credentials, invalid email, wrong password, toggle login/register forms
- **Logout (2 cases):** Successful logout, session data cleanup

#### 📌 Module 2: Product Browsing & Search (11 E2E cases)
- **Search (3 cases):** Valid keyword search, no results handling, view all search results
- **Browse (5 cases):** Display all products, filter by category, view product details, navigate categories, show product images
- **Product Detail (3 cases):** Adjust quantity, handle quantity decrease, show product reviews

#### 📌 Module 3: Shopping Cart & Checkout (6 E2E cases)
- **Cart Management (4 cases):** Complete purchase journey (E2E), add multiple products, update quantity, remove items
- **Checkout (2 cases):** Empty cart message, validate delivery information

### Running Tests

**Backend Unit/Integration Tests:**
```bash
cd Backend
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Generate coverage report
```

**Frontend E2E Tests:**
```bash
cd Frontend
npm run cypress            # Interactive mode
npm run cypress:headless   # Headless mode (CI)
```

**Test Reports:**
- [Test_Case.xlsx](./docs/Test_Case.xlsx) - Backend unit & integration test cases (64 cases)
- [Test_Case_E2E.xlsx](./docs/Test_Case_E2E.xlsx) - Cypress E2E test cases (27 cases)
- [Test Design.xlsx](./docs/Test%20Design.xlsx) - Complete test design documentation

---

## 🚀 CI/CD Pipeline

Dự án sử dụng **GitHub Actions** để tự động hóa testing, building và deployment.

### Workflow 1: CI (Continuous Integration)

File: `.github/workflows/ci.yml`

**Triggers:**
- Push lên branch `main`
- Pull request vào `main`

**Jobs:**

1. **Backend Tests (Jest)**
   - Run 64 unit & integration tests
   - Code quality checks (ESLint)
   - Generate test coverage report
   - **Pass rate: 92.2%** (59/64 tests pass)

2. **Frontend E2E Tests (Cypress)**
   - Run 27 E2E test scenarios
   - Test on Chrome (Electron 138)
   - Validate user flows & UI interactions
   - **Pass rate: 100%** (27/27 tests pass)

3. **Build Verification**
   - Build Backend (Node.js 20)
   - Build Frontend (React + Vite)
   - Build Admin Panel (React + Vite)
   - Validate dependencies

**CI Configuration:**
- Node.js version: 20.x
- MySQL version: 8.0
- Test timeout: 10 minutes
- Retry failed tests: 2 attempts
- Continue on test failures (for demonstration)

### Workflow 2: Docker Publish

File: `.github/workflows/docker-publish.yml`

**Triggers:**
- Push tag có format `v*` (vd: `v1.0.0`)

**Jobs:**
- Build Docker images cho Backend, Frontend, Admin
- Push lên Docker Hub
- Multi-platform support (amd64, arm64)

**Chi tiết:** Xem [CI-CD_README.md](./CI-CD_README.md)

---

## ☁️ Production Deployment

Hệ thống được deploy trên **Vercel** (Frontend/Admin) và **Railway** (Backend/Database).

**Hướng dẫn chi tiết:** [DEPLOYMENT.md](./DEPLOYMENT.md)

### 1. Deploy Backend lên Railway

```bash
# 1. Tạo tài khoản Railway: https://railway.app
# 2. Tạo project mới
# 3. Chọn "Deploy from GitHub repo"
# 4. Chọn repository WebsiteTiemBanh
# 5. Tạo file railway.toml trong Backend/

# Backend/railway.toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile"

[deploy]
startCommand = "npm start"
healthcheckPath = "/"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
```

**Cấu hình Environment Variables trên Railway:**
- `DB_HOST`: `mysql.railway.internal`
- `DB_PORT`: `3306`
- `DB_USER`: `root`
- `DB_PASS`: (từ MySQL service)
- `DB_NAME`: `railway`
- `JWT_SECRET`: (random string)
- `CLOUDINARY_*`: (API keys)
- `MOMO_*`: (Payment gateway keys)

### 2. Deploy MySQL Database lên Railway

```bash
# 1. Trong cùng Railway project, click "New" → "Database" → "MySQL"
# 2. Railway sẽ tự động tạo MySQL instance
# 3. Copy database credentials

# Import database schema
# Method 1: Railway CLI
railway login
railway link
railway run mysql -u root -p < sql/cake_fantasy_db.sql

# Method 2: MySQL Workbench/Client
# Connect tới Railway MySQL public endpoint
# Import file sql/cake_fantasy_db.sql
```

**Lưu ý:** Đảm bảo encoding UTF-8:
```sql
SET NAMES utf8mb4;
-- Import schema và data
```

### 3. Deploy Frontend lên Vercel

```bash
# 1. Tạo tài khoản Vercel: https://vercel.com
# 2. Import GitHub repository
# 3. Cấu hình project:

# Root Directory: Frontend
# Framework Preset: Vite
# Build Command: npm run build
# Output Directory: dist

# Environment Variables:
VITE_API_URL=https://cake-shop.up.railway.app
```

**File `Frontend/vercel.json`:**
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### 4. Deploy Admin Panel lên Vercel

```bash
# Tương tự Frontend, nhưng Root Directory: Admin

# Environment Variables:
VITE_API_URL=https://cake-shop.up.railway.app
```

**Kết quả:**
- Frontend: https://cake-shop-fe.vercel.app
- Admin: https://cake-shop-admin-livid.vercel.app
- Backend: https://cake-shop.up.railway.app

---

## 🐛 Troubleshooting

### Docker Issues

**Port bị chiếm dụng:**
```bash
# Sửa port trong docker-compose.yml
ports:
  - "5175:5173"  # Thay 5173 thành 5175
```

**Container không start:**
```bash
docker-compose logs backend      # Xem lỗi
docker-compose restart backend   # Restart
docker-compose down -v           # Xóa hết và chạy lại
docker-compose up --build
```

### Database Issues

**Connection failed:**
```bash
# Kiểm tra MySQL đang chạy
docker-compose ps
docker-compose logs mysql

# Kiểm tra credentials trong .env
# Kiểm tra port 3306 không bị chiếm
```

**Vietnamese text hiển thị sai (B?nh thay vì Bánh):**
```sql
-- Đảm bảo database dùng UTF-8
ALTER DATABASE cake_fantasy_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Import lại với UTF-8
mysql --default-character-set=utf8mb4 -u root -p cake_fantasy_db < sql/cake_fantasy_db.sql
```

### Frontend/Admin Issues

**CORS errors:**
```bash
# Đảm bảo Backend đang chạy
# Kiểm tra VITE_API_URL trong .env (production)
# Kiểm tra CORS config trong Backend
```

**Build errors (case-sensitive imports):**
```bash
# Linux/Docker phân biệt hoa thường
# Đảm bảo import paths đúng casing:
import Component from './Components/Component'  # Sai
import Component from './components/Component'  # Đúng
```

### Railway Deployment Issues

**Build failed với Nixpacks:**
```bash
# Solution: Dùng Dockerfile thay vì Nixpacks
# Tạo file Backend/railway.toml:
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile"
```

**Environment variables trống:**
```bash
# Railway reference syntax ${{MySQL.MYSQLHOST}} chỉ hoạt động
# khi MySQL và Backend ở cùng 1 project
# Hoặc dùng direct values: mysql.railway.internal
```

---

## 📚 Documentation

### 📖 Project Documentation
- **[CI-CD_README.md](./CI-CD_README.md)** - GitHub Actions CI/CD pipeline setup & configuration
- **[KTPM.docx](./docs/KTPM.docx)** - Tài liệu đồ án KTPM đầy đủ
- **[ScreenDesign.xlsx](./docs/ScreenDesign.xlsx)** - Thiết kế màn hình giao diện
- **[UseCase.xlsx](./docs/UseCase.xlsx)** - Use case diagram & specification

### 📊 Test Documentation
- **[Test_Case.xlsx](./docs/Test_Case.xlsx)** - 64 backend test cases (Unit & Integration)
  - Module Auth: 21 test cases (Authentication & Authorization)
  - Module Cart: 15 test cases (Shopping cart operations)
  - Module Order: 17 test cases (Order management)
  - Module Search: 11 test cases (Product search functionality)
  
- **[Test_Case_E2E.xlsx](./docs/Test_Case_E2E.xlsx)** - 27 Cypress E2E test cases
  - Module 1 (User Management): 10 test cases
  - Module 2 (Product Browsing): 11 test cases
  - Module 3 (Cart & Checkout): 6 test cases
  
- **[Test Design.xlsx](./docs/Test%20Design.xlsx)** - Complete test design matrix & documentation

### 🎯 Test Coverage by Module

| Module | Description | Test Cases | Status |
|--------|-------------|------------|--------|
| **Module 1** | User Management & Authentication: Đăng ký (4), Đăng nhập (4), Đăng xuất (2), Token storage, Session management. | 10 cases | ✅ 100% |
| **Module 2** | Product Browsing: Tìm kiếm (3), Duyệt sản phẩm (5), Chi tiết sản phẩm (3), Filter category, View images. | 11 cases | ✅ 100% |
| **Module 3** | Cart & Checkout: Complete purchase journey, Thêm/Xóa giỏ hàng, Tăng giảm SL, Validate delivery info, Empty cart, Thanh toán COD. | 6 cases | ✅ 100% |

### 📋 Pre-Conditions for Testing

| Module | Pre-Condition |
|--------|---------------|
| **Module 1** | Backend/Frontend running; Database seeded; Browser cache cleared. |
| **Module 2** | Có ít nhất 10 sản phẩm trong DB thuộc nhiều category; Hình ảnh và giá hợp lệ. |
| **Module 3** | User đã đăng nhập; Sản phẩm còn hàng (In stock); Cart badge functional. |

---

## 📞 Liên hệ

**Author:** Võ Duy Toàn  
**Email:** voduytoan6a@gmail.com  
**GitHub:** [Scarlet7153](https://github.com/Scarlet7153)  
**Repository:** [Cake-Shop](https://github.com/Scarlet7153/Cake-Shop)

---

**Developed with ❤️ by Võ Duy Toàn**
