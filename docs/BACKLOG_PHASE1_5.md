# 📅 Backlog Phase 1.5 & Phase 2

Tài liệu này ghi lại các tính năng, cải tiến kỹ thuật và ý tưởng cho giai đoạn phát triển tiếp theo của Laba Platform.

## Phase 1.5: Booking Foundation (Dự kiến: 2 tuần)

### 1. Booking Engine Core
- [ ] **Schema Design**: Thiết kế bảng `Booking`, `BookingItem`, `Availability`.
- [ ] **API Check Availability**: API kiểm tra phòng/tour trống theo ngày.
- [ ] **Booking Flow**:
    - Step 1: Chọn ngày & Số lượng.
    - Step 2: Nhập thông tin khách hàng.
    - Step 3: Xác nhận & Giữ chỗ (Temporary Hold).

### 2. Email & Notification
- [ ] **Email Service**: Tích hợp SendGrid hoặc AWS SES.
- [ ] **Templates**:
    - Email xác nhận đăng ký tài khoản.
    - Email xác nhận đặt chỗ (Booking Confirmation).
    - Email quên mật khẩu.

### 3. Media Management (Advanced)
- [ ] **Image Upload**: Tích hợp AWS S3 hoặc Cloudinary thay vì lưu URL text.
- [ ] **Image Optimization**: Resize và nén ảnh tự động.

## Phase 2: Payment & Membership (Dự kiến: 4 tuần)

### 1. Payment Gateway
- [ ] **Tích hợp VNPay/Momo**: Cho phép thanh toán online.
- [ ] **Payment Reconciliation**: Đối soát giao dịch.

### 2. Membership & Loyalty
- [ ] **User Profile**: Trang cá nhân cho user (Lịch sử đặt chỗ, thông tin).
- [ ] **Points System**: Tích điểm khi đặt dịch vụ.
- [ ] **Membership Tiers**: Hạng thành viên (Silver, Gold, Diamond).

### 3. Advanced CMS
- [ ] **Rich Text Editor Upgrade**: Dùng Editor.js hoặc Tiptap với nhiều block hơn (Video, Embed).
- [ ] **SEO Tools**: Preview SEO, edit meta tags trực quan.
- [ ] **Analytics Dashboard**: Thống kê view bài viết, doanh thu booking.

## Technical Debt & Improvements
- [ ] **CI/CD Pipeline**: Thiết lập GitHub Actions để auto deploy.
- [ ] **Dockerize**: Đóng gói Backend/Frontend vào Docker container.
- [ ] **Logging & Monitoring**: Tích hợp Sentry, Prometheus + Grafana (đã có base, cần hoàn thiện dashboard).
- [ ] **Unit Tests**: Tăng độ phủ test (Coverage > 80%).

---
*Last updated: 2025-12-06*
