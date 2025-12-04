export type PostType = 'PAGE' | 'BLOG' | 'NEWS';

export interface Post {
    id: number;
    type: PostType;
    slug: string;
    title: string;
    excerpt: string;
    content: any; // JSON content from Prisma
    thumbnailUrl?: string;
    authorId?: number;
    isPublished: boolean;
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
    status: string; // Added for UI compatibility
}

export interface CreatePostDto {
    type: PostType;
    slug: string;
    title: string;
    excerpt?: string;
    content: any;
    thumbnailUrl?: string;
}
