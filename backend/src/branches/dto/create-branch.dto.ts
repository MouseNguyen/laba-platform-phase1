// backend/src/branches/dto/create-branch.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsEnum,
  IsObject,
  Matches,
  IsBoolean,
} from 'class-validator';

import { BranchTypeEnum } from './branch-type.enum';

export class CreateBranchDto {
  @ApiProperty({
    example: 'FARM_MAIN',
    description: 'Unique branch code (uppercase, alphanumeric, underscores allowed)',
    maxLength: 50,
  })
  @IsString({ message: 'Code must be a string' })
  @IsNotEmpty({ message: 'Code is required' })
  @MaxLength(50, { message: 'Code must not exceed 50 characters' })
  @Matches(/^[A-Z0-9_]+$/, {
    message: 'Code can only contain uppercase letters, numbers, and underscores',
  })
  code: string;

  @ApiProperty({
    example: 'Laba Farm - Main',
    description: 'Branch display name',
    maxLength: 255,
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(255, { message: 'Name must not exceed 255 characters' })
  name: string;

  @ApiProperty({
    enum: BranchTypeEnum,
    example: BranchTypeEnum.FARM,
    description: 'Business type of the branch',
  })
  @IsEnum(BranchTypeEnum, { message: 'Type must be one of: FARM, HOMESTAY, CAFE, SHOP' })
  type: BranchTypeEnum;

  @ApiPropertyOptional({
    example: 'Thôn 5, Xã Lạc Dương, Tỉnh Lâm Đồng',
    description: 'Full address of the branch',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  @MaxLength(500, { message: 'Address must not exceed 500 characters' })
  address?: string;

  @ApiPropertyOptional({
    example: '+84 123 456 789',
    description: 'Contact phone number with country code',
    maxLength: 30,
  })
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @MaxLength(30, { message: 'Phone must not exceed 30 characters' })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Branch configuration (timezone, hours, facilities, etc.)',
    example: {
      timezone: 'Asia/Ho_Chi_Minh',
      openHours: { from: '07:00', to: '17:00' },
      facilities: ['wifi', 'parking'],
    },
  })
  @IsOptional()
  @IsObject({ message: 'Settings must be a valid JSON object' })
  settings?: Record<string, any>;

  @ApiPropertyOptional({
    example: true,
    default: true,
    description: 'Whether the branch is active and operational',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
