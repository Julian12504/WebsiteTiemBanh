# Hướng Dẫn Deploy Website Tiệm Bánh

Hướng dẫn này sẽ giúp bạn deploy:
- **Frontend (Customer)** lên **Vercel** - Giao diện khách hàng
- **Admin Panel** lên **Vercel** - Giao diện quản trị
- **Backend API** lên **Railway** - Server xử lý logic
- **Database MySQL** lên **Railway** - Lưu trữ dữ liệu

---

## 📁 Cấu Trúc Dự Án

```
WebsiteTiemBanh/
├── Frontend/          # React app cho khách hàng (Customer)
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json   # Config deploy Vercel
│
├── Admin/            # React app cho quản trị viên (Admin Panel)
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json   # Config deploy Vercel
│
├── Backend/          # Express.js API server
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── package.json
│   ├── server.js
│   ├── Procfile      # Config deploy Railway
│   └── railway.json  # Config deploy Railway
│
└── sql/
    └── cake_fantasy_db.sql  # Database schema
```

**3 ứng dụng độc lập**:
1. **Frontend**: Dành cho khách hàng - xem, mua sản phẩm
2. **Admin**: Dành cho quản trị - quản lý sản phẩm, đơn hàng
3. **Backend**: API server chung cho cả Frontend và Admin

---

## 🚀 Quick Start Deploy

### TL;DR - Các Bước Tóm Tắt:

1. **Deploy Backend + Database trên Railway**
   - Tạo project từ GitHub repo
   - Root Directory: `Backend`
   - Add MySQL database
   - Set environment variables
   - Lấy backend URL

2. **Deploy Frontend (Customer) trên Vercel**
   - Import GitHub repo
   - Root Directory: `Frontend`
   - Set `VITE_API_URL` = Railway backend URL
   - Deploy → lấy customer URL

3. **Deploy Admin Panel trên Vercel**
   - Import GitHub repo (project mới, cùng repo)
   - Root Directory: `Admin`
   - Set `VITE_API_URL` = Railway backend URL
   - Deploy → lấy admin URL

4. **Update CORS trên Backend**
   - Thêm cả 2 Vercel URLs vào `FRONTEND_URL`
   - Format: `https://customer.vercel.app,https://admin.vercel.app`

---

## 📋 Yêu Cầu Chuẩn Bị

