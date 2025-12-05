# 🎬 Kịch bản Demo Phase 1 - Laba Platform

**Mục tiêu**: Trình diễn các tính năng cốt lõi đã hoàn thành trong Phase 1, tập trung vào trải nghiệm người dùng (Public) và quản trị (Admin).

**Thời lượng dự kiến**: 10-15 phút.

---

## 1. Mở đầu (1 phút)
- **Giới thiệu**: Chào mừng đến với buổi demo Laba Platform Phase 1.
- **Mục tiêu Phase 1**: Xây dựng nền tảng CMS cơ bản, quản lý chi nhánh, và Blog hệ thống.
- **Công nghệ**: NestJS (Backend), Next.js (Frontend), PostgreSQL, Redis.

## 2. Demo Public Site (3 phút)
**Truy cập**: `http://localhost:3001`

1.  **Trang chủ (Home)**:
    - Lướt qua Hero Section, giới thiệu ngắn gọn.
    - Show các section: Về chúng tôi, Chi nhánh.
2.  **Blog List (`/blog`)**:
    - Show giao diện mới "Triệu đô".
    - Chỉ vào bài Featured Post (bài to nhất).
    - Scroll xem danh sách bài viết dạng lưới.
3.  **Blog Detail**:
    - Click vào bài "Một ngày làm nông dân...".
    - Show Typography dễ đọc, ảnh minh họa đẹp.
    - Show phần Tác giả và Breadcrumb.

## 3. Demo Admin CMS (7 phút)
**Truy cập**: `/login`

1.  **Đăng nhập**:
    - Nhập `admin@laba.vn` / `Admin@123456`.
    - Show thông báo đăng nhập thành công.
    - **Lưu ý**: Nếu nhập sai 5 lần sẽ bị khóa (Rate Limiting).
2.  **Dashboard**:
    - Show các thẻ thống kê (Stats Cards) có animation.
    - Show biểu đồ (nếu có) hoặc danh sách hoạt động gần đây.
3.  **Quản lý Bài viết (Posts)**:
    - Vào menu "Posts".
    - **Tạo bài viết mới**:
        - Nhập Title: "Demo Live Phase 1".
        - Nhập Slug (auto-generate).
        - Chọn Type: `BLOG`.
        - Nhập nội dung mẫu vào Editor.
        - Upload ảnh thumbnail (hoặc nhập URL).
        - Lưu Draft -> Show thông báo thành công.
    - **Xuất bản**:
        - Chuyển trạng thái sang `Published`.
        - Quay lại trang Public Blog để verify bài mới đã hiện.
4.  **Quản lý Chi nhánh (Branches)**:
    - Show danh sách các chi nhánh (Farm, Homestay, Cafe).
    - Thử edit một chi nhánh (ví dụ: đổi số điện thoại).

## 4. Demo Kỹ thuật (Optional - 3 phút)
- **Swagger API**: Mở `http://localhost:3000/api/docs`.
    - Thử gọi API `GET /posts` trực tiếp trên Swagger.
- **Rate Limiting**:
    - Thử spam F5 hoặc login sai liên tục để show cơ chế bảo vệ (nếu cần).

## 5. Kết thúc & Q&A
- Tổng kết các tính năng đã đạt được.
- Nhắc đến kế hoạch Phase 1.5 (Booking, Payment).
- Hỏi ý kiến phản hồi.

---
**Chuẩn bị trước Demo**:
1. Chạy `npm run prisma:seed` để reset dữ liệu đẹp.
2. Đảm bảo Backend & Frontend đang chạy ổn định.
3. Mở sẵn các tab trình duyệt cần thiết.
