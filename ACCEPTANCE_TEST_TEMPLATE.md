# Template Kiểm Thử Chấp Nhận (Acceptance Testing)
## Website Tiệm Bánh - Cake Fantasy

---

## 📋 Hướng Dẫn Sử Dụng Template

### Mục đích
Template này dùng để:
- Ghi nhận các test cases cho kiểm thử chấp nhận (UAT - User Acceptance Testing)
- Theo dõi kết quả kiểm thử thủ công
- Báo cáo bugs phát hiện
- Đánh giá mức độ đáp ứng yêu cầu nghiệp vụ

### Cách sử dụng
1. Copy nội dung bên dưới vào Excel/Google Sheets
2. Thực hiện từng test case theo thứ tự
3. Ghi kết quả vào cột "Actual Result" và "Status"
4. Nếu FAIL, tạo Bug ID và mô tả chi tiết
5. Cuối cùng tổng hợp báo cáo

---

## 📊 BẢNG TEST CASES - ACCEPTANCE TESTING

### Thông tin chung
- **Dự án:** Website Tiệm Bánh - Cake Fantasy
- **Version test:** 1.0.0
- **Ngày bắt đầu UAT:** [DD/MM/YYYY]
- **Ngày kết thúc UAT:** [DD/MM/YYYY]
- **Tester:** [Tên người test]
- **Môi trường test:** [Production/Staging URL]

---

### EPIC 1: QUẢN LÝ NGƯỜI DÙNG (USER MANAGEMENT)

#### User Story US-001: Người dùng có thể đăng ký tài khoản

| Test ID | Test Scenario | Priority | Pre-condition | Test Steps | Expected Result | Actual Result | Status | Bug ID | Notes | Tester | Date |
|---------|---------------|----------|---------------|------------|-----------------|---------------|--------|--------|-------|--------|------|
| TC_ACC_001 | Đăng ký với thông tin hợp lệ | HIGH | - Chưa có tài khoản<br>- Browser đã xóa cache | 1. Truy cập trang chủ http://localhost:5173<br>2. Click nút "Đăng nhập" ở header<br>3. Click tab "Tạo tài khoản"<br>4. Nhập Tên: "Nguyễn Văn A"<br>5. Nhập Email: "nguyenvana@gmail.com"<br>6. Nhập Password: "MatKhau123!"<br>7. Click nút "Tạo tài khoản" | - Hiển thị toast "Đăng ký thành công"<br>- Tự động đăng nhập<br>- Popup đóng<br>- Header hiển thị tên "Nguyễn Văn A"<br>- URL về trang chủ "/" | | | | | | |
| TC_ACC_002 | Đăng ký với email đã tồn tại | HIGH | - Email "existing@test.com" đã được đăng ký | 1. Mở popup đăng ký<br>2. Nhập Tên: "Test User"<br>3. Nhập Email: "existing@test.com"<br>4. Nhập Password: "Pass123!"<br>5. Click "Tạo tài khoản" | - Hiển thị lỗi "Email đã được sử dụng"<br>- Không tạo tài khoản mới<br>- Form không reset | | | | | | |
| TC_ACC_003 | Đăng ký với email không hợp lệ | MEDIUM | - | 1. Mở popup đăng ký<br>2. Nhập Email: "invalid-email"<br>3. Nhập các field khác hợp lệ<br>4. Click "Tạo tài khoản" | - Hiển thị lỗi validation "Email không hợp lệ"<br>- Không submit form | | | | | | |
| TC_ACC_004 | Đăng ký với password ngắn (<8 ký tự) | MEDIUM | - | 1. Mở popup đăng ký<br>2. Nhập Password: "123"<br>3. Nhập các field khác hợp lệ<br>4. Click "Tạo tài khoản" | - Hiển thị lỗi "Mật khẩu phải có ít nhất 8 ký tự"<br>- Không submit form | | | | | | |
| TC_ACC_005 | Đăng ký bỏ trống trường bắt buộc | LOW | - | 1. Mở popup đăng ký<br>2. Bỏ trống trường "Tên"<br>3. Nhập Email và Password hợp lệ<br>4. Click "Tạo tài khoản" | - Hiển thị lỗi "Vui lòng nhập tên"<br>- Focus vào field "Tên" | | | | | | |

