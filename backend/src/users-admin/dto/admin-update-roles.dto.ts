// backend/src/users-admin/dto/admin-update-roles.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, ArrayNotEmpty, ArrayUnique, Min, Max } from 'class-validator';

export class AdminUpdateRolesDto {
  @ApiProperty({
    description: 'List of role IDs to assign (replaces existing roles)',
    example: [1, 2],
    type: [Number],
    minItems: 1,
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'At least one role must be provided' })
  @ArrayUnique({ message: 'Role IDs must be unique' })
  @Type(() => Number)
  @IsInt({ each: true, message: 'Each role ID must be an integer' })
  @Min(1, { each: true, message: 'Role ID must be positive' })
  @Max(999999, { each: true, message: 'Role ID too large' })
  roleIds: number[];
}
