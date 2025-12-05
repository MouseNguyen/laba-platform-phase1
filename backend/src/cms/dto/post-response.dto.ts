import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { PostTypeEnum } from './post-type.enum';

// Nested DTO for author
export class PostAuthorDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'admin@laba.vn' })
  email: string;

  @ApiPropertyOptional({ example: 'Admin User' })
  name?: string;
}

export class PostResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ enum: PostTypeEnum })
  type: PostTypeEnum;

  @ApiProperty({ example: 'welcome-to-laba-farm' })
  slug: string;

  @ApiProperty({ example: 'Welcome to Laba Farm Experience' })
  title: string;

  @ApiPropertyOptional({ example: 'Discover the beauty of sustainable farming...' })
  excerpt?: string;

  @ApiProperty({
    description: 'Rich-text content as JSON',
    example: {
      blocks: [
        {
          type: 'paragraph',
          data: { text: 'Lorem ipsum dolor sit amet...' },
        },
      ],
    },
  })
  content: Record<string, any>;

  @ApiPropertyOptional({ example: 'https://cdn.laba.vn/images/posts/welcome.jpg' })
  thumbnailUrl?: string;

  @ApiPropertyOptional({ example: 1 })
  authorId?: number;

  @ApiPropertyOptional({ type: PostAuthorDto })
  author?: PostAuthorDto | null;

  @ApiProperty({ example: true })
  isPublished: boolean;

  @ApiPropertyOptional({ example: '2024-01-15T10:00:00.000Z' })
  publishedAt?: string | null;

  @ApiProperty({ example: '2024-01-10T09:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-12T14:30:00.000Z' })
  updatedAt: string;

  @ApiPropertyOptional({ example: null })
  deletedAt?: string | null;
}

export class PaginatedPostsResponseDto {
  @ApiProperty({ type: [PostResponseDto] })
  items: PostResponseDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 3 })
  totalPages: number;

  @ApiProperty({ example: 25 })
  totalItems: number;

  @ApiProperty({ example: '/api/v1/posts?page=2&limit=10' })
  nextPage?: string;

  @ApiProperty({ example: '/api/v1/posts?page=1&limit=10' })
  prevPage?: string;
}
