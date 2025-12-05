// backend/src/branches/dto/update-branch.dto.ts
import { PartialType } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength, Matches } from 'class-validator';

import { CreateBranchDto } from './create-branch.dto';

/**
 * Update Branch DTO
 * All fields are optional. Code can be changed but uniqueness is checked.
 */
export class UpdateBranchDto extends PartialType(CreateBranchDto) {
  @ApiPropertyOptional({
    description: 'Branch code - can be updated but must remain unique',
    example: 'FARM_UPDATED',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Matches(/^[A-Z0-9_]+$/, {
    message: 'Code can only contain uppercase letters, numbers, and underscores',
  })
  code?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Deactivate branch temporarily',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
