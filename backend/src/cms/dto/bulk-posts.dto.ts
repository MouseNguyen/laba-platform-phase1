import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, Min } from 'class-validator';

export class BulkDeletePostsDto {
  @ApiProperty({
    description: 'Array of post IDs to delete',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  ids: number[];
}
