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

    // Public API - Get published blog posts
    getPublishedBlogs: async (limit: number = 20) => {
        const response = await apiClient.get<PaginatedPostsResponse>('/posts', {
            params: { type: 'BLOG', limit },
        });
        return response.data.items;
    },

    // Public API - Get post by slug
    getBySlug: async (slug: string) => {
        const response = await apiClient.get<Post>(`/posts/slug/${slug}`);
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
        const response = await apiClient.post<UploadResponse>('/cms/uploads/image', formData);
        return response.data;
    },
};