- Tài khoản GitHub
- Tài khoản Vercel (https://vercel.com)
- Tài khoản Railway (https://railway.app)
- Tài khoản Cloudinary (cho upload hình ảnh)
- Repository đã push lên GitHub

---

## 🚀 PHẦN 1: Deploy Backend lên Railway

### Bước 1: Tạo Project trên Railway

1. Đăng nhập vào Railway: https://railway.app
2. Click **"New Project"**
3. Chọn **"Deploy from GitHub repo"**
4. Chọn repository `WebsiteTiemBanh`
5. Railway sẽ tự động detect và deploy

### Bước 2: Thêm MySQL Database

1. Trong project Railway, click **"New"** → **"Database"** → **"Add MySQL"**
2. Railway sẽ tự động tạo MySQL instance và cung cấp connection strings
3. Lưu lại các thông tin sau (tự động sinh):
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLDATABASE`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`

### Bước 3: Cấu Hình Environment Variables cho Backend

Trong Railway project của Backend, vào **Variables** tab và thêm:

```env
# Database Configuration (lấy từ MySQL service Railway tạo)
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}

# JWT Secret (tạo random string mạnh)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Cloudinary Configuration (lấy từ dashboard Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# CORS Configuration (thêm domain Vercel của frontend sau khi deploy)
FRONTEND_URL=https://your-frontend-app.vercel.app

# MoMo Payment (nếu dùng thanh toán MoMo)
MOMO_PARTNER_CODE=your_momo_partner_code
MOMO_ACCESS_KEY=your_momo_access_key
MOMO_SECRET_KEY=your_momo_secret_key
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create

# Port (Railway tự động set)
PORT=4000
```

**Lưu ý**: Railway có thể tự động inject MySQL variables nếu bạn link services. Sử dụng cú pháp `${{MySQL.VARIABLE_NAME}}` để reference.

### Bước 4: Cấu Hình Root Directory

1. Vào **Settings** tab trong Railway
2. Tìm **Root Directory**
3. Set thành: `Backend`
4. **Start Command**: `npm run server` (hoặc để trống nếu Railway tự detect từ `Procfile`)

### Bước 5: Import Database Schema

Sau khi MySQL đã chạy, import schema:

1. Kết nối MySQL qua Railway CLI hoặc MySQL client (TablePlus, MySQL Workbench)
2. Chạy file SQL: `sql/cake_fantasy_db.sql`

**Hoặc dùng Railway CLI**:
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# Connect to MySQL
railway connect MySQL

# Sau đó import SQL file
source /path/to/sql/cake_fantasy_db.sql
```

### Bước 6: Lấy Backend URL

- Railway sẽ tự động generate domain: `https://your-backend-app.up.railway.app`
- Hoặc bạn có thể add custom domain trong **Settings** → **Domains**
- **Lưu lại URL này để cấu hình Frontend**

---

## 🎨 PHẦN 2: Deploy Frontend (Customer) lên Vercel

### Bước 1: Import Project vào Vercel

1. Đăng nhập vào Vercel: https://vercel.com
2. Click **"Add New..."** → **"Project"**
3. Import repository `WebsiteTiemBanh` từ GitHub
4. Vercel sẽ tự động detect Vite/React

### Bước 2: Cấu Hình Project Settings

Trong **Configure Project**:

- **Project Name**: `cake-fantasy-customer` (hoặc tên bạn muốn)
- **Framework Preset**: Vite
- **Root Directory**: `Frontend` ⚠️ (click **Edit** và chọn `Frontend`)
- **Build Command**: `npm run build` (Vercel tự động detect)
- **Output Directory**: `dist` (Vercel tự động detect)
- **Install Command**: `npm install`

### Bước 3: Thêm Environment Variables

Vào **Environment Variables** và thêm:

```env
# Backend API URL (thay bằng Railway backend URL của bạn)
VITE_API_URL=https://your-backend-app.up.railway.app

# Application name
VITE_APP_NAME=Cake Fantasy
```

**Lưu ý**: 
- Vercel yêu cầu prefix `VITE_` cho các biến môi trường trong Vite app
- Đảm bảo không có dấu `/` ở cuối `VITE_API_URL`

### Bước 4: Deploy

1. Click **"Deploy"**
2. Vercel sẽ build và deploy frontend customer
3. Sau khi deploy xong, bạn sẽ nhận được URL: `https://your-customer-app.vercel.app`
4. **Lưu lại URL này** để cấu hình CORS

---

## 🔐 PHẦN 3: Deploy Admin Panel lên Vercel

### Bước 1: Tạo Project Mới cho Admin

1. Trong Vercel Dashboard, click **"Add New..."** → **"Project"**
2. Chọn lại repository `WebsiteTiemBanh` (same repo, different root)
3. Vercel cho phép nhiều projects từ cùng 1 repo

### Bước 2: Cấu Hình Admin Project

Trong **Configure Project**:

- **Project Name**: `cake-fantasy-admin` (hoặc tên bạn muốn)
- **Framework Preset**: Vite
- **Root Directory**: `Admin` ⚠️ (click **Edit** và chọn `Admin`)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Bước 3: Thêm Environment Variables cho Admin

```env
# Backend API URL (cùng Railway backend)
VITE_API_URL=https://your-backend-app.up.railway.app

# Application name
VITE_APP_NAME=Cake Fantasy Admin
```

### Bước 4: Deploy Admin

1. Click **"Deploy"**
2. Vercel sẽ build và deploy admin panel
3. Sau khi deploy xong, bạn sẽ nhận được URL: `https://your-admin-app.vercel.app`
4. **Lưu lại URL này** để cấu hình CORS

---

## 🔗 PHẦN 4: Cập Nhật CORS cho Backend

Sau khi có cả 2 URLs (Customer + Admin), quay lại Railway Backend:

### Bước 1: Cập Nhật Environment Variable

1. Vào Railway Backend project → **Variables**
2. Cập nhật `FRONTEND_URL` với **CẢ HAI** domain (ngăn cách bằng dấu phẩy):
   ```env
   FRONTEND_URL=https://your-customer-app.vercel.app,https://your-admin-app.vercel.app
   ```
3. Railway sẽ tự động redeploy backend

---

### Bước 2: Kiểm Tra Backend CORS Code

Đảm bảo file `Backend/server.js` xử lý multiple origins đúng:

```javascript
import cors from 'cors';

// Parse FRONTEND_URL để support nhiều domains
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : [];

// Add localhost cho development
allowedOrigins.push('http://localhost:5173'); // Customer dev
allowedOrigins.push('http://localhost:5174'); // Admin dev

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

---

## ✅ PHẦN 5: Kiểm Tra Deployment

### Checklist sau khi deploy:

**Backend (Railway)**:
- [ ] Backend API đang chạy: `https://your-backend.railway.app/api/item/list`
- [ ] Database đã import schema thành công
- [ ] Environment variables đã set đầy đủ

**Frontend Customer (Vercel)**:
- [ ] Customer site load được: `https://your-customer-app.vercel.app`
- [ ] Kết nối Backend API thành công (check Network tab)
- [ ] CORS không báo lỗi trong console
- [ ] Login/Register khách hàng hoạt động
- [ ] Xem sản phẩm, giỏ hàng hoạt động
- [ ] Đặt hàng và thanh toán hoạt động

**Admin Panel (Vercel)**:
- [ ] Admin site load được: `https://your-admin-app.vercel.app`
- [ ] Kết nối Backend API thành công
- [ ] CORS không báo lỗi
- [ ] Login admin hoạt động
- [ ] Quản lý sản phẩm, đơn hàng hoạt động
- [ ] Upload hình ảnh lên Cloudinary hoạt động
- [ ] Dashboard, reports hiển thị đúng

### Test Endpoints

```bash
# Test Backend health
curl https://your-backend.railway.app/api/item/list

# Test Customer Frontend
open https://your-customer-app.vercel.app

# Test Admin Panel
open https://your-admin-app.vercel.app
```

### URLs Summary

Sau khi deploy xong, bạn sẽ có 3 URLs:

1. **Backend API**: `https://your-backend-app.up.railway.app`
2. **Customer Site**: `https://your-customer-app.vercel.app`
3. **Admin Panel**: `https://your-admin-app.vercel.app`

**Lưu lại 3 URLs này!**

---

## 🔐 Bảo Mật và Best Practices

### Environment Variables

- ✅ **KHÔNG BAO GIỜ** commit file `.env` vào Git
- ✅ Sử dụng `.env.example` để template
- ✅ Tạo JWT_SECRET mạnh (random 64+ ký tự)
- ✅ Rotate secrets định kỳ

### Database

- ✅ Backup database định kỳ
- ✅ Railway tự động backup, nhưng nên có backup riêng
- ✅ Sử dụng connection pooling (đã có trong Sequelize)

### SSL/HTTPS

- ✅ Railway và Vercel tự động cung cấp SSL certificate
- ✅ Đảm bảo tất cả requests đều dùng HTTPS

---

## 🐛 Troubleshooting

### Lỗi CORS

**Triệu chứng**: Console báo "CORS policy blocked"

**Giải pháp**:
1. Kiểm tra `FRONTEND_URL` trong Railway backend variables
2. Đảm bảo không có `/` ở cuối URL
3. Restart backend service trên Railway

### Lỗi Database Connection

**Triệu chứng**: "ECONNREFUSED" hoặc "Access denied for user"

**Giải pháp**:
1. Kiểm tra MySQL service đang chạy trên Railway
2. Verify database credentials trong Variables
3. Đảm bảo Railway đã link Backend service với MySQL service

### Build Failed trên Vercel

**Triệu chứng**: Build error "MODULE_NOT_FOUND" hoặc import errors

**Giải pháp**:
1. Kiểm tra `package.json` có đầy đủ dependencies
2. Chạy `npm install` local để verify
3. Kiểm tra case-sensitive imports (Linux phân biệt hoa/thường)
4. Xem build logs trên Vercel để biết chi tiết

### Backend Crash on Railway

**Triệu chứng**: Service restart liên tục

**Giải pháp**:
1. Xem logs trong Railway dashboard
2. Kiểm tra `PORT` environment variable
3. Đảm bảo `npm run server` command đúng
4. Check database connection string

### Admin Panel không login được

**Triệu chứng**: Admin login fail hoặc unauthorized

**Giải pháp**:
1. Kiểm tra `VITE_API_URL` đã đúng chưa
2. Verify admin user đã tạo trong database (dùng `Backend/create-admin.js`)
3. Check JWT token trong localStorage
4. Xem Network tab để debug API calls

### Frontend/Admin khác biệt về port dev

**Lưu ý**: 
- Frontend (Customer) chạy trên port `5173`
- Admin Panel chạy trên port `5174` (nếu cùng lúc)
- Đảm bảo CORS backend allow cả 2 ports khi dev

---

## 📚 Tài Liệu Tham Khảo

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Express + Railway Guide](https://docs.railway.app/guides/nodejs)

---

## 🆘 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra logs trên Railway (Backend) và Vercel (Frontend)
2. Verify tất cả environment variables
3. Test API endpoints bằng Postman/Thunder Client
4. Kiểm tra database connection

---

**Chúc bạn deploy thành công! 🎉**
