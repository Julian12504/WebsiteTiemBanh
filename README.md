# 🍰 Website Tiệm Bánh - Cake Shop Management System

Hệ thống quản lý tiệm bánh toàn diện với giao diện người dùng và admin panel, tích hợp thanh toán online và quản lý tồn kho.

## 📋 Tổng quan dự án

Website tiệm bánh được phát triển với kiến trúc full-stack, bao gồm:
- **Frontend**: Giao diện khách hàng mua bánh online
- **Admin Panel**: Hệ thống quản lý cho chủ tiệm bánh
- **Backend API**: Server xử lý logic nghiệp vụ
- **Database**: MySQL lưu trữ dữ liệu

## 🛠️ Công nghệ sử dụng

### Frontend (Khách hàng)
- **React.js 18** - Thư viện UI chính
- **Vite** - Build tool và dev server
- **React Router DOM** - Điều hướng trang
- **Axios** - HTTP client
- **React Toastify** - Thông báo popup
- **CSS3** - Styling responsive

### Admin Panel
- **React.js 18** - Thư viện UI chính
- **Vite** - Build tool và dev server
- **React Router DOM** - Điều hướng trang
- **Axios** - HTTP client
- **React Toastify** - Thông báo popup
- **CSS3** - Styling responsive

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload
- **Cloudinary** - Image storage
- **MoMo Payment** - Payment gateway
- **Mock Payment Service** - Test payment system

### Database
- **MySQL 8.0+** - Relational database
- **Các bảng chính**:
  - `users` - Thông tin khách hàng
  - `admins` - Thông tin quản trị viên
  - `items` - Sản phẩm bánh
  - `orders` - Đơn hàng
  - `order_items` - Chi tiết đơn hàng
  - `cart` - Giỏ hàng
  - `suppliers` - Nhà cung cấp
  - `grn` - Phiếu nhập kho
  - `reviews` - Đánh giá sản phẩm

## ⚡ Quick Start

Để chạy nhanh dự án:

```bash
# 1. Clone và cài đặt
git clone <repository-url>
cd WebsiteTiemBanh

# 2. Cài đặt Backend
cd Backend
npm install
cp .env.example .env
# Cấu hình database trong .env

# 3. Cài đặt Frontend
cd ../Frontend
npm install

# 4. Cài đặt Admin
cd ../Admin
npm install

# 5. Chạy tất cả (3 terminal riêng biệt)
# Terminal 1: Backend
cd Backend && npm start

# Terminal 2: Frontend
cd Frontend && npm run dev

# Terminal 3: Admin
cd Admin && npm run dev
```

**Truy cập:**
- Frontend: http://localhost:5173
- Admin: http://localhost:5174 (hoặc port khác)
- Backend API: http://localhost:4000

## 🚀 Cài đặt chi tiết

### Yêu cầu hệ thống
- Node.js 16.0+
- MySQL 8.0+
- npm hoặc yarn

### 1. Clone repository
```bash
git clone <repository-url>
cd WebsiteTiemBanh
```

### 2. Cài đặt Backend
```bash
cd Backend
npm install

# Tạo file .env từ .env.example
cp .env.example .env

# Cấu hình database trong .env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=cake_shop

# Chạy migration và seed data
mysql -u your_username -p < database/cake_shop.sql

# Tạo admin account
node create-admin.js

# Chạy server
npm start
```

### 3. Cài đặt Frontend (Khách hàng)
```bash
cd Frontend
npm install
npm run dev
```

### 4. Cài đặt Admin Panel
```bash
cd Admin
npm install
npm run dev
```

## 📁 Cấu trúc thư mục

```
WebsiteTiemBanh/
├── Frontend/                 # Giao diện khách hàng
│   ├── src/
│   │   ├── components/       # Components tái sử dụng
│   │   ├── pages/           # Các trang chính
│   │   ├── context/         # State management
│   │   ├── assets/          # Hình ảnh, icons
│   │   └── App.jsx          # Entry point
│   └── package.json
├── Admin/                   # Admin panel
│   ├── src/
│   │   ├── Components/      # Components admin
│   │   ├── Pages/          # Các trang quản lý
│   │   ├── context/        # Admin context
│   │   └── assets/         # Assets admin
│   └── package.json
├── Backend/                 # API server
│   ├── controllers/         # Business logic
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Auth, validation
│   ├── config/             # Database config
│   ├── database/           # SQL files
│   └── server.js           # Entry point
└── README.md
```

## 🔧 Cấu hình môi trường

### Backend (.env)
Tham khảo file `Backend/env.example` để có đầy đủ các biến môi trường cần thiết:

```env
# Database Configuration
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=your_db_name
DB_PORT=your_db_port

# Server Configuration
NODE_ENV=development
PORT=4000

# JWT Authentication
JWT_SECRET=your_jwt_secret

# Test Payment Configuration (No external keys needed - built-in mock service)

# Cloudinary Image Storage Configuration
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret_key
CLOUDINARY_NAME=your_cloudinary_cloud_name

# MoMo Payment Gateway Configuration
MOMO_PARTNER_CODE=your_momo_partner_code
MOMO_ACCESS_KEY=your_momo_access_key
MOMO_SECRET_KEY=your_momo_secret_key
MOMO_ENDPOINT=your_momo_endpoint
MOMO_QUERY_ENDPOINT=your_momo_query_endpoint
MOMO_RETURN_URL=your_momo_return_url
MOMO_NOTIFY_URL=your_momo_notify_url
MOMO_PARTNER_NAME=your_momo_partner_name
MOMO_STORE_ID=your_momo_store_id

# Frontend URL (for CORS and redirects)
FRONTEND_URL=http://localhost:5173
```

