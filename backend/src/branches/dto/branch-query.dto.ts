// backend/src/branches/dto/branch-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

import { BranchTypeEnum } from './branch-type.enum';

const MAX_LIMIT = 100;

export class BranchQueryDto {
  @ApiPropertyOptional({
    enum: BranchTypeEnum,
    description: 'Filter by branch type',
  })
  @IsOptional()
  @IsEnum(BranchTypeEnum)
  type?: BranchTypeEnum;

  @ApiPropertyOptional({
    description: 'Search in code or name (case-insensitive)',
    example: 'farm',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value ? value.toString().trim() : undefined))
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  isActive?: boolean;

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
    example: 'createdAt',
    enum: ['createdAt', 'name', 'type', 'code'],
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'ASC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}
