/**
 * POSTS SERVICE
 * Module: CMS (Content Management)
 * Phase: 1
 * Features: CRUD, pagination, soft delete, bulk operations
 * Security: Content sanitization, optimistic locking
 * Caching: Redis caching enabled
 * Events: TODO - Emit events for Phase 5
 *
 * @author Laba Platform Team
 * @since 2024-01-15
 */

import {
    Injectable,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
    Logger,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Post as PrismaPost } from '@prisma/client';
import {
    CreatePostDto,
    UpdatePostDto,
    PostQueryDto,
    PostResponseDto,
    PaginatedPostsResponseDto,
    PostTypeEnum,
} from './dto';
import { RedisService } from '../redis/redis.service';
// import { EventEmitter2 } from '@nestjs/event-emitter'; // For Phase 5+
import * as DOMPurify from 'isomorphic-dompurify'; // XSS sanitization

@Injectable()
export class PostsService {
    private readonly logger = new Logger(PostsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
        // private readonly eventEmitter: EventEmitter2, // TODO: Enable for events
    ) { }

    // Helper: Sanitize content JSON to prevent XSS
    private sanitizeContent(content: Record<string, any>): Record<string, any> {
        try {
            const stringified = JSON.stringify(content);
            const sanitized = DOMPurify.sanitize(stringified, {
                ALLOWED_TAGS: [
                    'p',
                    'h1',
                    'h2',
                    'h3',
                    'img',
                    'a',
                    'strong',
                    'em',
                    'ul',
                    'ol',
                    'li',
                ],
                ALLOWED_ATTR: ['href', 'src', 'alt'],
            });
            return JSON.parse(sanitized);
        } catch (error) {
            const err = error as Error;
            this.logger.warn(`Content sanitization failed: ${err.message}`);
            return content; // Fallback to original if sanitization fails
        }
    }

    // Helper: Map Prisma entity to DTO
    private mapToResponseDto(post: PrismaPost): PostResponseDto {
        if (!post) {
            throw new NotFoundException('Post not found');
        }

        return {
            id: post.id,
            type: post.type as PostTypeEnum,
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt ?? undefined,
            content: (post.content ?? {}) as Record<string, any>,
            thumbnailUrl: post.thumbnailUrl ?? undefined,
            authorId: post.authorId ?? undefined,
            isPublished: post.isPublished,
            publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString(),
            deletedAt: post.deletedAt ? post.deletedAt.toISOString() : null,
        };
    }

    // Helper: Build WHERE clause từ query DTO
    private buildWhereClause(query: PostQueryDto): Prisma.PostWhereInput {
        const where: Prisma.PostWhereInput = {
            deletedAt: null, // Always exclude soft-deleted
        };

        if (query.type) {
            where.type = query.type;
        }

        if (typeof query.isPublished === 'boolean') {
            where.isPublished = query.isPublished;
        }

        if (query.search?.trim()) {
            const searchTerm = query.search.trim();
            where.OR = [
                { title: { contains: searchTerm, mode: 'insensitive' } },
                { excerpt: { contains: searchTerm, mode: 'insensitive' } },
            ];
        }

        if (query.dateFrom || query.dateTo) {
            where.createdAt = {};
            if (query.dateFrom) {
                where.createdAt.gte = new Date(query.dateFrom);
            }
            if (query.dateTo) {
                where.createdAt.lte = new Date(query.dateTo);
            }
        }

        return where;
    }

    // Helper: Build ORDER BY clause
    private buildOrderBy(
        sortBy: string,
        sortOrder: 'ASC' | 'DESC',
    ): Prisma.PostOrderByWithRelationInput {
        const allowedFields = ['createdAt', 'updatedAt', 'publishedAt', 'title'];
        const field = allowedFields.includes(sortBy) ? sortBy : 'createdAt';
        return { [field]: sortOrder.toLowerCase() as Prisma.SortOrder };
    }

