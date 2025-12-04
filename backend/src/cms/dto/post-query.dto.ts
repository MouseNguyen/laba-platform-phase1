import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsOptional,
    IsEnum,
    IsString,
    MaxLength,
    IsInt,
    Min,
    Max,
    IsDateString,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PostTypeEnum } from './post-type.enum';

const MAX_LIMIT = 100; // Hard cap to prevent DoS
const DEFAULT_LIMIT = 10;
const DEFAULT_PAGE = 1;

export class PostQueryDto {
    @ApiPropertyOptional({
        enum: PostTypeEnum,
        description: 'Filter by post type',
    })
    @IsOptional()
    @IsEnum(PostTypeEnum)
    type?: PostTypeEnum;

    @ApiPropertyOptional({
        description: 'Full-text search in title and excerpt',
        example: 'farm experience',
        maxLength: 100,
    })
    @IsOptional()
    @IsString()
    @MaxLength(100, { message: 'Search term must not exceed 100 characters' })
    @Transform(({ value }) => (value ? value.toString().trim() : value)) // Sanitize whitespace
    search?: string;

    @ApiPropertyOptional({
        description: 'Filter by publication status',
        example: true,
    })
    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    isPublished?: boolean;

    @ApiPropertyOptional({
        description: 'Page number (1-based)',
        example: DEFAULT_PAGE,
        minimum: 1,
        maximum: 10000,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1, { message: 'Page must be at least 1' })
    @Max(10000, { message: 'Page number too large' })
    page?: number = DEFAULT_PAGE;

    @ApiPropertyOptional({
        description: `Items per page (max: ${MAX_LIMIT})`,
        example: DEFAULT_LIMIT,
        minimum: 1,
        maximum: MAX_LIMIT,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1, { message: 'Limit must be at least 1' })
    @Max(MAX_LIMIT, { message: `Limit cannot exceed ${MAX_LIMIT} for performance` })
    limit?: number = DEFAULT_LIMIT;

    @ApiPropertyOptional({
        description: 'Field to sort by (whitelisted)',
        example: 'createdAt',
        enum: ['createdAt', 'publishedAt', 'title', 'updatedAt'],
    })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value || 'createdAt')
    sortBy?: string = 'createdAt';

    @ApiPropertyOptional({
        description: 'Sort order',
        example: 'DESC',
        enum: ['ASC', 'DESC'],
    })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => (value === 'ASC' ? 'ASC' : 'DESC'))
    sortOrder?: 'ASC' | 'DESC' = 'DESC';

    @ApiPropertyOptional({
        description: 'Filter by date range - from',
        example: '2024-01-01T00:00:00.000Z',
    })
    @IsOptional()
    @IsDateString()
    dateFrom?: string;

    @ApiPropertyOptional({
        description: 'Filter by date range - to',
        example: '2024-12-31T23:59:59.000Z',
    })
    @IsOptional()
    @IsDateString()
    dateTo?: string;

    // Add validateNested for complex filters if needed in future
}
