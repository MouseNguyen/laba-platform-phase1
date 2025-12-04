'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { postsApi } from '@/lib/api/posts';
import { PostTypeEnum } from '@/lib/types';

export default function CreatePostPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        type: PostTypeEnum.BLOG,
        isPublished: false,
    });

    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Auto-generate slug from title
        if (name === 'title' && !formData.slug) {
            const slug = value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
            setFormData((prev) => ({ ...prev, slug }));
        }
    };

    const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData((prev) => ({ ...prev, [name]: checked }));
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setThumbnail(file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            let thumbnailUrl = '';
            if (thumbnail) {
                const uploadRes = await postsApi.uploadImage(thumbnail);
                thumbnailUrl = uploadRes.url;
            }

            await postsApi.create({
                title: formData.title,
                slug: formData.slug,
                excerpt: formData.excerpt,
                type: formData.type,
                isPublished: formData.isPublished,
                thumbnailUrl: thumbnailUrl || undefined,
                content: {
                    blocks: [
                        {
                            type: 'paragraph',
                            data: { text: formData.content }
                        }
                    ]
                }, // Simple wrapper for now
            });

            router.push('/posts');
        } catch (err: any) {
            console.error('Failed to create post:', err);
            setError(err.response?.data?.message || 'Failed to create post');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f1f5f9' }}>Create New Post</h1>
                <Link href="/posts" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                    ← Back to Posts
                </Link>
            </div>

            {error && (
                <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderRadius: '8px', marginBottom: '1.5rem' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Title */}
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(71, 85, 105, 0.5)', color: '#fff' }}
                    />
                </div>

                {/* Slug */}
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Slug</label>
                    <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleInputChange}
                        required
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(71, 85, 105, 0.5)', color: '#fff' }}
                    />
                </div>

                {/* Type */}
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Type</label>
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(71, 85, 105, 0.5)', color: '#fff' }}
                    >
                        <option value={PostTypeEnum.BLOG}>Blog</option>
                        <option value={PostTypeEnum.NEWS}>News</option>
                        <option value={PostTypeEnum.PAGE}>Page</option>
                    </select>
                </div>

                {/* Status (isPublished) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                        type="checkbox"
                        name="isPublished"
                        id="isPublished"
                        checked={formData.isPublished}
                        onChange={handleCheckboxChange}
                        style={{ width: '1.25rem', height: '1.25rem' }}
                    />
                    <label htmlFor="isPublished" style={{ color: '#cbd5e1', cursor: 'pointer' }}>Publish immediately</label>
                </div>

                {/* Thumbnail */}
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Thumbnail Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ color: '#cbd5e1' }}
                    />
                    {thumbnailPreview && (
                        <div style={{ marginTop: '1rem' }}>
                            <img src={thumbnailPreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }} />
                        </div>
                    )}
                </div>

                {/* Excerpt */}
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Excerpt</label>
                    <textarea
                        name="excerpt"
                        value={formData.excerpt}
                        onChange={handleInputChange}
                        rows={3}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(71, 85, 105, 0.5)', color: '#fff' }}
                    />
                </div>

                {/* Content */}
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Content</label>
                    <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleInputChange}
                        rows={10}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(71, 85, 105, 0.5)', color: '#fff' }}
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                        padding: '1rem',
                        background: isLoading ? '#059669' : '#10b981',
                        color: '#020617',
                        fontWeight: 'bold',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                    }}
                >
                    {isLoading ? 'Creating...' : 'Create Post'}
                </button>
            </form>
        </div>
    );
}
