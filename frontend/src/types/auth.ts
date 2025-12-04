export interface User {
    id: number;
    email: string;
    full_name: string;
    roles: string[];
    isLocked?: boolean;
    createdAt?: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}
