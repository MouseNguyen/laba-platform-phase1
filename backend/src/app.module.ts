import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LandingModule } from './landing/landing.module';
import { MonitoringModule } from './monitoring/monitoring.module';
// Phase 1 Plugin Modules
import { BranchesModule } from './branches/branches.module';
import { CmsModule } from './cms/cms.module';
import { UsersAdminModule } from './users-admin/users-admin.module';
import { CommonModule } from './common/common.module';
import { RedisModule } from './redis/redis.module';
import { UploadsModule } from './uploads/uploads.module';

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
        // Plugin Modules (Phase 1)
        BranchesModule,
        CmsModule,
        UsersAdminModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
