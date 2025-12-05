// backend/src/branches/branches.module.ts
import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { BranchesController } from './branches.controller';
import { BranchesService } from './branches.service';

/**
 * Branches Module - Multi-tenant support for Laba Platform
 * Manages Farm, Homestay, Cafe, and Shop locations
 *
 * Features:
 * - CRUD operations with soft delete
 * - Pagination, filtering, and search
 * - Type-based organization (FARM, HOMESTAY, CAFE, SHOP)
 * - Settings as JSONB for flexible configuration
 *
 * TODO Phase 2:
 * - Redis caching for GET requests
 * - Event emission for audit trail
 * - File upload for branch logos
 * - Bulk operations
 */
@Module({
  imports: [PrismaModule],
  providers: [BranchesService],
  controllers: [BranchesController],
  exports: [BranchesService], // Export for use in other modules
})
export class BranchesModule {}
