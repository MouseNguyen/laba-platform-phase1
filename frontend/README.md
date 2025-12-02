# Laba Platform – Frontend (Phase 1)

Next.js App Router frontend cho Laba Platform.

## 🚀 Quick Start

```bash
# 1. Copy environment file
cp .env.local.example .env.local

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev
```

Frontend sẽ chạy tại: http://localhost:3001

## 📁 Cấu trúc thư mục

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing page (placeholder)
│   │   └── login/
│   │       └── page.tsx        # Login page (placeholder)
│   ├── context/
│   │   └── AuthContext.tsx     # Auth context (TODO: FE3)
│   ├── lib/
│   │   ├── apiClient.ts        # Axios instance
│   │   └── types.ts            # TypeScript types
│   └── styles/
│       └── globals.css         # Global styles
├── public/                     # Static files
├── .env.local.example          # Environment template
├── next.config.mjs             # Next.js config
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | `http://localhost:3000` |

## 📋 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Chạy development server (port 3001) |
| `npm run build` | Build production |
| `npm run start` | Chạy production server |
| `npm run lint` | Chạy ESLint |

## 🎯 Phase 1 Status

### ✅ FE1 - Khung cơ bản
- [x] Next.js project setup
- [x] TypeScript configuration
- [x] Axios API client
- [x] Type definitions
- [x] Landing placeholder
- [x] Login placeholder
- [x] AuthContext placeholder

### ✅ FE2 - Landing Page
- [x] Fetch landing content từ API `/landing`
- [x] Render các blocks (hero, farm, homestay, cafe, about)
- [x] Navigation bar với anchor links
- [x] Responsive layout
- [x] Error handling khi API không khả dụng
- [x] Image optimization với Next.js Image

### ✅ FE3 - Authentication (Current)
- [x] Login form với email/password
- [x] AuthContext implementation
- [x] Token storage trong memory
- [x] Auto refresh token interceptor
- [x] Handle 401 → refresh → retry
- [x] Handle 403 SESSION_COMPROMISED
- [x] Header với user info và logout
- [x] Session restore on page refresh

## 🔗 Backend API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/landing` | Lấy landing content |
| POST | `/auth/login` | Đăng nhập |
| GET | `/auth/me` | Lấy thông tin user |
| POST | `/auth/refresh` | Làm mới access token |
| POST | `/auth/logout` | Đăng xuất |
| POST | `/auth/revoke-all` | Thu hồi tất cả sessions |

## 📝 Notes

- Backend phải chạy trước ở port 3000
- CORS đã được cấu hình cho http://localhost:3001
- Refresh token được lưu trong HttpOnly cookie
- Access token sẽ được lưu trong memory (React state)
