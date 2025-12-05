# 🚀 Laba Platform - Phase 1 Onboarding Guide

Chào mừng bạn đến với dự án Laba Platform! Tài liệu này sẽ giúp bạn thiết lập môi trường phát triển và chạy dự án một cách nhanh chóng.

## 1. Yêu cầu hệ thống (Prerequisites)

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt:

- **Node.js**: v18+ (Khuyên dùng v20 LTS)
- **PostgreSQL**: v14+
- **Redis**: v6+ (Dùng cho Rate Limiting & Queue)
- **Git**: Phiên bản mới nhất

## 2. Cấu trúc dự án

Dự án được chia thành 2 phần chính (Monorepo style):

```
laba-platform-phase1/
├── backend/            # NestJS API Server
│   ├── src/            # Source code
│   ├── prisma/         # Database Schema & Seed
│   └── test/           # E2E Tests
├── frontend/           # Next.js App Router
│   ├── src/app/        # Pages & Routes
│   └── src/components/ # UI Components
└── docs/               # Tài liệu dự án
```

## 3. Backend Setup

### Bước 3.1: Cài đặt dependencies
```bash
cd backend
npm install
```

### Bước 3.2: Cấu hình môi trường
Copy file `.env.example` thành `.env`:
```bash
cp .env.example .env
```
Cập nhật các biến môi trường quan trọng trong `.env`:
- `DATABASE_URL`: Chuỗi kết nối PostgreSQL.
- `REDIS_HOST`, `REDIS_PORT`: Cấu hình Redis.
- `JWT_SECRET`, `JWT_REFRESH_SECRET`: Secret key cho Auth.

### Bước 3.3: Database Migration & Seed
Chạy migration để tạo bảng và seed dữ liệu mẫu:
```bash
# Tạo bảng
npx prisma migrate dev

# Seed dữ liệu mẫu (Admin, Roles, Posts...)
npm run prisma:seed
```

### Bước 3.4: Chạy Server
```bash
# Development mode
npm run start:dev
```
Backend sẽ chạy tại: `http://localhost:3000`
Swagger API Docs: `http://localhost:3000/api/docs`

## 4. Frontend Setup

### Bước 4.1: Cài đặt dependencies
```bash
cd frontend
npm install
```

### Bước 4.2: Cấu hình môi trường
Copy file `.env.example` thành `.env.local`:
```bash
cp .env.example .env.local
```
Đảm bảo `NEXT_PUBLIC_API_URL` trỏ về backend (mặc định `http://localhost:3000/api/v1`).

### Bước 4.3: Chạy Server
```bash
npm run dev
```
Frontend sẽ chạy tại: `http://localhost:3001` (hoặc port khác nếu 3000 bận).

## 5. Tài khoản Demo mặc định

Sau khi chạy seed, bạn có thể đăng nhập với tài khoản Admin:

- **URL**: `/login`
- **Email**: `admin@laba.vn`
- **Password**: `Admin@123456`

## 6. Các lệnh thường dùng

- **Backend Test**: `npm run test` (Unit), `npm run test:e2e` (E2E).
- **Frontend Lint**: `npm run lint`.
- **Prisma Studio**: `npx prisma studio` (Xem DB qua giao diện web).

---
Chúc bạn code vui vẻ! 🎉
