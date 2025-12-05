// backend/src/users-admin/users-admin.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as argon2 from 'argon2';

import { PrismaService } from '../prisma/prisma.service';

import {
  AdminUserQueryDto,
  AdminUserResponseDto,
  PaginatedAdminUsersResponseDto,
  AdminUpdateRolesDto,
  AdminUserRoleDto,
  AdminCreateUserDto,
  AdminRoleResponseDto,
} from './dto';

type UserWithRoles = Prisma.UserGetPayload<{
  include: { user_roles: { include: { role: true } } };
}>;

@Injectable()
export class UsersAdminService {
  private readonly logger = new Logger(UsersAdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  private mapRole(role: {
    id: number;
    name: string;
    description: string | null;
  }): AdminUserRoleDto {
    return {
      id: role.id,
      name: role.name,
      description: role.description ?? undefined,
    };
  }

  private mapUser(user: UserWithRoles): AdminUserResponseDto {
    return {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      roles: user.user_roles?.map((ur) => this.mapRole(ur.role)) ?? [],
      lockUntil: user.lock_until ? user.lock_until.toISOString() : null,
      failedLoginAttempts: user.failed_login_attempts ?? 0,
      createdAt: user.created_at.toISOString(),
      updatedAt: user.updated_at.toISOString(),
    };
  }

  private buildWhereClause(query: AdminUserQueryDto): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {
      deleted_at: null,
    };

    const now = new Date();

    if (query.search?.trim()) {
      const term = query.search.trim();
      where.OR = [
        { email: { contains: term, mode: 'insensitive' } },
        { full_name: { contains: term, mode: 'insensitive' } },
      ];
    }

    if (typeof query.isLocked === 'boolean') {
      if (query.isLocked) {
        where.lock_until = { gt: now };
      } else {
        where.AND = [
          ...(Array.isArray(where.AND) ? where.AND : []),
          {
            OR: [{ lock_until: null }, { lock_until: { lte: now } }],
          },
        ];
      }
    }

    if (query.roleName) {
      where.user_roles = {
        some: {
          role: { name: query.roleName },
        },
      };
    }

    return where;
  }

  /**
   * LIST USERS (Admin) - Paginated with filtering
   */
  async findAll(query: AdminUserQueryDto): Promise<PaginatedAdminUsersResponseDto> {
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC' } = query;

    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 50);

    const where = this.buildWhereClause(query);
    const skip = (safePage - 1) * safeLimit;

    // Map sort field
    const sortFieldMap: Record<string, string> = {
      created_at: 'created_at',
      email: 'email',
      full_name: 'full_name',
    };
    const sortField = sortFieldMap[sortBy] || 'created_at';

