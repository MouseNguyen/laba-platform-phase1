// =============================================
// Laba Platform - Type Definitions
// =============================================

// ---------------------------------------------
// Landing Page Types
// ---------------------------------------------

export type LandingBlockKey =
  | 'hero'
  | 'farm'
  | 'homestay'
  | 'cafe'
  | 'about'
  | 'product_highlight';

export type LandingStatus = 'draft' | 'published' | 'archived';

// Backend có thể trả về 'SELF' | 'BLANK' hoặc '_self' | '_blank'
export type StoryLinkTarget = 'SELF' | 'BLANK' | '_self' | '_blank';

export interface LandingBlock {
  key: LandingBlockKey;
  title: string;
  subtitle?: string | null;
  short_story: string;
  image_url?: string | null;
  image_mobile_url?: string | null;
  image_alt?: string | null;
  story_link?: string | null;
  story_link_target?: StoryLinkTarget | null;
  sort_order: number;
  // Optional fields from backend (FE không cần render trực tiếp)
  status?: LandingStatus;
  locale?: string;
  is_active?: boolean;
}

export interface LandingResponse {
  locale: string;
  blocks: LandingBlock[];
}

// ---------------------------------------------
// User Types
// ---------------------------------------------

export interface User {
  id: number;
  email: string;
  full_name: string;
  roles: string[];
}

// ---------------------------------------------
// Auth Types
// ---------------------------------------------

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface RefreshResponse {
  access_token: string;
}

export interface LogoutResponse {
  message: string;
}

export interface RevokeAllResponse {
  message: string;
}

// ---------------------------------------------
// API Error Types
// ---------------------------------------------

export interface ApiError {
  message: string;
  statusCode: number;
  code?: string; // e.g., 'SESSION_COMPROMISED'
}

// ---------------------------------------------
// CMS Post Types
// ---------------------------------------------

export enum PostTypeEnum {
  PAGE = 'PAGE',
  BLOG = 'BLOG',
  NEWS = 'NEWS',
}

export interface Post {
  id: number;
  type: PostTypeEnum;
  slug: string;
  title: string;
  excerpt?: string;
  content: Record<string, any>;
  thumbnailUrl?: string;
  authorId?: number;
  author?: {
    id: number;
    email: string;
    name?: string;
  };
  isPublished: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreatePostRequest {
  type: PostTypeEnum;
  slug: string;
  title: string;
  excerpt?: string;
  content: Record<string, any>;
  thumbnailUrl?: string;
  authorId?: number;
  isPublished?: boolean;
  publishedAt?: string;
}

export interface UpdatePostRequest {
  type?: PostTypeEnum;
  slug?: string;
  title?: string;
  excerpt?: string;
  content?: Record<string, any>;
  thumbnailUrl?: string;
  authorId?: number;
  isPublished?: boolean;
  publishedAt?: string;
}

export interface UploadResponse {
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}

export interface PaginatedPostsResponse {
  items: Post[];
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
  nextPage?: string;
  prevPage?: string;
}
