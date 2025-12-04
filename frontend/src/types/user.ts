export interface UserProfile {
    id: number;
    email: string;
    name: string;
    avatarUrl?: string;
    bio?: string;
    preferences?: Record<string, any>;
}

export interface UserPermission {
    code: string;
    name: string;
    module: string;
}

export interface UserRole {
    id: number;
    code: string;
    name: string;
    permissions: UserPermission[];
}