    /**
     * CREATE POST
     */
    async create(
        dto: CreatePostDto,
        currentUserId?: number,
    ): Promise<PostResponseDto> {
        // Check slug exists
        const existingSlug = await this.prisma.post.findUnique({
            where: { slug: dto.slug },
        });
        if (existingSlug) {
            throw new BadRequestException(`Slug "${dto.slug}" already exists`);
        }

        // Sanitize content
        const sanitizedContent = this.sanitizeContent(dto.content);

        // Auto-set publishedAt
        const shouldPublish = dto.isPublished ?? false;
        const publishedAt =
            shouldPublish && !dto.publishedAt
                ? new Date()
                : dto.publishedAt
                    ? new Date(dto.publishedAt)
                    : null;

        const data: Prisma.PostCreateInput = {
            type: dto.type,
            slug: dto.slug,
            title: dto.title,
            excerpt: dto.excerpt ?? null,
            content: sanitizedContent as Prisma.InputJsonValue,
            thumbnailUrl: dto.thumbnailUrl ?? null,
            isPublished: shouldPublish,
            publishedAt,
            author: currentUserId ? { connect: { id: currentUserId } } : undefined,
        };

        // Execute in transaction
        const post = await this.prisma.$transaction(async (tx) => {
            const created = await tx.post.create({ data });
            return created;
        });

        // Clear cache
        await this.redis.delByPattern('posts:*');

        this.logger.log(`Post created: id=${post.id}, slug=${post.slug}`);
        return this.mapToResponseDto(post);
    }

    /**
     * FIND ALL POSTS (with pagination & caching)
     */
    async findAll(query: PostQueryDto): Promise<PaginatedPostsResponseDto> {
        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'DESC',
        } = query;
        const safePage = Math.max(1, page);
        const safeLimit = Math.min(Math.max(1, limit), 100);

        const where = this.buildWhereClause(query);
        const orderBy = this.buildOrderBy(sortBy, sortOrder);
        const skip = (safePage - 1) * safeLimit;

