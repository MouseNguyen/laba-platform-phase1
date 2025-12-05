// backend/src/users-admin/users-admin.module.ts
import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { UsersAdminController } from './users-admin.controller';
import { UsersAdminService } from './users-admin.service';

/**
 * Users Admin Module
 * Provides admin endpoints for user management
 * Features:
 * - List users with pagination, search, filter
 * - Create new users with temp password
 * - Lock/unlock user accounts
 * - Update user roles
 * - User statistics
 */
@Module({
  imports: [PrismaModule],
  providers: [UsersAdminService],
  controllers: [UsersAdminController],
  exports: [UsersAdminService],
})
export class UsersAdminModule {}
