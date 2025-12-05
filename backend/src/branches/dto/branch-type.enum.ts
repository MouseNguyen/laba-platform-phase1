// backend/src/branches/dto/branch-type.enum.ts

/**
 * Branch types for Laba Platform
 * FARM: Agricultural farm with tours, activities
 * HOMESTAY: Accommodation facility
 * CAFE: Coffee shop with retail
 * SHOP: Retail store for products
 */
export const BRANCH_TYPES = ['FARM', 'HOMESTAY', 'CAFE', 'SHOP'] as const;
export type BranchType = (typeof BRANCH_TYPES)[number];

export enum BranchTypeEnum {
  FARM = 'FARM',
  HOMESTAY = 'HOMESTAY',
  CAFE = 'CAFE',
  SHOP = 'SHOP',
}
