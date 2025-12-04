# Laba Platform Backend

[![Node.js 20+](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org/)
[![NestJS 10](https://img.shields.io/badge/NestJS-10.x-E0234E)](https://nestjs.com/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![PostgreSQL 15](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org/)
[![Redis 7](https://img.shields.io/badge/Redis-7-red)](https://redis.io/)
[![Prisma 5](https://img.shields.io/badge/Prisma-5.x-black)](https://prisma.io/)

Modular Monolith API for multi-branch management (Farm, Homestay, Cafe) with Auth, CMS, Booking, and POS capabilities.

**⚡ Quick Start** (For Impatient Developers):
```bash
git clone <repo>
cd backend
npm install && docker compose -f docker-compose.dev.yml up -d && npm run db:reset && npm run start:dev
# server runs at http://localhost:3000
```

## 🎯 Core Features
- ✅ JWT Authentication with Refresh Token Rotation & Reuse Detection
- ✅ RBAC (Role-Based Access Control) with System + Branch-level permissions
- ✅ Multi-tenant (Multi-Branch) Architecture with soft-delete
- ✅ Prometheus Metrics & Grafana Dashboard
- ✅ Prisma ORM with PostgreSQL JSONB support
- ✅ Redis-backed Rate Limiting (Fail-Open) & Distributed Lock
- ✅ Contract Testing with Pact
- ✅ Load Testing with k6

## ⚠️ Prerequisites (Version-Locked)
**DO NOT use lower versions**:
- Node.js `>= 20.0.0` (LTS recommended)
- npm `>= 10.0.0` (comes with Node 20)
- Docker Engine `>= 24.0.0` + Docker Compose `>= 2.20.0`
- Git (with Unix line endings support)

**Verify versions**:
```bash
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
docker --version # Should show 24.x.x
```

## 🔐 Environment Configuration (CRITICAL)

### Step 1: Create `.env` file
```bash
cd backend
cp .env.example .env
# NEVER commit .env to git (already in .gitignore)
```

### Step 2: Generate Secrets (MANDATORY)
```bash
npm run generate-secrets
# This command populates JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, COOKIE_SECRET
# with cryptographically secure random strings
# ⚠️ MANUALLY creating secrets will cause security vulnerabilities
```

### Step 3: Configure Database (Optional - Dev mode has defaults)
Edit `.env`:
```env
# Development PostgreSQL (matches docker-compose.dev.yml)
DATABASE_URL="postgresql://laba_user:password@localhost:5432/laba_platform_dev?connection_limit=20"

# Redis for Rate Limiting & Locking
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Enable Redis Rate Limit (set to false if Redis not running)
ENABLE_REDIS_RATE_LIMIT=true

# CORS - Add your frontend URL
CORS_ORIGIN=http://localhost:3001

# Webhook for Security Alerts (Optional)
ALERT_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Step 4: Verify Environment
```bash
npm run env:verify  # Runs Joi validation on .env
# Must see "✅ Environment validation passed"
```

## 🚀 Installation & Database Setup (Exact Commands)

### **Option A: One-Liner (Recommended)**
```bash
npm install && docker compose -f docker-compose.dev.yml up -d && npm run db:reset
```

### **Option B: Step-by-Step**
```bash
# 1. Install dependencies
npm install
# This installs NestJS, Prisma, and all devDependencies

# 2. Start Infrastructure Services
docker compose -f docker-compose.dev.yml up -d
# Spins up: Postgres (5432), Redis (6379), Mailhog (8025)
# Check status: docker compose -f docker-compose.dev.yml ps

# 3. Initialize Database
npm run db:reset
# ⚠️ This DROPS and recreates the database
# Runs: prisma migrate reset (with --force for CI environments)
# Seeds: admin@laba.vn / Admin@123456, Branch MAIN, 5 landing blocks

# 4. Generate Prisma Client (if not auto-generated)
npx prisma generate
# Check: src/generated/prisma/ should have client files
```

### **Option C: Using Existing PostgreSQL**
If you have PostgreSQL running locally:
```bash
# 1. Create database manually
createdb laba_platform_dev -U youruser

# 2. Set DATABASE_URL in .env
DATABASE_URL="postgresql://youruser:yourpass@localhost:5432/laba_platform_dev"

# 3. Run migration (no docker)
npx prisma migrate reset --force

# 4. Start without Redis (set ENABLE_REDIS_RATE_LIMIT=false in .env)
npm run start:dev
```

## 🏃 Running the Application (All Modes)

### **Development Mode (Watch Mode)**
```bash
npm run start:dev
# Alias: npm run dev
# Watches for file changes, auto-restart
# Debug: Attach to process using VSCode "Attach to NestJS" configuration
```

### **Debug Mode (with Inspector)**
```bash
npm run start:debug
# Runs: nest start --debug --watch
# Open chrome://inspect to attach debugger
```

### **Production Build & Run**
```bash
# 1. Build
npm run build
# Output: dist/ folder (TypeScript → JavaScript)

# 2. Run production
npm run start:prod
# Runs: node dist/main
# Requires NODE_ENV=production and proper production .env
```

### **Health Check**
```bash
curl http://localhost:3000/health
# Expected: {"status":"ok","timestamp":"2024-01-15T10:00:00Z"}
```

## 🧪 Testing Commands (Comprehensive)

```bash
# Unit Tests (Jest)
npm run test
# Coverage report: coverage/lcov-report/index.html

# E2E Tests (Supertest + Jest)
npm run test:e2e
# ⚠️ Requires docker services running

# Lint & Format
npm run lint          # Check only
npm run lint:fix      # Auto-fix
npm run format        # Format code
npm run validate      # Run all checks (lint + format + type-check)

# Type Check
npm run type-check    # Runs tsc --noEmit

# Load Testing (k6)
npm run k6:test auth-flow
# Runs test/load/auth-flow.js - simulates 100 concurrent users

# Contract Testing (Pact)
npm run pact:verify
# Verifies provider against consumer contracts
```

## 📦 Project Structure (With Purpose)

```
backend/
├── src/
│   ├── app.module.ts          # Root module - imports all feature modules
│   ├── main.ts                # Bootstrap: Helmet, Swagger, ValidationPipe
│   ├── auth/                  # CORE: JWT, Guards, Strategies, DTOs
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts    # Token rotation, reuse detection logic
│   │   ├── guards/
│   │   └── strategies/
│   ├── users/                 # CORE: User CRUD (self-service)
│   │   ├── users.service.ts
│   │   └── users.controller.ts
│   ├── users-admin/           # PLUGIN: Admin user management (lock/unlock/roles)
│   │   └── users-admin.controller.ts
│   ├── cms/                   # PLUGIN: Content Management (Posts/Pages)
│   │   ├── posts.service.ts
│   │   └── posts.controller.ts
│   ├── branches/              # PLUGIN: Multi-tenant management
│   │   ├── branches.service.ts
│   │   └── branches.controller.ts
│   ├── prisma/
│   │   ├── prisma.service.ts  # Singleton PrismaClient
│   │   └── generated/         # Auto-generated by Prisma (NEVER edit manually)
│   ├── config/
│   │   └── joi.config.ts      # Environment validation schema
│   └── monitoring/
│       └── metrics.service.ts # Prometheus custom metrics
├── prisma/
│   ├── schema.prisma          # Single source of truth for DB
│   ├── migrations/            # Version-controlled migrations (NEVER edit)
│   └── seed.ts                # Initial admin, branch, landing data
├── test/                      # E2E tests
├── docker-compose.dev.yml     # Dev infrastructure (Postgres, Redis, Mailhog)
├── .eslintrc.js               # Linting rules (strict mode)
├── .prettierrc                # Code formatting
├── .env.example               # Template for .env
└── README.md                  # This file
```

## 🔍 API Documentation & Exploration

### **Swagger (Interactive API Docs)**
- **URL**: `http://localhost:3000/api/docs`
- **Login**: Click "Authorize" button → Enter `Bearer <your-access-token>`
- **Default Token**: Login via `POST /api/v1/auth/login` and copy token

### **Default Admin Credentials** (From Seed)
- **Email**: `admin@laba.vn`
- **Password**: `Admin@123456`
- **Role**: `SUPER_ADMIN` (has all permissions)

### **Quick API Test (cURL)**
```bash
# 1. Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@laba.vn","password":"Admin@123456"}'
# Response: { "access_token": "...", "refresh_token": "..." }

# 2. Get User Info
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 3. Create a Branch (Admin only)
curl -X POST http://localhost:3000/api/v1/branches \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code":"FARM_02","name":"Farm 2","type":"FARM"}'
```

### **Prometheus Metrics**
- **URL**: `http://localhost:3000/metrics`
- **Auth**: Basic Auth (user: `metrics`, pass: from `METRICS_PASS` in .env)
- **Metrics**: `laba_http_requests_total`, `laba_auth_events_total`

## 🐳 Docker Services (Detailed)

**File**: `docker-compose.dev.yml`
```yaml
services:
  postgres:
    image: postgres:15-alpine
    container_name: laba-postgres
    environment:
      POSTGRES_DB: laba_platform_dev
      POSTGRES_USER: laba_user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: laba-redis
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes

  mailhog:
    image: mailhog/mailhog
    container_name: laba-mailhog
    ports:
      - "8025:8025" # Web UI
      - "1025:1025" # SMTP port

volumes:
  postgres_data:
```

**Commands**:
```bash
# Start all services
docker compose -f docker-compose.dev.yml up -d

# View logs
docker logs -f laba-postgres
docker logs -f laba-redis

# Stop and clean up
docker compose -f docker-compose.dev.yml down
# Add -v to remove volumes: docker compose down -v

# Access PostgreSQL CLI
docker exec -it laba-postgres psql -U laba_user -d laba_platform_dev

# Access Redis CLI
docker exec -it laba-redis redis-cli
```

## 🛠️ Troubleshooting (Common Issues)

| Problem | Cause | Solution |
|---------|-------|----------|
| `PrismaClientInitializationError` | Prisma client not generated | Run `npx prisma generate` |
| `EACCES: permission denied` | Port already in use | Kill process on port 3000: `lsof -ti:3000 \| xargs kill -9` |
| `DATABASE_URL is required` | .env not created | Copy `.env.example` to `.env` |
| `P2021: Table doesn't exist` | Migration not run | Run `npm run db:reset` |
| `ECONNREFUSED Redis` | Redis not running | Check `docker compose ps` |
| `429 Too Many Requests` | Rate limit hit | Wait 60s or restart Redis |
| `SESSION_COMPROMISED` alert | Refresh token reused | This is a security feature! Review logs. |
| Pre-commit hook fails on Windows | Line endings | Run `git config --global core.autocrlf false` and re-clone |

## 🔐 Security Best Practices for Developers

**⚠️ NEVER DO THESE:**
- ❌ Hardcode secrets in code
- ❌ Commit `.env` file
- ❌ Use weak passwords in production
- ❌ Disable Helmet in production
- ❌ Log tokens or user credentials

**✅ ALWAYS DO THESE:**
- ✅ Run `npm run generate-secrets` for new deployments
- ✅ Use different secrets for dev/staging/prod
- ✅ Keep `tokenVersion` field synchronized across all instances
- ✅ Review `/metrics` endpoint is protected by auth
- ✅ Enable `ENABLE_REDIS_RATE_LIMIT=true` in production

## 🚀 Deployment Checklist (Pre-Production)

Before deploying to staging/production:

1. **Build test**
   ```bash
   npm run build
   ```

2. **Validate environment**
   ```bash
   npm run env:verify
   ```

3. **Run all checks**
   ```bash
   npm run validate
   ```

4. **E2E tests**
   ```bash
   npm run test:e2e
   ```

5. **Check for vulnerabilities**
   ```bash
   npm audit --audit-level=high
   ```

6. **Generate production secrets**
   ```bash
   NODE_ENV=production npm run generate-secrets
   ```

7. **Verify Docker image builds**
   ```bash
   docker build -t laba-backend:test .
   ```

8. **Check migrations**
   ```bash
   npx prisma migrate status
   ```

## 🤝 Contributing & Git Workflow

```bash
# 1. Create feature branch
git checkout -b feature/cms-posts

# 2. Before commit (automated)
git add .
git commit -m "feat: add publish/unpublish post API"
# Pre-commit hook will auto-fix lint/format
# If fails, fix errors and commit again

# 3. Push and create PR
git push origin feature/cms-posts
```

## 📚 Additional Resources

- **NestJS Docs**: https://docs.nestjs.com/
- **Prisma Docs**: https://www.prisma.io/docs
- **API Conventions**: `/docs/api-conventions.md` (Must read before coding)
- **Architecture Overview**: `/docs/architecture-overview.md` (Must read for new hires)
- **Postman Collection**: `./docs/laba-api-postman.json` (If available)

## 📞 Support & Contact

- **Dev Team Lead**: [Your Name] @ Slack `#dev-laba`
- **Issues**: Create GitHub issue with label `backend`
- **Onboarding Questions**: Use Slack `#onboarding-laba`
