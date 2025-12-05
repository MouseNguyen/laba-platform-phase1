// backend/src/branches/dto/branch-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BranchTypeEnum } from './branch-type.enum';

export class BranchResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'FARM_MAIN' })
  code: string;

  @ApiProperty({ example: 'Laba Farm - Main' })
  name: string;

  @ApiProperty({ enum: BranchTypeEnum, example: BranchTypeEnum.FARM })
  type: BranchTypeEnum;

  @ApiPropertyOptional({ example: 'Thôn 5, Xã Lạc Dương, Tỉnh Lâm Đồng' })
  address?: string;

  @ApiPropertyOptional({ example: '+84 123 456 789' })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Branch configuration JSON',
    example: {
      timezone: 'Asia/Ho_Chi_Minh',
      openHours: { from: '07:00', to: '17:00' },
    },
  })
  settings?: Record<string, any> | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2024-01-10T09:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-12T11:30:00.000Z' })
  updatedAt: string;

  @ApiPropertyOptional({ example: null })
  deletedAt?: string | null;
}

export class PaginatedBranchesResponseDto {
  @ApiProperty({ type: [BranchResponseDto] })
  items: BranchResponseDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 1 })
  totalPages: number;

  @ApiProperty({ example: 3 })
  totalItems: number;

  @ApiPropertyOptional({ example: '/api/v1/branches?page=2&limit=10' })
  nextPage?: string;

  @ApiPropertyOptional({ example: null })
  prevPage?: string;
}
