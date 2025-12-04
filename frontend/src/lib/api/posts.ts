import apiClient from '@/lib/apiClient';
import { Post, CreatePostRequest, UpdatePostRequest, UploadResponse, PaginatedPostsResponse } from '@/lib/types';

export const postsApi = {
    getAll: async () => {
        const response = await apiClient.get<PaginatedPostsResponse>('/cms/posts');
        return response.data.items;
    },

    getOne: async (id: number) => {
        const response = await apiClient.get<Post>(`/cms/posts/${id}`);
        return response.data;
    },

    create: async (data: CreatePostRequest) => {
        const response = await apiClient.post<Post>('/cms/posts', data);
        return response.data;
    },

    update: async (id: number, data: UpdatePostRequest) => {
        const response = await apiClient.patch<Post>(`/cms/posts/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        await apiClient.delete(`/cms/posts/${id}`);
    },

    uploadImage: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post<UploadResponse>('/cms/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};
