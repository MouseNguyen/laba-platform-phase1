export type LandingKey =
  | 'hero'
  | 'farm'
  | 'homestay'
  | 'cafe'
  | 'about'
  | 'product_highlight';

export type LandingStatus = 'draft' | 'published' | 'archived';

export interface LandingBlock {
  key: LandingKey;
  title: string;
  subtitle?: string | null;
  short_story: string;
  image_url?: string | null;
  image_mobile_url?: string | null;
  image_alt?: string | null;
  story_link?: string | null;
  story_link_target?: '_self' | '_blank';
  sort_order: number;
  status: LandingStatus;
  locale: string;
  is_active: boolean;
}

export interface LandingResponse {
  locale: string;
  blocks: LandingBlock[];
}
