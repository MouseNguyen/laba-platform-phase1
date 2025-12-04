import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

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