**Lưu ý**: Thay thế tất cả `your_xxx` bằng giá trị thực tế của bạn.

## 🔌 API Endpoints

### Authentication
- `POST /api/user/login` - Đăng nhập user
- `POST /api/user/register` - Đăng ký user
- `POST /api/admin/login` - Đăng nhập admin

### Products
- `GET /api/item/list` - Lấy danh sách sản phẩm
- `GET /api/item/:id` - Lấy chi tiết sản phẩm
- `POST /api/item/add` - Thêm sản phẩm (Admin)
- `PUT /api/item/:id` - Cập nhật sản phẩm (Admin)
- `DELETE /api/item/:id` - Xóa sản phẩm (Admin)

### Orders
- `POST /api/order/place` - Đặt hàng
- `POST /api/order/verify` - Xác minh thanh toán
- `GET /api/order/user/:userId` - Lấy đơn hàng của user
- `GET /api/order/list` - Lấy danh sách đơn hàng (Admin)

### Payment
- `POST /api/order/momo/webhook` - MoMo webhook
- `GET /api/order/momo/return` - MoMo return URL

### Cart
- `POST /api/cart/add` - Thêm vào giỏ hàng
- `GET /api/cart/:userId` - Lấy giỏ hàng
- `DELETE /api/cart/:userId` - Xóa giỏ hàng

## 🎯 Tính năng chính

### 👥 Giao diện khách hàng
- ✅ **Trang chủ** - Banner, sản phẩm nổi bật
- ✅ **Danh sách sản phẩm** - Lọc theo danh mục, tìm kiếm
- ✅ **Chi tiết sản phẩm** - Thông tin, đánh giá, số lượng
- ✅ **Giỏ hàng** - Quản lý sản phẩm, cập nhật số lượng
- ✅ **Đặt hàng** - Form thông tin giao hàng
- ✅ **Thanh toán** - Test Payment, MoMo
- ✅ **Đơn hàng của tôi** - Theo dõi trạng thái
- ✅ **Đăng nhập/Đăng ký** - Xác thực người dùng
- ✅ **Đánh giá sản phẩm** - Rating và comment

### 👨‍💼 Admin Panel
- ✅ **Dashboard** - Thống kê tổng quan
- ✅ **Quản lý sản phẩm** - CRUD, upload hình ảnh
- ✅ **Quản lý đơn hàng** - Xem, cập nhật trạng thái
- ✅ **Quản lý tồn kho** - GRN (Goods Received Note)
- ✅ **Quản lý nhà cung cấp** - CRUD suppliers
- ✅ **Quản lý người dùng** - Admin, nhân viên
- ✅ **Báo cáo** - Xuất báo cáo PDF
- ✅ **In barcode** - Tạo và in mã vạch
- ✅ **POS** - Point of Sale system

## 🔐 Bảo mật

- **JWT Authentication** - Token-based auth
- **Password Hashing** - Bcrypt encryption
- **Input Validation** - Sanitize user input
- **CORS** - Cross-origin protection
- **Rate Limiting** - Prevent abuse
- **SQL Injection Protection** - Parameterized queries

## 💳 Hệ thống thanh toán

### 🧪 Test Payment
- **Mô tả**: Thanh toán test được tích hợp sẵn trong hệ thống
- **Đặc điểm**: 
  - Luôn thành công ngay lập tức
  - Không cần thông tin thẻ hay tài khoản
  - Phù hợp cho testing và demo
- **Currency**: VND
- **Sử dụng**: Chọn "Test Payment" trong quá trình thanh toán

### 📱 MoMo Payment
- **Mô tả**: Tích hợp với ví điện tử MoMo
- **Đặc điểm**:
  - QR code payment
  - Thanh toán an toàn và nhanh chóng
  - Hỗ trợ đầy đủ các tính năng của MoMo
- **Currency**: VND
- **Cấu hình**: Cần cấu hình các key MoMo trong file .env

## 📱 Responsive Design

- **Desktop** - Full features
- **Tablet** - Optimized layout
- **Mobile** - Touch-friendly interface

## 🚀 Deployment

### Production Build
```bash
# Frontend
cd Frontend
npm run build

# Admin
cd Admin
npm run build

# Backend (chỉ cần source code)
```

### Environment Variables
Đảm bảo cấu hình đúng các biến môi trường cho production:
- Database connection
- JWT secret
- MoMo payment gateway keys (nếu sử dụng MoMo)
- Cloudinary credentials
- Frontend URL cho CORS

## 🐛 Debugging

### Logs
- Backend logs trong console
- Frontend errors trong browser console
- Database queries log

### Common Issues
1. **Database connection** - Kiểm tra MySQL service và thông tin kết nối
2. **CORS errors** - Cấu hình đúng FRONTEND_URL trong .env
3. **MoMo payment webhook** - Kiểm tra endpoint public và cấu hình MoMo
4. **File upload** - Cấu hình Cloudinary credentials
5. **Test payment không hoạt động** - Kiểm tra mockPaymentService
6. **JWT token errors** - Kiểm tra JWT_SECRET trong .env


## 📄 License

Dự án được phát triển cho mục đích học tập.

---

**Developed with ❤️ by Võ Duy Toàn**