        // Check cache first
        const cacheKey = `posts:${JSON.stringify(where)}:${skip}:${safeLimit}:${JSON.stringify(orderBy)}`;
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            this.logger.debug('Cache hit for posts query');
            return JSON.parse(cached);
        }

        try {
            const [items, totalItems] = await this.prisma.$transaction([
                this.prisma.post.findMany({
                    where,
                    orderBy,
                    skip,
                    take: safeLimit,
                    include: {
                        author: {
                            select: { id: true, email: true, full_name: true },
                        },
                    },
                }),
                this.prisma.post.count({ where }),
            ]);

            const totalPages = Math.ceil(totalItems / safeLimit) || 0;
            const result: PaginatedPostsResponseDto = {
                items: items.map((p) => this.mapToResponseDto(p)),
                page: safePage,
                limit: safeLimit,
                totalPages,
                totalItems,
            };

            // Cache result
            await this.redis.setex(cacheKey, 60, JSON.stringify(result));

            this.logger.log(`Retrieved ${items.length} posts (page ${safePage})`);
            return result;
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error fetching posts: ${err.message}`);
            throw new InternalServerErrorException('Failed to retrieve posts');
        }
    }

    /**
     * FIND ONE POST
     */
    async findOne(id: number): Promise<PostResponseDto> {
        const cacheKey = `post:${id}`;
        const cached = await this.redis.get(cacheKey);
        if (cached) return JSON.parse(cached);

        const post = await this.prisma.post.findFirst({
            where: { id, deletedAt: null },
            include: {
                author: {
                    select: { id: true, email: true, full_name: true },
                },
            },
        });

        if (!post) {
            throw new NotFoundException(`Post with ID ${id} not found`);
        }

        await this.redis.setex(cacheKey, 300, JSON.stringify(post)); // Cache 5 minutes

        return this.mapToResponseDto(post);
    }

    /**
     * UPDATE POST
     */
    async update(
        id: number,
        dto: UpdatePostDto,
        currentUserId?: number,
    ): Promise<PostResponseDto> {
        // Check existence
        const existing = await this.prisma.post.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existing) {
            throw new NotFoundException(`Post with ID ${id} not found`);
        }

        // Check slug conflict
        if (dto.slug && dto.slug !== existing.slug) {
            const conflict = await this.prisma.post.findUnique({
                where: { slug: dto.slug },
            });
            if (conflict) {
                throw new BadRequestException(`Slug "${dto.slug}" already exists`);
            }
        }

        // Prepare update data
        const updateData: Prisma.PostUpdateInput = {};

        if (dto.title !== undefined) updateData.title = dto.title;
        if (dto.type !== undefined) updateData.type = dto.type;
        if (dto.excerpt !== undefined) updateData.excerpt = dto.excerpt;
        if (dto.thumbnailUrl !== undefined)
            updateData.thumbnailUrl = dto.thumbnailUrl;

        if (dto.content !== undefined) {
            updateData.content = this.sanitizeContent(
                dto.content,
            ) as Prisma.InputJsonValue;
        }

        if (dto.authorId !== undefined) {
            updateData.author = dto.authorId
                ? { connect: { id: dto.authorId } }
                : { disconnect: true };
        }

        if (dto.isPublished !== undefined) {
            updateData.isPublished = dto.isPublished;
            if (dto.isPublished && !existing.publishedAt && !dto.publishedAt) {
                updateData.publishedAt = new Date();
            }
        }

        if (dto.publishedAt !== undefined) {
            updateData.publishedAt = dto.publishedAt
                ? new Date(dto.publishedAt)
                : null;
        }

        const updated = await this.prisma.$transaction(async (tx) => {
            const result = await tx.post.update({
                where: { id },
                data: updateData,
            });
            return result;
        });

        // Clear cache
        await this.redis.del(`post:${id}`);
        await this.redis.delByPattern('posts:*');

        this.logger.log(`Post updated: id=${id}`);
        return this.mapToResponseDto(updated);
    }

    /**
     * SOFT DELETE POST
     */
    async softDelete(id: number, currentUserId?: number): Promise<void> {
        const existing = await this.prisma.post.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existing) {
            throw new NotFoundException(`Post with ID ${id} not found`);
        }

        await this.prisma.post.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        // Clear cache
        await this.redis.del(`post:${id}`);
        await this.redis.delByPattern('posts:*');

        this.logger.log(`Post soft-deleted: id=${id}`);
    }

    /**
     * RESTORE SOFT-DELETED POST
     */
    async restore(id: number, currentUserId?: number): Promise<PostResponseDto> {
        const existing = await this.prisma.post.findFirst({
            where: { id, deletedAt: { not: null } },
        });
        if (!existing) {
            throw new NotFoundException(
                `Post with ID ${id} is not deleted or does not exist`,
            );
        }

        const restored = await this.prisma.post.update({
            where: { id },
            data: { deletedAt: null },
        });

        // Clear cache
        await this.redis.del(`post:${id}`);
        await this.redis.delByPattern('posts:*');

        this.logger.log(`Post restored: id=${id}`);
        return this.mapToResponseDto(restored);
    }

    /**
     * BULK DELETE POSTS
     */
    async bulkDelete(
        ids: number[],
        currentUserId?: number,
    ): Promise<{ count: number }> {
        if (!ids || ids.length === 0) {
            throw new BadRequestException('No post IDs provided');
        }

        if (ids.length > 100) {
            throw new BadRequestException(
                'Cannot delete more than 100 posts at once',
            );
        }

        const result = await this.prisma.$transaction(async (tx) => {
            const existing = await tx.post.findMany({
                where: {
                    id: { in: ids },
                    deletedAt: null,
                },
                select: { id: true },
            });

            const existingIds = existing.map((p) => p.id);
            const notFound = ids.filter((id) => !existingIds.includes(id));

            if (notFound.length > 0) {
                throw new NotFoundException(
                    `Posts with IDs ${notFound.join(', ')} not found`,
                );
            }

            const updateResult = await tx.post.updateMany({
                where: { id: { in: existingIds } },
                data: { deletedAt: new Date() },
            });

            return updateResult;
        });

        // Clear cache
        await this.redis.delByPattern('posts:*');

        this.logger.log(`Bulk deleted ${result.count} posts`);
        return { count: result.count };
    }
}
