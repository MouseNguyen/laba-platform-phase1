import { apiClient, setAccessToken } from './client';
import { User, LoginCredentials } from '@/types/auth';

export const authApi = {
    async login(credentials: LoginCredentials): Promise<{ access_token: string; user: User }> {
        const response = await apiClient.post('/auth/login', credentials);
        return response.data;
    },

    async logout(): Promise<void> {
        await apiClient.post('/auth/logout');
        setAccessToken(null);
    },

    async refreshToken(): Promise<{ access_token: string }> {
        const response = await apiClient.post('/auth/refresh');
        return response.data;
    },

    async getMe(): Promise<User> {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },
};
