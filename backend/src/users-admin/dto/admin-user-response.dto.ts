// backend/src/users-admin/dto/admin-user-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminUserRoleDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'admin' })
  name: string;

  @ApiPropertyOptional({ example: 'Administrator with full access' })
  description?: string;
}

export class AdminUserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'admin@laba.vn' })
  email: string;

  @ApiPropertyOptional({ example: 'Laba Administrator', nullable: true })
  fullName?: string | null;

  @ApiProperty({ type: [AdminUserRoleDto], description: 'Assigned roles' })
  roles: AdminUserRoleDto[];

  @ApiPropertyOptional({
    example: '2024-01-15T10:00:00.000Z',
    description: 'Account lock expiration',
    nullable: true,
  })
  lockUntil?: string | null;

  @ApiPropertyOptional({ example: 0, description: 'Failed login attempts' })
  failedLoginAttempts?: number;

  @ApiProperty({ example: '2024-01-01T08:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-10T14:30:00.000Z' })
  updatedAt: string;
}

export class PaginatedAdminUsersResponseDto {
  @ApiProperty({ type: [AdminUserResponseDto] })
  items: AdminUserResponseDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 5 })
  totalPages: number;

  @ApiProperty({ example: 42 })
  totalItems: number;
}

export class AdminRoleResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'admin' })
  name: string;

  @ApiPropertyOptional({ example: 'Administrator with full access' })
  description?: string;
}