#### User Story US-002: Người dùng có thể đăng nhập

| Test ID | Test Scenario | Priority | Pre-condition | Test Steps | Expected Result | Actual Result | Status | Bug ID | Notes | Tester | Date |
|---------|---------------|----------|---------------|------------|-----------------|---------------|--------|--------|-------|--------|------|
| TC_ACC_006 | Đăng nhập với tài khoản hợp lệ | HIGH | - Đã có tài khoản email: "test@test.com" / pass: "Pass123!" | 1. Mở trang chủ<br>2. Click "Đăng nhập"<br>3. Nhập Email: "test@test.com"<br>4. Nhập Password: "Pass123!"<br>5. Click nút "Đăng nhập" | - Toast "Đăng nhập thành công"<br>- Popup đóng<br>- Header hiển thị tên user<br>- Token lưu vào localStorage | | | | | | |
| TC_ACC_007 | Đăng nhập với email sai | MEDIUM | - | 1. Click "Đăng nhập"<br>2. Nhập Email: "wrong@test.com"<br>3. Nhập Password: "Pass123!"<br>4. Click "Đăng nhập" | - Hiển thị lỗi "Email hoặc mật khẩu không đúng"<br>- Không đăng nhập<br>- Form không reset | | | | | | |
| TC_ACC_008 | Đăng nhập với password sai | MEDIUM | - | 1. Click "Đăng nhập"<br>2. Nhập Email đúng: "test@test.com"<br>3. Nhập Password sai: "WrongPass"<br>4. Click "Đăng nhập" | - Hiển thị lỗi "Email hoặc mật khẩu không đúng"<br>- Không đăng nhập | | | | | | |

#### User Story US-003: Người dùng có thể đăng xuất

| Test ID | Test Scenario | Priority | Pre-condition | Test Steps | Expected Result | Actual Result | Status | Bug ID | Notes | Tester | Date |
|---------|---------------|----------|---------------|------------|-----------------|---------------|--------|--------|-------|--------|------|
| TC_ACC_009 | Đăng xuất thành công | HIGH | - Đã đăng nhập | 1. Click vào tên user ở header<br>2. Click "Đăng xuất" | - Toast "Đăng xuất thành công"<br>- Header không còn tên user<br>- Hiện nút "Đăng nhập"<br>- Token bị xóa khỏi localStorage<br>- Redirect về trang chủ | | | | | | |

---

### EPIC 2: DUYỆT VÀ TÌM KIẾM SẢN PHẨM (PRODUCT BROWSING)

#### User Story US-004: Người dùng xem danh sách sản phẩm

| Test ID | Test Scenario | Priority | Pre-condition | Test Steps | Expected Result | Actual Result | Status | Bug ID | Notes | Tester | Date |
|---------|---------------|----------|---------------|------------|-----------------|---------------|--------|--------|-------|--------|------|
| TC_ACC_010 | Xem tất cả sản phẩm | HIGH | - Database có ít nhất 5 sản phẩm | 1. Vào trang chủ<br>2. Cuộn xuống phần "Sản phẩm" | - Hiển thị danh sách sản phẩm dạng grid<br>- Mỗi card hiển thị: Ảnh, Tên, Giá, Nút "Thêm vào giỏ"<br>- Load < 3 giây | | | | | | |
| TC_ACC_011 | Lọc sản phẩm theo category "Cake" | HIGH | - | 1. Vào trang chủ<br>2. Click category "Bánh" | - Chỉ hiển thị sản phẩm thuộc category "Cake"<br>- Category "Bánh" được highlight<br>- URL thay đổi (nếu có) | | | | | | |
| TC_ACC_012 | Lọc sản phẩm theo category "Cake Ingredients" | MEDIUM | - | 1. Click category "Nguyên liệu làm bánh" | - Hiển thị các nguyên liệu (bột, siro, ...)<br>- Category được highlight | | | | | | |

