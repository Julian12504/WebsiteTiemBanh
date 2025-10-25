@echo off
chcp 65001 >nul
title Website Tiệm Bánh - Docker Setup

echo.
echo ================================================
echo    🍰 Website Tiệm Bánh - Docker Setup
echo ================================================
echo.

REM Kiểm tra Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker chưa được cài đặt!
    echo.
    echo 📥 Vui lòng cài Docker Desktop tại:
    echo    https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose chưa được cài đặt!
    echo.
    echo 📥 Docker Desktop đã bao gồm Docker Compose.
    echo    Vui lòng cài Docker Desktop.
    echo.
    pause
    exit /b 1
)

echo ✅ Docker đã sẵn sàng!
echo.

REM Kiểm tra containers đã chạy
docker-compose ps | findstr "Up" >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Ứng dụng đang chạy!
    echo.
    echo Bạn muốn:
    echo   [1] Mở trình duyệt
    echo   [2] Xem logs
    echo   [3] Restart containers
    echo   [4] Dừng containers
    echo   [5] Xóa hết và chạy lại
    echo   [0] Thoát
    echo.
    set /p choice="Chọn (0-5): "
    
    if "%choice%"=="1" goto open_browser
    if "%choice%"=="2" goto show_logs
    if "%choice%"=="3" goto restart
    if "%choice%"=="4" goto stop
    if "%choice%"=="5" goto clean_restart
    if "%choice%"=="0" goto end
    
    echo ❌ Lựa chọn không hợp lệ
    pause
    exit /b 1
)

REM Chạy Docker Compose
echo 🚀 Đang khởi động Docker containers...
echo.
echo ⏳ Quá trình này mất 2-3 phút lần đầu tiên...
echo    Docker đang tải images và build containers...
echo.

docker-compose up -d

if %errorlevel% neq 0 (
    echo.
    echo ❌ Lỗi khi khởi động containers!
    echo.
    echo 💡 Thử các cách sau:
    echo    1. Kiểm tra Docker Desktop đang chạy
    echo    2. Chạy: docker-compose logs
    echo    3. Thử lại: docker-compose down ^&^& docker-compose up -d
    echo.
    pause
    exit /b 1
)

echo.
echo ⏳ Đang chờ services khởi động (30 giây)...
timeout /t 30 /nobreak >nul

echo.
echo ================================================
echo    ✅ Hoàn tất! Ứng dụng đã sẵn sàng!
echo ================================================
echo.
echo 🌐 Truy cập các địa chỉ sau:
echo.
echo    Frontend (Khách hàng):
echo    👉 http://localhost:5173
echo.
echo    Admin Panel (Quản lý):
echo    👉 http://localhost:5174
echo.
echo    Backend API:
echo    👉 http://localhost:4000
echo.
echo ================================================
echo.
echo 👤 Tài khoản admin:
echo    Email:    admin@gmail.com
echo    Password: admin123
echo.
echo ================================================
echo.

:menu
echo Bạn muốn:
echo   [1] Mở trình duyệt
echo   [2] Xem logs
echo   [3] Dừng containers
echo   [0] Thoát
echo.
set /p choice="Chọn (0-3): "

if "%choice%"=="1" goto open_browser
if "%choice%"=="2" goto show_logs
if "%choice%"=="3" goto stop
if "%choice%"=="0" goto end

echo ❌ Lựa chọn không hợp lệ
echo.
goto menu

:open_browser
echo.
echo 🌐 Đang mở trình duyệt...
start http://localhost:5173
start http://localhost:5174
echo.
echo ✅ Đã mở Frontend và Admin trong trình duyệt!
echo.
goto menu

:show_logs
echo.
echo 📋 Đang hiển thị logs (Ctrl+C để thoát)...
echo.
docker-compose logs -f
goto menu

:restart
echo.
echo 🔄 Đang restart containers...
docker-compose restart
echo ✅ Đã restart!
echo.
timeout /t 5 /nobreak >nul
goto menu

:stop
echo.
echo 🛑 Đang dừng containers...
docker-compose down
echo.
echo ✅ Đã dừng tất cả containers!
echo.
echo 💡 Để chạy lại, chạy start.bat hoặc: docker-compose up -d
echo.
pause
exit /b 0

:clean_restart
echo.
echo 🗑️  Đang xóa containers và volumes...
docker-compose down -v
echo.
echo 🚀 Đang chạy lại từ đầu...
docker-compose up -d
echo.
echo ✅ Đã khởi động lại!
echo.
timeout /t 30 /nobreak >nul
goto menu

:end
echo.
echo 👋 Tạm biệt!
echo.
echo 💡 Containers vẫn đang chạy. Để dừng, chạy:
echo    docker-compose down
echo.
pause
exit /b 0
