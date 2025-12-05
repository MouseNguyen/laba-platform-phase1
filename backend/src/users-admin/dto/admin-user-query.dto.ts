// backend/src/users-admin/dto/admin-user-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min, Max } from 'class-validator';

const MAX_LIMIT = 50;

export class AdminUserQueryDto {
  @ApiPropertyOptional({
    description: 'Search by email or name (contains, case-insensitive)',
    example: 'laba',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => {
    if (!value) return undefined;
    // Strip potential XSS characters
    return value
      .toString()
      .trim()
      .replace(/[<>'"&]/g, '');
  })
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter locked users (lockUntil > now)',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  isLocked?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by role name (e.g. admin, staff)',
    example: 'admin',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  roleName?: string;

  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: `Items per page (max: ${MAX_LIMIT})`,
    example: 10,
    minimum: 1,
    maximum: MAX_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_LIMIT)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'created_at',
    enum: ['created_at', 'email', 'full_name'],
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'created_at';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