#### User Story US-005: Người dùng tìm kiếm sản phẩm

| Test ID | Test Scenario | Priority | Pre-condition | Test Steps | Expected Result | Actual Result | Status | Bug ID | Notes | Tester | Date |
|---------|---------------|----------|---------------|------------|-----------------|---------------|--------|--------|-------|--------|------|
| TC_ACC_013 | Tìm kiếm với keyword hợp lệ | HIGH | - Có sản phẩm tên "Bánh kem" | 1. Nhập "bánh kem" vào search box<br>2. Nhấn Enter hoặc click icon search | - Hiển thị danh sách sản phẩm có chứa "bánh kem"<br>- Highlight keyword trong tên sản phẩm | | | | | | |
| TC_ACC_014 | Tìm kiếm không có kết quả | MEDIUM | - | 1. Nhập "sản phẩm không tồn tại xyz123"<br>2. Nhấn Enter | - Hiển thị "Không tìm thấy sản phẩm"<br>- Gợi ý tìm kiếm khác | | | | | | |
| TC_ACC_015 | Tìm kiếm với ô trống | LOW | - | 1. Để trống search box<br>2. Click icon search | - Hiển thị thông báo "Vui lòng nhập từ khóa"<br>hoặc hiển thị tất cả sản phẩm | | | | | | |

#### User Story US-006: Người dùng xem chi tiết sản phẩm

| Test ID | Test Scenario | Priority | Pre-condition | Test Steps | Expected Result | Actual Result | Status | Bug ID | Notes | Tester | Date |
|---------|---------------|----------|---------------|------------|-----------------|---------------|--------|--------|-------|--------|------|
| TC_ACC_016 | Xem chi tiết 1 sản phẩm | HIGH | - | 1. Click vào 1 sản phẩm bất kỳ | - Chuyển sang trang chi tiết<br>- URL: /item/:id<br>- Hiển thị: Ảnh lớn, Tên, Giá, Mô tả, Số lượng selector, Nút "Thêm vào giỏ" | | | | | | |
| TC_ACC_017 | Tăng/giảm số lượng trên trang chi tiết | MEDIUM | - Đang ở trang chi tiết sản phẩm | 1. Click nút "+"<br>2. Click nút "-" | - Số lượng tăng/giảm<br>- Không giảm < 1<br>- Giá tổng = Đơn giá × Số lượng | | | | | | |

---

### EPIC 3: GIỎ HÀNG VÀ THANH TOÁN (CART & CHECKOUT)

#### User Story US-007: Người dùng thêm sản phẩm vào giỏ hàng

| Test ID | Test Scenario | Priority | Pre-condition | Test Steps | Expected Result | Actual Result | Status | Bug ID | Notes | Tester | Date |
|---------|---------------|----------|---------------|------------|-----------------|---------------|--------|--------|-------|--------|------|
| TC_ACC_018 | Thêm sản phẩm từ trang danh sách | HIGH | - Đã đăng nhập | 1. Hover vào 1 sản phẩm<br>2. Click nút "Thêm vào giỏ" | - Toast "Đã thêm vào giỏ hàng"<br>- Icon giỏ hàng tăng số lượng (badge)<br>- Sản phẩm xuất hiện trong giỏ | | | | | | |
| TC_ACC_019 | Thêm sản phẩm từ trang chi tiết | HIGH | - Đã đăng nhập | 1. Vào trang chi tiết sản phẩm<br>2. Chọn số lượng = 3<br>3. Click "Thêm vào giỏ" | - Toast thành công<br>- Giỏ hàng có sản phẩm với số lượng = 3 | | | | | | |
| TC_ACC_020 | Thêm cùng sản phẩm 2 lần | MEDIUM | - Đã có sản phẩm A (số lượng 2) trong giỏ | 1. Thêm lại sản phẩm A (số lượng 1) | - Số lượng sản phẩm A = 2 + 1 = 3<br>- Không tạo item mới trong giỏ | | | | | | |

