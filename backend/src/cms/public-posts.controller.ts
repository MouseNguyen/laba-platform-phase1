/**
 * PUBLIC POSTS CONTROLLER
 * Public endpoints for blog/content viewing
 * No authentication required
 */

import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiResponse, ApiQuery } from '@nestjs/swagger';

import { PostQueryDto, PostResponseDto, PaginatedPostsResponseDto, PostTypeEnum } from './dto';
import { PostsService } from './posts.service';

@ApiTags('public-posts')
@Controller({ path: 'posts', version: '1' })
export class PublicPostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get published posts (Public)',
    description: 'Retrieve published posts for public blog listing.',
  })
  @ApiOkResponse({
    description: 'List of published posts',
    type: PaginatedPostsResponseDto,
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: PostTypeEnum })
  async findPublished(@Query() query: PostQueryDto): Promise<PaginatedPostsResponseDto> {
    // Force isPublished = true for public access
    const publicQuery = { ...query, isPublished: true };
    return this.postsService.findAll(publicQuery);
  }

  @Get('slug/:slug')
  @ApiOperation({
    summary: 'Get post by slug (Public)',
    description: 'Retrieve a specific post by its URL slug.',
  })
  @ApiOkResponse({
    description: 'Post retrieved successfully',
    type: PostResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async findBySlug(@Param('slug') slug: string): Promise<PostResponseDto> {
    return this.postsService.findBySlug(slug);
  }
}
