// backend/src/branches/branches.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Prisma, Branch as PrismaBranch } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import { PrismaService } from '../prisma/prisma.service';

import {
  BranchQueryDto,
  BranchResponseDto,
  PaginatedBranchesResponseDto,
  BranchTypeEnum,
  CreateBranchDto,
  UpdateBranchDto,
} from './dto';

@Injectable()
export class BranchesService {
  private readonly logger = new Logger(BranchesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Map Prisma Branch entity to Response DTO
   */
  private mapToResponseDto(branch: PrismaBranch): BranchResponseDto {
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return {
      id: branch.id,
      code: branch.code,
      name: branch.name,
      type: branch.type as BranchTypeEnum,
      address: branch.address ?? undefined,
      phone: branch.phone ?? undefined,
      settings: (branch.settings ?? null) as Record<string, any> | null,
      isActive: branch.isActive,
      createdAt: branch.created_at.toISOString(),
      updatedAt: branch.updated_at.toISOString(),
      deletedAt: branch.deleted_at ? branch.deleted_at.toISOString() : null,
    };
  }

  /**
   * Build WHERE clause from query params
   */
  private buildWhereClause(query: BranchQueryDto): Prisma.BranchWhereInput {
    const where: Prisma.BranchWhereInput = {
      deleted_at: null, // Always exclude soft-deleted
    };

    if (query.type) {
      where.type = query.type;
    }

    if (typeof query.isActive === 'boolean') {
      where.isActive = query.isActive;
    }

    if (query.search?.trim()) {
      const searchTerm = query.search.trim();
      where.OR = [
        { code: { contains: searchTerm, mode: 'insensitive' } },
        { name: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  /**
   * Build ORDER BY clause
   */
  private buildOrderBy(
    sortBy: string,
    sortOrder: 'ASC' | 'DESC',
  ): Prisma.BranchOrderByWithRelationInput {
    const allowedFields = ['created_at', 'name', 'type', 'code'];
    const fieldMap: Record<string, string> = {
      createdAt: 'created_at',
      name: 'name',
      type: 'type',
      code: 'code',
    };

    const field = fieldMap[sortBy] || 'created_at';
    if (!allowedFields.includes(field)) {
      return { created_at: sortOrder.toLowerCase() as 'asc' | 'desc' };
    }

    return { [field]: sortOrder.toLowerCase() as 'asc' | 'desc' };
  }

  /**
   * Get default settings based on branch type
   */
  private getDefaultSettings(type: BranchTypeEnum): Prisma.InputJsonValue {
    switch (type) {
      case BranchTypeEnum.FARM:
        return {
          timezone: 'Asia/Ho_Chi_Minh',
          openHours: { from: '07:00', to: '17:00' },
          maxVisitorsPerDay: 50,
        };
      case BranchTypeEnum.HOMESTAY:
        return {
          timezone: 'Asia/Ho_Chi_Minh',
          checkInFrom: '14:00',
          checkOutUntil: '11:00',
        };
      case BranchTypeEnum.CAFE:
        return {
          timezone: 'Asia/Ho_Chi_Minh',
          openHours: { from: '07:00', to: '22:00' },
        };
      case BranchTypeEnum.SHOP:
        return {
          timezone: 'Asia/Ho_Chi_Minh',
          openHours: { from: '08:00', to: '21:00' },
        };
      default:
        return { timezone: 'Asia/Ho_Chi_Minh' };
    }
  }

  // =============================================
  // CREATE BRANCH
  // =============================================
  async create(dto: CreateBranchDto): Promise<BranchResponseDto> {
    // Check code uniqueness explicitly
    const existingCode = await this.prisma.branch.findUnique({
      where: { code: dto.code },
    });
    if (existingCode) {
      throw new BadRequestException(`Branch with code "${dto.code}" already exists`);
    }

    const data: Prisma.BranchCreateInput = {
      code: dto.code,
      name: dto.name,
      type: dto.type,
      address: dto.address ?? null,
      phone: dto.phone ?? null,
      settings:
        dto.settings !== undefined
          ? (dto.settings as Prisma.InputJsonValue)
          : this.getDefaultSettings(dto.type),
      isActive: dto.isActive ?? true,
    };

    try {
      const branch = await this.prisma.branch.create({ data });
      this.logger.log(`Branch created: id=${branch.id}, code=${branch.code}`);
      return this.mapToResponseDto(branch);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(`Branch with code "${dto.code}" already exists`);
        }
      }
      this.logger.error(`Failed to create branch: ${error.message}`);
      throw new InternalServerErrorException('Failed to create branch');
    }
  }

  // =============================================
  // FIND ALL BRANCHES (Paginated)
  // =============================================
  async findAll(query: BranchQueryDto): Promise<PaginatedBranchesResponseDto> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'ASC' } = query;
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 100); // Cap at 100

    const where = this.buildWhereClause(query);
    const orderBy = this.buildOrderBy(sortBy, sortOrder);
    const skip = (safePage - 1) * safeLimit;

    try {
      const [items, totalItems] = await this.prisma.$transaction([
        this.prisma.branch.findMany({
          where,
          orderBy,
          skip,
          take: safeLimit,
        }),
        this.prisma.branch.count({ where }),
      ]);

      const totalPages = Math.ceil(totalItems / safeLimit) || 0;

      return {
        items: items.map((b) => this.mapToResponseDto(b)),
        page: safePage,
        limit: safeLimit,
        totalPages,
        totalItems,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch branches: ${error.message}`);
      throw new InternalServerErrorException('Failed to retrieve branches');
    }
  }

  // =============================================
  // FIND ONE BRANCH
  // =============================================
  async findOne(id: number): Promise<BranchResponseDto> {
    const branch = await this.prisma.branch.findFirst({
      where: { id, deleted_at: null },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    return this.mapToResponseDto(branch);
  }

  // =============================================
  // FIND BY CODE
  // =============================================
  async findByCode(code: string): Promise<BranchResponseDto> {
    const branch = await this.prisma.branch.findFirst({
      where: { code, deleted_at: null },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with code "${code}" not found`);
    }

    return this.mapToResponseDto(branch);
  }