#### User Story US-008: Người dùng quản lý giỏ hàng

| Test ID | Test Scenario | Priority | Pre-condition | Test Steps | Expected Result | Actual Result | Status | Bug ID | Notes | Tester | Date |
|---------|---------------|----------|---------------|------------|-----------------|---------------|--------|--------|-------|--------|------|
| TC_ACC_021 | Xem giỏ hàng | HIGH | - Giỏ có 2 sản phẩm | 1. Click icon giỏ hàng | - Chuyển sang trang /cart<br>- Hiển thị danh sách sản phẩm<br>- Mỗi item: Ảnh, Tên, Giá, Số lượng, Tổng, Nút xóa<br>- Hiển thị Tổng tiền | | | | | | |
| TC_ACC_022 | Cập nhật số lượng trong giỏ | HIGH | - Giỏ có sản phẩm A (số lượng 2) | 1. Vào trang giỏ hàng<br>2. Tăng số lượng sản phẩm A lên 5 | - Số lượng = 5<br>- Tổng tiền sản phẩm = Giá × 5<br>- Tổng giỏ hàng cập nhật | | | | | | |
| TC_ACC_023 | Xóa sản phẩm khỏi giỏ | HIGH | - Giỏ có 2 sản phẩm | 1. Click nút "X" ở sản phẩm thứ nhất | - Sản phẩm biến mất<br>- Tổng tiền giảm<br>- Giỏ còn 1 sản phẩm | | | | | | |
| TC_ACC_024 | Xóa sản phẩm cuối cùng | MEDIUM | - Giỏ có 1 sản phẩm | 1. Xóa sản phẩm đó | - Giỏ trống<br>- Hiển thị "Giỏ hàng trống"<br>- Nút "Thanh toán" disabled hoặc ẩn | | | | | | |

#### User Story US-009: Người dùng thanh toán đơn hàng

| Test ID | Test Scenario | Priority | Pre-condition | Test Steps | Expected Result | Actual Result | Status | Bug ID | Notes | Tester | Date |
|---------|---------------|----------|---------------|------------|-----------------|---------------|--------|--------|-------|--------|------|
| TC_ACC_025 | Thanh toán COD thành công | HIGH | - Giỏ có ít nhất 1 sản phẩm<br>- Đã đăng nhập | 1. Vào giỏ hàng<br>2. Click "Thanh toán"<br>3. Điền thông tin giao hàng:<br>   - Họ: "Nguyễn"<br>   - Tên: "Văn A"<br>   - Địa chỉ: "123 Lê Lợi"<br>   - Thành phố: "TP.HCM"<br>   - SĐT: "0901234567"<br>4. Chọn "Thanh toán khi nhận hàng (COD)"<br>5. Click "Đặt hàng" | - Toast "Đặt hàng thành công"<br>- Chuyển sang trang /orders<br>- Đơn hàng xuất hiện với status "Pending"<br>- Giỏ hàng trống | | | | | | |
| TC_ACC_026 | Thanh toán thiếu thông tin giao hàng | MEDIUM | - Giỏ có sản phẩm | 1. Click "Thanh toán"<br>2. Bỏ trống "Địa chỉ"<br>3. Click "Đặt hàng" | - Hiển thị lỗi "Vui lòng nhập địa chỉ"<br>- Không tạo đơn hàng | | | | | | |
| TC_ACC_027 | Thanh toán với giỏ hàng trống | LOW | - Giỏ hàng trống | 1. Vào /order trực tiếp (nếu được) | - Redirect về trang chủ hoặc giỏ hàng<br>- Hiển thị thông báo "Giỏ hàng trống" | | | | | | |

#### User Story US-010: Người dùng xem lịch sử đơn hàng

