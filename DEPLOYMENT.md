# 🚀 CI/CD Auto Deploy - Cake Shop

Hướng dẫn setup CI/CD tự động cho Cake Shop - **CHỈ CẦN 3 BƯỚC!**

## ✅ **BƯỚC 1: Chuẩn bị VPS (chỉ làm 1 lần)**

```bash
# SSH vào VPS và chạy:
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Cài Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Tạo thư mục project
sudo mkdir -p /opt/cake-shop
sudo chown $USER:$USER /opt/cake-shop
cd /opt/cake-shop

# Clone code
git clone https://github.com/your-username/your-repo.git .

# Tạo file .env
cp env.production.example .env
nano .env  # Cập nhật thông tin thực
```

## ✅ **BƯỚC 2: Cấu hình GitHub Secrets (chỉ làm 1 lần)**

Vào GitHub repository → **Settings** → **Secrets and variables** → **Actions**

Thêm 4 secrets:
- `VPS_HOST`: IP của VPS (ví dụ: 123.456.789.0)
- `VPS_USERNAME`: username SSH (ví dụ: root hoặc ubuntu)
- `VPS_SSH_KEY`: Private SSH key (nội dung file ~/.ssh/id_rsa)
- `VPS_PORT`: 22

### Cách tạo SSH key:
```bash
# Trên máy local
ssh-keygen -t rsa -b 4096
cat ~/.ssh/id_rsa  # Copy toàn bộ nội dung này làm VPS_SSH_KEY
cat ~/.ssh/id_rsa.pub  # Copy nội dung này vào ~/.ssh/authorized_keys trên VPS
```

## ✅ **BƯỚC 3: Push code để deploy tự động!**

```bash
git add .
git commit -m "Setup auto deploy"
git push origin main
```

**🎉 XONG!** Từ giờ mỗi khi push code lên main branch sẽ tự động deploy!

---

## 🌐 **URLs sau khi deploy:**

- **Website**: `http://your-vps-ip`
- **Admin Panel**: `http://your-vps-ip:8080`
- **API**: `http://your-vps-ip:4000/api`

## 🔧 **Các lệnh hữu ích trên VPS:**

```bash
# Xem logs
docker-compose logs -f

# Restart services
docker-compose restart

# Kiểm tra status
docker-compose ps

# Dừng tất cả
docker-compose down

# Khởi động lại
docker-compose up -d
```

## 📁 **Files quan trọng:**

- `docker-compose.yml` - Cấu hình tất cả services
- `.env` - Biến môi trường production
- `Backend/.github/workflows/main.yml` - CI/CD pipeline

**Chỉ cần 3 bước là xong! 🚀**