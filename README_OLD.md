# 🍰 Website Tiệm Bánh - Cake Shop Management System

Hệ thống quản lý tiệm bánh full-stack: Frontend (khách hàng) + Admin Panel + Backend API + MySQL Database

## 🌐 Live Demo

| Service | URL | Desc## 🚀 Deploy to Production

Muốn deploy lên production (Vercel + Railway)?

**Xem hướng dẫn chi tiết tại:** [DEPLOYMENT.md](./DEPLOYMENT.md)

**Production URLs:**
- **Customer:** https://cake-shop-fe.vercel.app/
- **Admin:** https://cake-shop-admin-livid.vercel.app
- **Backend API:** https://cake-shop.up.railway.app

**Tech Stack:**
- Frontend/Admin: Vercel (React + Vite)
- Backend: Railway (Node.js + Express)
- Database: Railway (MySQL)
- CI/CD: GitHub Actions

---

## 🐛 Common Issues------|-----|-------------|
| 🛍️ **Customer Site** | [https://cake-shop-fe.vercel.app](https://cake-shop-fe.vercel.app/) | Website khách hàng |
| 👨‍💼 **Admin Panel** | [https://cake-shop-admin-livid.vercel.app](https://cake-shop-admin-livid.vercel.app) | Quản lý tiệm bánh |
| 🔌 **Backend API** | [https://cake-shop.up.railway.app](https://cake-shop.up.railway.app) | REST API + MySQL |

**Admin Credentials:** `admin@gmail.com` / `admin123`

---

## ⚡ Quick Start (Local Development)

```bash
git clone <repository-url>
cd WebsiteTiemBanh
docker-compose up
```

**Đợi 2-3 phút**, sau đó truy cập:

| Service | URL | Tài khoản |
|---------|-----|-----------|
| 🌐 Frontend | http://localhost:5173 | - |
| 👨‍💼 Admin | http://localhost:5174 | admin@gmail.com / admin123 |
| 🔌 API | http://localhost:4000 | - |

**Dừng:** `docker-compose down`

---

## 🛠️ Công nghệ

**Frontend:** React 19 + Vite  
**Admin:** React 19 + Vite + Chart.js  
**Backend:** Node.js + Express + MySQL + JWT  
**Payment:** MoMo + Mock Payment  

---

## 🎯 Tính năng chính

### 👥 Khách hàng
- Xem sản phẩm, giỏ hàng, đặt hàng
- Thanh toán online (MoMo/Test)
- Theo dõi đơn hàng, đánh giá sản phẩm

### 👨‍💼 Admin
- Dashboard thống kê, quản lý sản phẩm
- Quản lý đơn hàng, tồn kho, nhà cung cấp
- In barcode, POS, báo cáo PDF

---

## 🐳 Docker Setup

### Yêu cầu
Chỉ cần [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Lệnh hữu ích
```bash
docker-compose up -d        # Chạy background
docker-compose logs -f      # Xem logs
docker-compose restart      # Restart
docker-compose down         # Dừng
docker-compose down -v      # Xóa hết data
```

### Troubleshooting

**Port bị chiếm:**  
Sửa port trong `docker-compose.yml`:
```yaml
ports:
  - "5175:5173"  # Thay 5173 thành 5175
```

**Container không start:**  
```bash
docker-compose logs backend
docker-compose restart backend
```

**Xóa tất cả và chạy lại:**  
```bash
docker-compose down -v
docker-compose up --build
```

---

## 🛠️ Setup thủ công (không dùng Docker)

### Yêu cầu
Node.js 16+, MySQL 8.0+, npm

### Cài đặt
```bash
# Backend
cd Backend
npm install
cp .env.example .env
# Sửa DB config trong .env
mysql -u root -p < database/cake_shop.sql

# Frontend
cd ../Frontend
npm install

# Admin
cd ../Admin
npm install

# Chạy (3 terminal)
cd Backend && npm run server
cd Frontend && npm run dev
cd Admin && npm run dev
```

### Backend/.env
```env
DB_HOST=127.0.0.1
DB_USER=root
DB_PASS=your_password
DB_NAME=cake_fantasy_db
JWT_SECRET=your_secret

# Cloudinary (optional)
CLOUDINARY_API_KEY=your_key
CLOUDINARY_SECRET_KEY=your_secret
CLOUDINARY_NAME=your_name

# MoMo (optional)
MOMO_PARTNER_CODE=your_code
MOMO_ACCESS_KEY=your_key
MOMO_SECRET_KEY=your_secret
```

---

## 🔌 API Endpoints

**Auth:**  
`POST /api/user/login`, `/api/user/register`, `/api/admin/login`

**Products:**  
`GET /api/item/list`, `GET /api/item/:id`  
`POST /api/item/add`, `PUT /api/item/update/:id`, `DELETE /api/item/remove/:id` (Admin)

**Orders:**  
`POST /api/order/place`, `GET /api/order/user/:userId`  
`GET /api/order/list`, `PUT /api/order/status` (Admin)

**Cart:**  
`POST /api/cart/add`, `GET /api/cart/:userId`, `DELETE /api/cart/:userId`

---

## 📊 Database

Các bảng: `users`, `admin_users`, `items`, `orders`, `order_items`, `suppliers`, `grn_headers`, `grn_details`, `reviews`

Database tự động import khi chạy Docker.

---

## 🔐 Bảo mật

JWT Authentication, Bcrypt password, Input validation, CORS, SQL injection prevention

---

## 🚀 Production

### Với Docker
```bash
docker-compose up -d
```

### Manual
```bash
# Build frontend
cd Frontend && npm run build
cd ../Admin && npm run build

# Run backend với PM2
cd Backend
npm install -g pm2
pm2 start server.js --name "cake-backend"

# Setup Nginx + SSL
```

---

## � Deploy to Production

Muốn deploy lên production (Vercel + Railway)?

**Xem hướng dẫn chi tiết tại:** [DEPLOYMENT.md](./DEPLOYMENT.md)

**Tóm tắt:**
- Frontend (Customer) → Vercel
- Admin Panel → Vercel  
- Backend + MySQL → Railway

---

## �🐛 Common Issues

**DB connection failed:** Kiểm tra MySQL running, kiểm tra .env  
**CORS errors:** Kiểm tra backend running  
**Port in use:** Đổi port trong docker-compose.yml  
**Hot reload không hoạt động:** Restart container  

---

## 📚 Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Hướng dẫn deploy production
- [CI-CD_README.md](./CI-CD_README.md) - GitHub Actions CI/CD
- Backend API docs: http://localhost:4000/api-docs (khi chạy)

---

## 📞 Liên hệ

**Author:** Võ Duy Toàn  
**Email:** voduytoan6a@gmail.com

---

**Developed with ❤️ by Võ Duy Toàn**
