/**
 * Post types for CMS content
 * PAGE: Static pages (About, Contact)
 * BLOG: Blog articles
 * NEWS: News/announcements
 */
export const POST_TYPES = ['PAGE', 'BLOG', 'NEWS'] as const;
export type PostType = (typeof POST_TYPES)[number];

// For Swagger UI
export enum PostTypeEnum {
    PAGE = 'PAGE',
    BLOG = 'BLOG',
    NEWS = 'NEWS',
}

// registerEnumType is not exported in some versions or requires specific setup.
// We will rely on ApiProperty({ enum: PostTypeEnum }) in DTOs.
/*
registerEnumType(PostTypeEnum, {
  name: 'PostType',
  description: 'Type of CMS content',
});
*/
