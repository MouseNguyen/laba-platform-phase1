import { apiClient } from './client';
import { User } from '@/types/auth';

export const usersApi = {
    async getAllUsers(page = 1, limit = 10): Promise<User[]> {
        const response = await apiClient.get('/admin/users', {
            params: { page, limit },
        });
        return response.data.data;
    },

    async getUserById(id: number): Promise<User> {
        const response = await apiClient.get(`/admin/users/${id}`);
        return response.data.data;
    },

    async lockUser(id: number): Promise<void> {
        await apiClient.put(`/admin/users/${id}/lock`);
    },

    async unlockUser(id: number): Promise<void> {
        await apiClient.put(`/admin/users/${id}/unlock`);
    },

    async updateUserRoles(id: number, roleIds: number[]): Promise<void> {
        await apiClient.put(`/admin/users/${id}/roles`, { roleIds });
    },
};
