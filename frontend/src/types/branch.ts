export type BranchType = 'FARM' | 'HOMESTAY' | 'CAFE' | 'SHOP';

export interface Branch {
    id: number;
    code: string;
    name: string;
    type: BranchType;
    settings?: Record<string, any>;
    isActive: boolean;
    address?: string;
    phone?: string;
    createdAt: string;
    updatedAt: string;
    location?: string; // Added for UI compatibility
    status?: string; // Added for UI compatibility
}

export interface CreateBranchDto {
    code: string;
    name: string;
    type: BranchType;
    settings?: Record<string, any>;
    address?: string;
    phone?: string;
}
