import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

import { AuthModule } from './auth/auth.module';
import { BranchesModule } from './branches/branches.module';
import { CmsModule } from './cms/cms.module';
import { CommonModule } from './common/common.module';
import { ConfigModule } from './config/config.module';
import { HealthModule } from './health/health.module';
import { LandingModule } from './landing/landing.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { UploadsModule } from './uploads/uploads.module';
import { UsersModule } from './users/users.module';
// Phase 1 Plugin Modules
import { UsersAdminModule } from './users-admin/users-admin.module';

@Module({
  imports: [
    // Core Modules
    ConfigModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    LandingModule,
    MonitoringModule,
    CommonModule,
    RedisModule,
    UploadsModule,
    HealthModule,
    // Rate Limiting (Setup only, apply via Guards per controller/route)
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute default
      },
    ]),
    // Plugin Modules (Phase 1)
    BranchesModule,
    CmsModule,
    UsersAdminModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
