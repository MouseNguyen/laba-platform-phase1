# laba-platform-phase1

## Quick Start with Docker

1. **Start infrastructure**
   ```bash
   docker compose -f docker-compose.dev.yml up -d
   ```

2. **Wait for DB ready (10-15s)**
   ```bash
   docker compose -f docker-compose.dev.yml logs -f postgres
   ```

3. **Run backend (in another terminal)**
   ```bash
   cd backend
   npm install
   npm run start:dev
   ```

4. **Run frontend (in another terminal)**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **View MailHog UI**: http://localhost:8025

6. **Stop everything**
   ```bash
   docker compose -f docker-compose.dev.yml down
   ```