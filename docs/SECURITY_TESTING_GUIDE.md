# 🛡️ Hướng Dẫn Kiểm Tra Bảo Mật Với OWASP ZAP

## 📌 OWASP ZAP là gì?

**OWASP ZAP** (Zed Attack Proxy) là công cụ kiểm tra bảo mật **miễn phí** và **mã nguồn mở**, được phát triển bởi OWASP (Open Web Application Security Project).

---

## 1️⃣ Cài Đặt OWASP ZAP

### Windows:
1. Truy cập: https://www.zaproxy.org/download/
2. Tải file **Windows Installer** (.exe)
3. Chạy installer và cài đặt như bình thường
4. Yêu cầu: **Java 11+** (ZAP sẽ tự cài nếu chưa có)

### Hoặc dùng Docker (không cần cài đặt):
```bash
docker pull ghcr.io/zaproxy/zaproxy:stable
docker run -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t http://localhost:3001
```

---

## 2️⃣ Cấu Hình Trước Khi Scan

### Bước 2.1: Khởi động ZAP
1. Mở OWASP ZAP
2. Chọn **"No, I do not want to persist this session"** (cho lần đầu)

### Bước 2.2: Cấu hình Target
1. Trong ô **URL to attack**, nhập: `http://localhost:3001`
2. Hoặc nếu test API: `http://localhost:3000`

### Bước 2.3: Tắt Rate Limiting (Khuyến nghị)
Để scan không bị chặn, tạm tắt rate limiting trong backend:

```typescript
// backend/src/app.module.ts - Tạm comment ThrottlerModule
// imports: [
//   ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
// ],
```

⚠️ **Nhớ bật lại sau khi test xong!**

---

## 3️⃣ Các Loại Scan

### 🟢 Automated Scan (Dễ nhất - Khuyến nghị cho người mới)

1. Click **"Automated Scan"** trên màn hình chính
2. Nhập URL: `http://localhost:3001`
3. Click **"Attack"**
4. Chờ 5-15 phút (tùy kích thước website)

### 🟡 Spider Scan (Tìm tất cả URLs)

1. Chuột phải vào URL trong **Sites** panel
2. Chọn **Attack → Spider**
3. ZAP sẽ crawl tất cả các link trên website

### 🔴 Active Scan (Tấn công thật sự)

1. Sau khi Spider xong, chuột phải vào site
2. Chọn **Attack → Active Scan**
3. ZAP sẽ thử các cuộc tấn công như:
   - SQL Injection
   - XSS (Cross-Site Scripting)
   - Path Traversal
   - Command Injection

---

## 4️⃣ Scan API Backend (Swagger Import)

### Bước 4.1: Export OpenAPI Spec
```bash
# Truy cập Swagger và copy JSON
http://localhost:3000/api/docs-json
```

### Bước 4.2: Import vào ZAP
1. Vào **Import → Import an OpenAPI definition from URL**
2. Nhập: `http://localhost:3000/api/docs-json`
3. Click **Import**

### Bước 4.3: Scan API
1. Chuột phải vào API endpoints trong Sites
2. Chọn **Active Scan**

---

## 5️⃣ Đọc Kết Quả

### Alerts Panel (Bảng cảnh báo)

ZAP phân loại theo mức độ nghiêm trọng:

| Màu | Mức độ | Ý nghĩa | Hành động |
|-----|--------|---------|-----------|
| 🔴 **High** | Nghiêm trọng | Có thể bị hack ngay | Sửa NGAY |
| 🟠 **Medium** | Trung bình | Có rủi ro | Sửa trước go-live |
| 🟡 **Low** | Thấp | Ít rủi ro | Sửa khi có thời gian |
| 🔵 **Informational** | Thông tin | Không phải lỗi | Tham khảo |

### Ví dụ Alert và cách sửa:

| Alert | Giải thích | Cách sửa |
|-------|------------|----------|
| **X-Frame-Options Header Not Set** | Có thể bị Clickjacking | ✅ Đã có trong Helmet |
| **Cookie Without HttpOnly Flag** | Cookie có thể bị đọc bởi JS | Thêm `httpOnly: true` |
| **SQL Injection** | Input không được sanitize | Dùng Prisma (đã an toàn) |
| **Cross-Site Scripting (XSS)** | HTML không được escape | ✅ Đã có DOMPurify |

---

## 6️⃣ Xuất Báo Cáo

1. Vào **Report → Generate Report**
2. Chọn format:
   - **HTML** - Dễ đọc, có thể gửi cho team
   - **XML/JSON** - Cho automation
   - **PDF** - Cho stakeholders

3. Lưu file và review

---

## 7️⃣ Checklist Scan Cho Laba Platform

### Frontend (http://localhost:3001)
- [ ] Automated Scan trang chủ
- [ ] Spider crawl tất cả pages
- [ ] Active Scan các form (login, contact)
- [ ] Kiểm tra XSS trong blog content

### Backend API (http://localhost:3000)
- [ ] Import OpenAPI spec
- [ ] Scan `/api/v1/auth/login` (SQL Injection, Brute-force)
- [ ] Scan `/api/v1/auth/refresh` (Token security)
- [ ] Scan `/api/v1/cms/posts` (XSS trong content)
- [ ] Scan `/api/v1/admin/*` (Authorization bypass)

---

## 8️⃣ Các Lỗi Thường Gặp

### ❌ ZAP không thể kết nối
```
Nguyên nhân: Server chưa chạy
Giải pháp: Đảm bảo `npm run start:dev` và `npm run dev` đang chạy
```

### ❌ Scan quá chậm
```
Nguyên nhân: Rate limiting
Giải pháp: Tạm tắt ThrottlerModule khi test
```

### ❌ Không scan được API
```
Nguyên nhân: Cần authentication
Giải pháp: Dùng ZAP Authentication context hoặc thêm Bearer token
```

---

## 9️⃣ Scan Với Authentication

### Bước 9.1: Lấy Token
1. Login qua UI hoặc Postman
2. Copy `access_token`

### Bước 9.2: Thêm vào ZAP
1. Vào **Scripts → Authentication**
2. Hoặc: **Headers → Add Custom Header**
   - Name: `Authorization`
   - Value: `Bearer <your_token>`

---

## 🎯 Kết Quả Mong Đợi Cho Laba Platform

Với các biện pháp bảo mật đã triển khai, bạn nên thấy:

| Loại | Số lượng mong đợi |
|------|-------------------|
| 🔴 High | 0 |
| 🟠 Medium | 0-2 (có thể là false positive) |
| 🟡 Low | 3-5 (thường là recommendations) |
| 🔵 Info | 5-10 (thông tin, không cần lo) |

---

## 📞 Cần Hỗ Trợ?

Nếu phát hiện lỗi High hoặc Medium, hãy:
1. Screenshot kết quả
2. Đọc phần **Solution** trong ZAP
3. Tìm kiếm Google/StackOverflow với tên lỗi
4. Hoặc hỏi lại developer

---

*Tài liệu này được tạo cho Laba Platform Phase 1*
*Cập nhật: 2025-12-05*
