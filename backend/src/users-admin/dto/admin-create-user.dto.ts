// backend/src/users-admin/dto/admin-create-user.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Matches,
  ArrayUnique,
  Min,
} from 'class-validator';

export class AdminCreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'newuser@laba.vn',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'Temporary password (min 8 chars, requires uppercase, lowercase, number)',
    example: 'TempPass123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(100)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Password must contain uppercase, lowercase, and number',
  })
  tempPassword: string;

  @ApiPropertyOptional({
    description: 'User full name',
    example: 'Nguyen Van A',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Role IDs to assign',
    example: [1],
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique({ message: 'Role IDs must be unique' })
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  roleIds?: number[];
}
