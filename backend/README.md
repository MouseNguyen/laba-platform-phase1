# Laba Platform - Backend (Phase 1)

Backend service for Laba Platform, built with NestJS, Prisma, and PostgreSQL.

## Features

- **Authentication**: JWT-based auth with Refresh Token Rotation, Device Fingerprinting, and Session Management.
- **Authorization**: RBAC (Role-Based Access Control) with granular Permissions.
- **CMS**: Content Management System for Blogs, News, and Pages.
- **Branch Management**: Manage farm branches/locations.
- **Monitoring**: Prometheus Metrics and Health Checks.
- **Security**: Helmet, CORS, Security Logging.

## Prerequisites

- Node.js (v18+)
- Docker & Docker Compose
- PostgreSQL (via Docker)
- Redis (via Docker)

## Setup & Installation

1.  **Clone the repository**
    ```bash
    git clone <repo-url>
    cd laba-platform-phase1/backend
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Copy `.env.example` to `.env` and update variables:
    ```bash
    cp .env.example .env
    ```
    *Ensure `DATABASE_URL` and `REDIS_URL` match your Docker configuration.*

4.  **Start Infrastructure (DB & Redis)**
    ```bash
    docker-compose up -d
    ```

5.  **Database Migration & Seeding**
    ```bash
    # Run migrations
    npx prisma migrate dev

    # Seed initial data (Admin user, Roles, Permissions)
    npm run seed
    ```
    *Default Admin: `admin@laba.vn` / `Admin@123`*

6.  **Start Development Server**
    ```bash
    npm run start:dev
    ```
    Server will start at `http://localhost:3000`.

## API Documentation

- **Swagger UI**: Access `http://localhost:3000/api/docs` for interactive API documentation.
- **Health Check**: `GET /api/v1/health`
- **Metrics**: `GET /metrics` (Protected)

## Testing

- **Unit Tests**:
    ```bash
    npm run test
    ```
- **E2E Tests**:
    ```bash
    npm run test:e2e
    ```

## Project Structure

- `src/auth`: Authentication logic (Guards, Strategies, Services).
- `src/cms`: Content Management (Posts, Uploads).
- `src/users`: User management.
- `src/branches`: Branch management.
- `src/prisma`: Database connection & schema.
- `src/monitoring`: Metrics & Health checks.

## License

Private - Laba Platform Team.