| Test ID | Test Scenario | Priority | Pre-condition | Test Steps | Expected Result | Actual Result | Status | Bug ID | Notes | Tester | Date |
|---------|---------------|----------|---------------|------------|-----------------|---------------|--------|--------|-------|--------|------|
| TC_ACC_028 | Xem danh sách đơn hàng | HIGH | - Đã đăng nhập<br>- Đã có 2 đơn hàng | 1. Click menu "Đơn hàng"<br>2. Hoặc vào URL /orders | - Hiển thị danh sách đơn hàng<br>- Mỗi đơn: Mã đơn, Ngày, Trạng thái, Tổng tiền<br>- Sắp xếp mới nhất trước | | | | | | |
| TC_ACC_029 | Xem chi tiết 1 đơn hàng | MEDIUM | - Có đơn hàng | 1. Click vào 1 đơn hàng | - Hiển thị chi tiết:<br>  - Danh sách sản phẩm<br>  - Địa chỉ giao hàng<br>  - Trạng thái<br>  - Thời gian | | | | | | |

---

### EPIC 4: QUẢN TRỊ ADMIN (ADMIN PANEL)

#### User Story US-011: Admin đăng nhập vào admin panel

| Test ID | Test Scenario | Priority | Pre-condition | Test Steps | Expected Result | Actual Result | Status | Bug ID | Notes | Tester | Date |
|---------|---------------|----------|---------------|------------|-----------------|---------------|--------|--------|-------|--------|------|
| TC_ACC_030 | Admin đăng nhập thành công | HIGH | - Có tài khoản admin:<br>  email: "admin@cakefantasy.com"<br>  pass: "Admin123!" | 1. Truy cập http://localhost:5174<br>2. Nhập email admin<br>3. Nhập password<br>4. Click "Đăng nhập" | - Đăng nhập thành công<br>- Chuyển sang Dashboard<br>- Hiển thị Sidebar menu<br>- Header hiển thị tên admin | | | | | | |

#### User Story US-012: Admin thêm sản phẩm mới

| Test ID | Test Scenario | Priority | Pre-condition | Test Steps | Expected Result | Actual Result | Status | Bug ID | Notes | Tester | Date |
|---------|---------------|----------|---------------|------------|-----------------|---------------|--------|--------|-------|--------|------|
| TC_ACC_031 | Thêm sản phẩm với đầy đủ thông tin | HIGH | - Đã đăng nhập admin | 1. Click menu "Thêm mặt hàng"<br>2. Upload ảnh sản phẩm<br>3. Nhập Tên: "Bánh Test"<br>4. Nhập Mô tả<br>5. Chọn Danh mục: "Cake"<br>6. Nhập Giá vốn: 100000<br>7. Nhập Giá bán: 150000<br>8. Click "Thêm mặt hàng" | - Toast "Thêm mặt hàng thành công"<br>- Chuyển về trang List<br>- Sản phẩm "Bánh Test" xuất hiện trong danh sách | | | | | | |
| TC_ACC_032 | Thêm sản phẩm thiếu thông tin bắt buộc | MEDIUM | - Đã đăng nhập admin | 1. Click "Thêm mặt hàng"<br>2. Bỏ trống "Tên"<br>3. Nhập các field khác<br>4. Click "Thêm mặt hàng" | - Hiển thị lỗi "Vui lòng nhập Tên"<br>- Không tạo sản phẩm mới | | | | | | |

#### User Story US-013: Admin xem và cập nhật đơn hàng

