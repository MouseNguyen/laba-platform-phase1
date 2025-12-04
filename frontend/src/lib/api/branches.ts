import { apiClient } from './client';
import { Branch, CreateBranchDto } from '@/types/branch';

export const branchesApi = {
    async getAllBranches(): Promise<Branch[]> {
        const response = await apiClient.get('/branches');
        return response.data.data;
    },

    async getBranchById(id: number): Promise<Branch> {
        const response = await apiClient.get(`/branches/${id}`);
        return response.data.data;
    },

    async createBranch(branchData: CreateBranchDto): Promise<Branch> {
        const response = await apiClient.post('/branches', branchData);
        return response.data.data;
    },

    async updateBranch(id: number, branchData: Partial<CreateBranchDto>): Promise<Branch> {
        const response = await apiClient.put(`/branches/${id}`, branchData);
        return response.data.data;
    },

    async deleteBranch(id: number): Promise<void> {
        await apiClient.delete(`/branches/${id}`);
    },
};