  // =============================================
  // UPDATE BRANCH
  // =============================================
  async update(id: number, dto: UpdateBranchDto): Promise<BranchResponseDto> {
    const existing = await this.prisma.branch.findFirst({
      where: { id, deleted_at: null },
    });

    if (!existing) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    // Check code uniqueness if being updated
    if (dto.code && dto.code !== existing.code) {
      const conflict = await this.prisma.branch.findUnique({
        where: { code: dto.code },
      });
      if (conflict) {
        throw new BadRequestException(`Branch with code "${dto.code}" already exists`);
      }
    }

    const updateData: Prisma.BranchUpdateInput = {};

    if (dto.code !== undefined) updateData.code = dto.code;
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.address !== undefined) updateData.address = dto.address;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.settings !== undefined) {
      updateData.settings = dto.settings as Prisma.InputJsonValue;
    }
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    try {
      const updated = await this.prisma.branch.update({
        where: { id },
        data: updateData,
      });

      this.logger.log(`Branch updated: id=${id}, code=${updated.code}`);
      return this.mapToResponseDto(updated);
    } catch (error) {
      this.logger.error(`Failed to update branch ${id}: ${error.message}`);
      throw new InternalServerErrorException('Failed to update branch');
    }
  }

  // =============================================
  // SOFT DELETE
  // =============================================
  async softDelete(id: number): Promise<void> {
    const existing = await this.prisma.branch.findFirst({
      where: { id, deleted_at: null },
    });

    if (!existing) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    // TODO: Check for dependencies (bookings, users, inventory) in Phase 2
    // const hasDependencies = await this.checkDependencies(id);
    // if (hasDependencies) {
    //   throw new BadRequestException('Cannot delete branch with existing dependencies');
    // }

    await this.prisma.branch.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    this.logger.log(`Branch soft-deleted: id=${id}`);
  }

  // =============================================
  // RESTORE BRANCH (from soft delete)
  // =============================================
  async restore(id: number): Promise<BranchResponseDto> {
    const branch = await this.prisma.branch.findFirst({
      where: { id, deleted_at: { not: null } },
    });

    if (!branch) {
      throw new NotFoundException(`Deleted branch with ID ${id} not found`);
    }

    const restored = await this.prisma.branch.update({
      where: { id },
      data: { deleted_at: null },
    });

    this.logger.log(`Branch restored: id=${id}`);
    return this.mapToResponseDto(restored);
  }

  // =============================================
  // GET BRANCH STATS
  // =============================================
  async getStats(): Promise<{
    total: number;
    active: number;
    byType: Record<string, number>;
  }> {
    const [total, active, farmCount, homestayCount, cafeCount, shopCount] =
      await this.prisma.$transaction([
        this.prisma.branch.count({ where: { deleted_at: null } }),
        this.prisma.branch.count({ where: { deleted_at: null, isActive: true } }),
        this.prisma.branch.count({ where: { deleted_at: null, type: 'FARM' } }),
        this.prisma.branch.count({ where: { deleted_at: null, type: 'HOMESTAY' } }),
        this.prisma.branch.count({ where: { deleted_at: null, type: 'CAFE' } }),
        this.prisma.branch.count({ where: { deleted_at: null, type: 'SHOP' } }),
      ]);

    return {
      total,
      active,
      byType: {
        FARM: farmCount,
        HOMESTAY: homestayCount,
        CAFE: cafeCount,
        SHOP: shopCount,
      },
    };
  }
}
