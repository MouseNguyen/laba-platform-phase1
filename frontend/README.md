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
│   │   ├── (admin)/            # Admin Portal (Protected)
│   │   │   ├── dashboard/
│   │   │   ├── users/
│   │   │   ├── posts/
│   │   │   └── branches/
│   │   ├── (public)/           # Public Website
│   │   │   ├── blog/
│   │   │   ├── about/
│   │   │   └── page.tsx        # Landing page
│   │   └── login/
│   ├── components/             # Reusable Components
│   ├── context/
│   │   └── AuthContext.tsx     # Authentication Logic
│   ├── lib/
│   │   ├── api/                # API Modules
│   │   ├── apiClient.ts        # Axios Instance
│   │   └── types.ts            # TypeScript Interfaces
│   └── styles/
└── public/
```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | `http://localhost:3000` |

## 🎯 Phase 1 Features

### 1. Public Website
- **Landing Page**: Dynamic content blocks (Hero, Farm, Homestay, Cafe).
- **Blog**: List & Detail pages for news and articles.
- **About**: Company information.
- **Contact**: Contact form (UI).

### 2. Authentication
- **Login**: Email/Password with Rate Limiting protection.
- **Security**:
    - JWT Access Token (Memory).
    - Refresh Token (HttpOnly Cookie).
    - Auto Refresh Token Rotation.
    - Session Management (Revoke All).

### 3. Admin Portal
- **Dashboard**: Overview.
- **User Management**: List, Create, Edit, Delete users.
- **Post Management**: CMS for Blogs/News with Rich Text & Image Upload.
- **Branch Management**: Manage farm locations.

## 🔗 Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/landing` | Public Landing Content |
| GET | `/api/v1/posts` | Public Blog Posts |
| POST | `/api/v1/auth/login` | Login |
| GET | `/api/v1/cms/posts` | Admin Post Management |
| POST | `/api/v1/cms/uploads/image` | Image Upload |

## 📝 Notes

- Backend phải chạy trước ở port 3000.
- CORS đã được cấu hình cho http://localhost:3001.
