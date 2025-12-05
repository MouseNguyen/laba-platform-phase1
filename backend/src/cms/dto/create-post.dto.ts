import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  MinLength,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsUrl,
  ValidateIf,
  IsObject,
  Matches,
  IsInt,
  Min,
} from 'class-validator';

import { PostTypeEnum } from './post-type.enum';

// Custom validator for JSON content structure
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ContentBlock {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsObject()
  data: Record<string, any>;
}

export class CreatePostDto {
  @ApiProperty({
    enum: PostTypeEnum,
    example: PostTypeEnum.BLOG,
    description: 'Type of content',
  })
  @IsEnum(PostTypeEnum, {
    message: 'Type must be one of: PAGE, BLOG, NEWS',
  })
  type: PostTypeEnum;

  @ApiProperty({
    example: 'welcome-to-laba-farm',
    description: 'URL-friendly slug. Only lowercase letters, numbers, and hyphens',
    minLength: 3,
    maxLength: 200,
  })
  @IsString({ message: 'Slug must be a string' })
  @IsNotEmpty({ message: 'Slug is required' })
  @MinLength(3, { message: 'Slug must be at least 3 characters' })
  @MaxLength(200, { message: 'Slug must not exceed 200 characters' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug can only contain lowercase letters, numbers, and hyphens',
  })
  slug: string;

  @ApiProperty({
    example: 'Welcome to Laba Farm Experience',
    minLength: 5,
    maxLength: 500,
  })
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(5, { message: 'Title must be at least 5 characters' })
  @MaxLength(500, { message: 'Title must not exceed 500 characters' })
  title: string;

  @ApiPropertyOptional({
    example: 'Discover the beauty of sustainable farming and agri-tourism...',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Excerpt must be a string' })
  @MaxLength(500, { message: 'Excerpt must not exceed 500 characters' })
  excerpt?: string;

  @ApiProperty({
    description: 'Rich-text content as JSON. Structure depends on frontend editor',
    example: {
      blocks: [
        {
          type: 'paragraph',
          data: { text: 'Lorem ipsum...' },
        },
      ],
    },
  })
  @IsObject({ message: 'Content must be a valid JSON object' })
  @IsNotEmpty({ message: 'Content is required' })
  // TODO: Add custom validator to sanitize XSS: @SanitizeContent()
  content: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Thumbnail image URL',
    example: 'https://cdn.laba.vn/images/posts/welcome.jpg',
    maxLength: 1000,
  })
  @IsOptional()
  @ValidateIf((o) => o.thumbnailUrl && o.thumbnailUrl.length > 0)
  @IsUrl({}, { message: 'Thumbnail URL must be a valid URL' })
  @MaxLength(1000, { message: 'Thumbnail URL must not exceed 1000 characters' })
  thumbnailUrl?: string;

  @ApiPropertyOptional({
    description: 'Author ID. If not provided, current authenticated user will be used',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Author ID must be an integer' })
  @Min(1, { message: 'Author ID must be positive' })
  authorId?: number;

  @ApiPropertyOptional({
    description: 'Publish immediately',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isPublished must be a boolean' })
  isPublished?: boolean;

  @ApiPropertyOptional({
    description: 'Publication timestamp. Required if isPublished is true',
    example: '2024-01-15T10:00:00.000Z',
  })
  @IsOptional()
  @ValidateIf((o) => o.isPublished === true)
  @IsDateString({}, { message: 'publishedAt must be a valid ISO date string' })
  publishedAt?: string;
}

// SECURITY TODO: Implement @SanitizeContent() custom validator
// - Strip <script> tags
// - Validate allowed block types (paragraph, image, etc.)
// - Limit content size to prevent DoS
