/**
 * POSTS CONTROLLER
 * Module: CMS (Content Management)
 * Phase: 1
 * Features: REST API endpoints for Posts management
 * Security: JWT Guard, Permissions Guard (TODO)
 *
 * @author Laba Platform Team
 * @since 2024-01-15
 */

import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards,
    ConflictException,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiOkResponse,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiQuery,
    ApiBearerAuth,
    ApiResponse,
    ApiBody,
} from '@nestjs/swagger';
// import { Throttle } from '@nestjs/throttler';
import { PostsService } from './posts.service';
import {
    CreatePostDto,
    UpdatePostDto,
    PostQueryDto,
    PostResponseDto,
    PaginatedPostsResponseDto,
    BulkDeletePostsDto,
    PostTypeEnum,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
// import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@ApiTags('cms-posts')
@ApiBearerAuth() // Mark all endpoints as requiring auth
@Controller({ path: 'cms/posts', version: '1' })
@UseGuards(JwtAuthGuard, PermissionsGuard) // Comment out for now but keep as TODO
export class PostsController {
    constructor(private readonly postsService: PostsService) { }

    // TODO: Uncomment guards after auth system is fully integrated
    // TODO: Add @Throttle() with Redis limiter

    @Post()
    @ApiOperation({
        summary: 'Create new post (Admin only)',
        description: 'Creates a new CMS post. Requires POST_CREATE permission.',
    })
    @ApiCreatedResponse({
        description: 'Post created successfully',
        type: PostResponseDto,
    })
    @ApiResponse({ status: 409, description: 'Slug already exists' })
    @ApiResponse({ status: 422, description: 'Invalid content format' })
    // @RequirePermissions('post.create') // TODO: Enable
    // @Throttle(10, 60) // 10 requests per minute per user
    async create(
        @Body() dto: CreatePostDto,
        @CurrentUser() user?: User, // TODO: Make required after auth
    ): Promise<PostResponseDto> {
        try {
            // For now, if no user, authorId can be set manually or left null
            const authorId = user?.id;
            const result = await this.postsService.create(dto, authorId);
            return result;
        } catch (error) {
            if (error instanceof ConflictException) {
                throw new ConflictException(error.message);
            }
            throw new InternalServerErrorException('Failed to create post');
        }
    }

    @Get()
    @ApiOperation({
        summary: 'Get paginated posts (Admin)',
        description:
            'Retrieve posts with filtering, sorting, and pagination. Cached for 60s.',
    })
    @ApiOkResponse({
        description: 'List of posts retrieved successfully',
        type: PaginatedPostsResponseDto,
    })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiQuery({ name: 'type', required: false, enum: PostTypeEnum })
    @ApiQuery({ name: 'isPublished', required: false, type: Boolean })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({
        name: 'dateFrom',
        required: false,
        type: String,
        format: 'date-time',
    })
    @ApiQuery({
        name: 'dateTo',
        required: false,
        type: String,
        format: 'date-time',
    })
    @ApiQuery({
        name: 'sortBy',
        required: false,
        enum: ['createdAt', 'publishedAt', 'title'],
    })
    @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
    // @Throttle(30, 60) // 30 requests per minute
    async findAll(
        @Query() query: PostQueryDto,
    ): Promise<PaginatedPostsResponseDto> {
        return this.postsService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get post by ID (Admin)',
        description: 'Retrieve a specific post. Includes author information.',
    })
    @ApiOkResponse({
        description: 'Post retrieved successfully',
        type: PostResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Post not found or deleted' })
    // @Throttle(60, 60) // 60 requests per minute
    async findOne(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<PostResponseDto> {
        return this.postsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({
        summary: 'Update post (Admin)',
        description:
            'Updates post fields. Slug can only be changed if post is not published. Optimistic locking applied.',
    })
    @ApiOkResponse({
        description: 'Post updated successfully',
        type: PostResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Post not found' })
    @ApiResponse({ status: 409, description: 'Slug already exists' })
    @ApiResponse({
        status: 412,
        description: 'Precondition failed - post was modified by another user',
    })
    // @RequirePermissions('post.update') // TODO: Enable
    // @Throttle(20, 60)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdatePostDto,
        @CurrentUser() user?: User,
    ): Promise<PostResponseDto> {
        try {
            return await this.postsService.update(id, dto, user?.id);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException(error.message);
            }
            if (error instanceof ConflictException) {
                throw new ConflictException(error.message);
            }
            throw new InternalServerErrorException('Failed to update post');
        }
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Soft delete post (Admin)',
        description: 'Marks post as deleted. Can be restored later.',
    })
    @ApiNoContentResponse({ description: 'Post deleted successfully' })
    @ApiResponse({ status: 404, description: 'Post not found' })
    // @RequirePermissions('post.delete') // TODO: Enable
    // @Throttle(10, 60)
    async remove(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user?: User,
    ): Promise<void> {
        await this.postsService.softDelete(id, user?.id);
    }

    @Post(':id/restore')
    @ApiOperation({
        summary: 'Restore soft-deleted post (Admin)',
        description:
            'Restores a previously deleted post. Requires RESTORE permission.',
    })
    @ApiOkResponse({
        description: 'Post restored successfully',
        type: PostResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Post not found or not deleted' })
    // @RequirePermissions('post.restore') // TODO: Add this permission
    async restore(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user?: User,
    ): Promise<PostResponseDto> {
        return this.postsService.restore(id, user?.id);
    }

    @Post('bulk-delete')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Bulk delete posts (Admin)',
        description: 'Deletes multiple posts in one request. Limited to 100 posts.',
    })
    @ApiBody({ type: BulkDeletePostsDto })
    @ApiNoContentResponse({ description: 'Posts deleted successfully' })
    @ApiResponse({
        status: 400,
        description: 'Invalid request or too many posts',
    })
    // @RequirePermissions('post.bulkDelete') // TODO: Enable
    // @Throttle(5, 60) // Strict rate limit for bulk operations
    async bulkDelete(
        @Body() bulkDto: BulkDeletePostsDto,
        @CurrentUser() user?: User,
    ): Promise<{ count: number }> {
        return this.postsService.bulkDelete(bulkDto.ids, user?.id);
    }

    @Patch(':id/publish')
    @ApiOperation({
        summary: 'Publish/unpublish post (Admin)',
        description: 'Quick toggle for publication status.',
    })
    @ApiOkResponse({
        description: 'Publication status toggled',
        type: PostResponseDto,
    })
    // @RequirePermissions('post.publish') // TODO: Enable
    async togglePublish(
        @Param('id', ParseIntPipe) id: number,
        @Body('isPublished') isPublished: boolean,
        @CurrentUser() user?: User,
    ): Promise<PostResponseDto> {
        const dto = new UpdatePostDto();
        dto.isPublished = isPublished;
        return this.postsService.update(id, dto, user?.id);
    }
}