    try {
      const [users, totalItems] = await this.prisma.$transaction([
        this.prisma.user.findMany({
          where,
          skip,
          take: safeLimit,
          orderBy: { [sortField]: sortOrder.toLowerCase() as 'asc' | 'desc' },
          include: {
            user_roles: {
              include: { role: true },
            },
          },
        }),
        this.prisma.user.count({ where }),
      ]);

      const totalPages = Math.ceil(totalItems / safeLimit) || 0;

      return {
        items: users.map((u) => this.mapUser(u)),
        page: safePage,
        limit: safeLimit,
        totalPages,
        totalItems,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch users: ${error.message}`);
      throw new InternalServerErrorException('Failed to retrieve users');
    }
  }

  /**
   * GET USER DETAIL (Admin)
   */
  async findOne(id: number): Promise<AdminUserResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: { id, deleted_at: null },
      include: {
        user_roles: {
          include: { role: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.mapUser(user);
  }

  /**
   * CREATE USER (Admin)
   */
  async createUser(dto: AdminCreateUserDto): Promise<AdminUserResponseDto> {
    // Check email uniqueness
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException(`Email ${dto.email} already exists`);
    }

    // Validate roleIds if provided
    if (dto.roleIds && dto.roleIds.length > 0) {
      const existingRoles = await this.prisma.role.findMany({
        where: { id: { in: dto.roleIds } },
        select: { id: true },
      });
      if (existingRoles.length !== dto.roleIds.length) {
        const existingIds = existingRoles.map((r) => r.id);
        const missing = dto.roleIds.filter((rid) => !existingIds.includes(rid));
        throw new BadRequestException(`Role IDs not found: ${missing.join(', ')}`);
      }
    }

    // Hash password
    const passwordHash = await argon2.hash(dto.tempPassword, { type: argon2.argon2id });

    // Create user in transaction
    const newUser = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          password_hash: passwordHash,
          full_name: dto.fullName || null,
          token_version: 0,
        },
      });

      // Assign roles if provided
      if (dto.roleIds && dto.roleIds.length > 0) {
        await tx.userRole.createMany({
          data: dto.roleIds.map((roleId) => ({
            user_id: user.id,
            role_id: roleId,
          })),
        });
      }

      return tx.user.findUnique({
        where: { id: user.id },
        include: {
          user_roles: {
            include: { role: true },
          },
        },
      });
    });

    if (!newUser) {
      throw new InternalServerErrorException('Failed to create user');
    }

    this.logger.log(`User created: id=${newUser.id}, email=${newUser.email}`);
    return this.mapUser(newUser);
  }

  /**
   * LOCK USER - Set lockUntil = now + minutes
   */
  async lockUser(id: number, minutes: number): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: { id, deleted_at: null },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const lockUntil = new Date();
    lockUntil.setMinutes(lockUntil.getMinutes() + minutes);

    await this.prisma.user.update({
      where: { id },
      data: { lock_until: lockUntil },
    });

    this.logger.log(`User locked: id=${id}, until=${lockUntil.toISOString()}`);
  }

  /**
   * UNLOCK USER - Clear lockUntil and reset failedLoginAttempts
   */
  async unlockUser(id: number): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: { id, deleted_at: null },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        lock_until: null,
        failed_login_attempts: 0,
      },
    });

    this.logger.log(`User unlocked: id=${id}`);
  }

  /**
   * UPDATE USER ROLES (Transaction-safe)
   */
  async updateRoles(id: number, dto: AdminUpdateRolesDto): Promise<AdminUserResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: { id, deleted_at: null },
      include: { user_roles: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Validate all roleIds exist
    const existingRoles = await this.prisma.role.findMany({
      where: { id: { in: dto.roleIds } },
      select: { id: true },
    });

    if (existingRoles.length !== dto.roleIds.length) {
      const existingIds = existingRoles.map((r) => r.id);
      const missing = dto.roleIds.filter((rid) => !existingIds.includes(rid));
      throw new BadRequestException(`Role IDs not found: ${missing.join(', ')}`);
    }

    // Execute in transaction
    const updatedUser = await this.prisma.$transaction(async (tx) => {
      // Delete existing roles
      await tx.userRole.deleteMany({ where: { user_id: id } });

      // Assign new roles
      if (dto.roleIds.length > 0) {
        await tx.userRole.createMany({
          data: dto.roleIds.map((roleId) => ({
            user_id: id,
            role_id: roleId,
          })),
        });
      }

      // Fetch updated user with roles
      return tx.user.findUnique({
        where: { id },
        include: {
          user_roles: {
            include: { role: true },
          },
        },
      });
    });

    if (!updatedUser) {
      throw new InternalServerErrorException('Failed to update user roles');
    }

    this.logger.log(`User roles updated: id=${id}, roles=${dto.roleIds.join(',')}`);
    return this.mapUser(updatedUser);
  }

  /**
   * GET ALL ROLES - For dropdown in UI
   */
  async getAllRoles(): Promise<AdminRoleResponseDto[]> {
    const roles = await this.prisma.role.findMany({
      where: { deleted_at: null },
      orderBy: { name: 'asc' },
    });

    return roles.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description ?? undefined,
    }));
  }

  /**
   * GET USER STATS
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    locked: number;
    byRole: Record<string, number>;
  }> {
    const now = new Date();

    const [total, locked, roles] = await this.prisma.$transaction([
      this.prisma.user.count({ where: { deleted_at: null } }),
      this.prisma.user.count({ where: { deleted_at: null, lock_until: { gt: now } } }),
      this.prisma.role.findMany({
        where: { deleted_at: null },
        include: {
          user_roles: {
            include: { user: true },
          },
        },
      }),
    ]);

    const byRole: Record<string, number> = {};
    roles.forEach((role) => {
      byRole[role.name] = role.user_roles.filter((ur) => ur.user.deleted_at === null).length;
    });

    return {
      total,
      active: total - locked,
      locked,
      byRole,
    };
  }
}