| Test ID | Test Scenario | Priority | Pre-condition | Test Steps | Expected Result | Actual Result | Status | Bug ID | Notes | Tester | Date |
|---------|---------------|----------|---------------|------------|-----------------|---------------|--------|--------|-------|--------|------|
| TC_ACC_033 | Xem danh sách đơn hàng | HIGH | - Có ít nhất 3 đơn hàng trong DB | 1. Click menu "Đơn hàng" | - Hiển thị danh sách đơn hàng<br>- Mỗi đơn: Mã, Tên khách, SĐT, Địa chỉ, Sản phẩm, Tổng tiền, Trạng thái | | | | | | |
| TC_ACC_034 | Cập nhật trạng thái đơn hàng | HIGH | - Có đơn hàng status "Pending" | 1. Vào trang Orders<br>2. Chọn dropdown trạng thái của đơn hàng<br>3. Chọn "Processing" | - Trạng thái cập nhật ngay lập tức<br>- Toast "Cập nhật thành công"<br>- Database cập nhật | | | | | | |

---

## 📊 BÁO CÁO TỔNG HỢP

### Summary Statistics

| Metric | Value |
|--------|-------|
| **Tổng số Test Cases** | 34 |
| **Passed** | [Điền số] |
| **Failed** | [Điền số] |
| **Blocked** | [Điền số] |
| **Not Executed** | [Điền số] |
| **Pass Rate** | [%] |

### Status by Epic

| Epic | Total | Passed | Failed | Pass Rate |
|------|-------|--------|--------|-----------|
| User Management | 9 | | | |
| Product Browsing | 7 | | | |
| Cart & Checkout | 12 | | | |
| Admin Panel | 6 | | | |

### Priority Distribution

| Priority | Total | Passed | Failed |
|----------|-------|--------|--------|
| HIGH | 18 | | |
| MEDIUM | 12 | | |
| LOW | 4 | | |

---

## 🐛 DANH SÁCH BUGS PHÁT HIỆN

### Format báo cáo Bug

| Bug ID | Severity | Module | Summary | Steps to Reproduce | Expected | Actual | Screenshot | Status | Assigned To | Fixed Date |
|--------|----------|--------|---------|-------------------|----------|--------|------------|--------|-------------|------------|
| BUG-001 | HIGH | Search | Tìm kiếm không trả kết quả | 1. Vào trang chủ<br>2. Nhập "bánh kem"<br>3. Enter | Hiển thị danh sách | Màn hình trống | bug-001.png | OPEN | Dev A | |
| BUG-002 | MEDIUM | Cart | Không xóa được item | 1. Thêm sản phẩm vào giỏ<br>2. Click nút X | Item bị xóa | Không phản hồi | bug-002.png | OPEN | Dev B | |

### Severity Levels
- **CRITICAL:** Hệ thống crash, không thể sử dụng
- **HIGH:** Chức năng chính không hoạt động
- **MEDIUM:** Chức năng phụ lỗi, có workaround
- **LOW:** Lỗi UI/UX nhỏ, không ảnh hưởng nghiệp vụ

---

## ✅ SIGN-OFF

### Kết luận
- [ ] **PASSED** - Hệ thống đạt yêu cầu, có thể release
- [ ] **PASSED WITH MINOR ISSUES** - Có một số lỗi nhỏ, có thể release và fix sau
- [ ] **FAILED** - Có bugs nghiêm trọng, cần fix trước khi release

### Khuyến nghị
[Ghi các khuyến nghị về cải thiện, tối ưu, bugs cần fix...]

### Người ký duyệt

| Role | Name | Signature | Date |
|------|------|-----------|------|
| **Tester/QA** | | | |
| **QA Lead** | | | |
| **Product Owner** | | | |
| **Project Manager** | | | |

---

## 📎 PHỤ LỤC

### Môi trường test
- **Browser:** Chrome 120, Firefox 121
- **OS:** Windows 11
- **Screen Resolution:** 1920x1080
- **Network:** Wifi 100Mbps

### Test Data
- **User accounts:** [Liệt kê accounts test]
- **Products:** [Liệt kê sản phẩm test]
- **Orders:** [Liệt kê đơn hàng mẫu]

### Screenshots
[Đính kèm screenshots của các màn hình chính]

---

**Template version:** 1.0.0  
**Ngày tạo:** 10/12/2025  
**Người tạo:** GitHub Copilot
