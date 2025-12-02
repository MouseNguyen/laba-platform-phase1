# Backend Development & Deployment Guide

## Database Migration Strategy

### 1. Local Development
When developing locally, use `migrate dev` to apply changes and update your client. This command tracks migration history and is safe for development environments.

```bash
npx prisma migrate dev
```

### 2. Staging & Production
**NEVER** use `migrate dev` in production. It may try to reset the database. Instead, use `migrate deploy` to apply pending migrations.

```bash
npx prisma migrate deploy
```

### 3. Pre-Deployment Checklist
Before deploying changes to Staging or Production:
1.  **Backup Database**: Ensure you have a recent snapshot.
2.  **Check Migration Diff**: Verify what changes will be applied.
3.  **Concurrent Indexes**: If adding indexes to large tables, consider using `CREATE INDEX CONCURRENTLY` manually if downtime is a concern (TODO: Add script for this if needed).

### 4. Post-Deployment Smoke Test
After deployment, verify the system health:

1.  **Health Check**:
    ```bash
    curl https://api.your-domain.com/health
    # Expected: {"status":"ok", "checks": {"db": "up"}}
    ```

2.  **Auth Flow**:
    - Call `/auth/login` to get tokens.
    - Call `/auth/me` with the access token.
    - Call `/auth/refresh` to rotate tokens.

## Environment Variables
Ensure all required environment variables are set. See `.env.example` or `src/config/config.validation.ts` for the full list.
