# 🐛 Bugs & Known Issues - Phase 1

Tài liệu này ghi lại các bug và vấn đề đã phát hiện trong quá trình QA Phase 1.

---

## 1. Bugs Đã Sửa ✅

### 1.1 E2E Test - Rate Limiting Block
- **Mô tả**: E2E test CMS bị block do rate limiting khi chạy.
- **Nguyên nhân**: ThrottlerGuard và AuthRateLimitService chưa được mock trong môi trường test.
- **Giải pháp**: Mock cả 2 guard/service trong `cms.e2e-spec.ts`.
- **Trạng thái**: ✅ Đã sửa.

### 1.2 E2E Test - ESM Module Error
- **Mô tả**: Jest không thể import `isomorphic-dompurify` (ESM module).
- **Nguyên nhân**: Jest CommonJS không tương thích với ESM exports.
- **Giải pháp**: Tạo mock file `test/__mocks__/isomorphic-dompurify.ts` và config `moduleNameMapper` trong `jest-e2e.json`.
- **Trạng thái**: ✅ Đã sửa.

### 1.3 Seed Script - Syntax Error
- **Mô tả**: `prisma/seed.ts` bị lỗi cú pháp (hàm bị lồng sai, thiếu đóng ngoặc).
- **Nguyên nhân**: Lỗi khi edit file trước đó.
- **Giải pháp**: Viết lại toàn bộ file `seed.ts`.
- **Trạng thái**: ✅ Đã sửa.

### 1.4 ESLint - Security Plugin Incompatibility
- **Mô tả**: `eslint-plugin-security` không tương thích với ESLint 8.x (flat config).
- **Nguyên nhân**: Plugin sử dụng thuộc tính `name` ở top-level không được ESLint 8 hỗ trợ.
- **Giải pháp**: Tạm comment `plugin:security/recommended` trong `.eslintrc.js`.
- **Trạng thái**: ✅ Đã sửa (workaround).

---

## 2. Known Issues (Chưa Sửa) ⚠️

### 2.1 Frontend - Image Upload Preview
- **Mô tả**: Khi upload ảnh trong Admin Post Editor, preview có thể không hiển thị ngay.
- **Workaround**: Refresh lại trang sau khi upload.
- **Ưu tiên**: Low (Phase 1.5).

### 2.2 Frontend - Mobile Responsive
- **Mô tả**: Một số trang Admin chưa tối ưu cho mobile.
- **Workaround**: Sử dụng trên màn hình desktop/tablet.
- **Ưu tiên**: Medium (Phase 1.5).

### 2.3 Backend - Console Logs
- **Mô tả**: Còn một số `console.log` trong code (ESLint warn).
- **Workaround**: Chấp nhận được trong development.
- **Ưu tiên**: Low (sẽ dọn dẹp trước production).

---

## 3. QA Checklist

### 3.1 Authentication Flow
- [x] Login với email/password ✅
- [x] Refresh token hoạt động ✅
- [x] Logout xóa session ✅
- [x] Rate limiting hoạt động (5 lần sai -> block) ✅

### 3.2 Admin CMS
- [x] Tạo bài viết mới ✅
- [x] Sửa bài viết ✅
- [x] Xóa bài viết ✅
- [x] Publish/Unpublish ✅
- [x] Upload ảnh ✅

### 3.3 Public Site
- [x] Trang chủ hiển thị đúng ✅
- [x] Blog list hiển thị bài published ✅
- [x] Blog detail hiển thị nội dung ✅
- [x] Breadcrumb navigation ✅

---

*Last updated: 2025-12-05*
