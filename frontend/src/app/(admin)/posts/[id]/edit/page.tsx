'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { postsApi } from '@/lib/api/posts';
import { PostTypeEnum, Post } from '@/lib/types';

export default function EditPostPage() {
    const router = useRouter();
    const params = useParams();
    const postId = Number(params.id);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
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
    const [existingThumbnail, setExistingThumbnail] = useState<string | null>(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const post = await postsApi.getOne(postId);
                setFormData({
                    title: post.title,
                    slug: post.slug,
                    excerpt: post.excerpt || '',
                    content: post.content?.blocks?.[0]?.data?.text || '',
                    type: post.type,
                    isPublished: post.isPublished,
                });
                if (post.thumbnailUrl) {
                    setExistingThumbnail(post.thumbnailUrl);
                    setThumbnailPreview(post.thumbnailUrl);
                }
            } catch (err) {
                console.error('Failed to fetch post:', err);
                setError('Không thể tải bài viết');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPost();
    }, [postId]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
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
        setIsSaving(true);
        setError(null);

        try {
            let thumbnailUrl = existingThumbnail || undefined;
            if (thumbnail) {
                const uploadRes = await postsApi.uploadImage(thumbnail);
                thumbnailUrl = uploadRes.url;
            }

            await postsApi.update(postId, {
                title: formData.title,
                slug: formData.slug,
                excerpt: formData.excerpt,
                type: formData.type,
                isPublished: formData.isPublished,
                thumbnailUrl: thumbnailUrl,
                content: {
                    blocks: [
                        {
                            type: 'paragraph',
                            data: { text: formData.content }
                        }
                    ]
                },
            });

            router.push('/posts');
        } catch (err: any) {
            console.error('Failed to update post:', err);
            setError(err.response?.data?.message || 'Không thể cập nhật bài viết');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div style={{ padding: '2rem', color: '#94a3b8' }}>Đang tải...</div>;
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f1f5f9' }}>Chỉnh sửa bài viết</h1>
                <Link href="/posts" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                    ← Quay lại
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
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Tiêu đề</label>
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
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Loại</label>
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(71, 85, 105, 0.5)', color: '#fff' }}
                    >
                        <option value={PostTypeEnum.BLOG}>Blog</option>
                        <option value={PostTypeEnum.NEWS}>Tin tức</option>
                        <option value={PostTypeEnum.PAGE}>Trang</option>
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
                    <label htmlFor="isPublished" style={{ color: '#cbd5e1', cursor: 'pointer' }}>Đã xuất bản</label>
                </div>

                {/* Thumbnail */}
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Ảnh đại diện</label>
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
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Mô tả ngắn</label>
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
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Nội dung</label>
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
                    disabled={isSaving}
                    style={{
                        padding: '1rem',
                        background: isSaving ? '#059669' : '#10b981',
                        color: '#020617',
                        fontWeight: 'bold',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: isSaving ? 'not-allowed' : 'pointer',
                    }}
                >
                    {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
            </form>
        </div>
    );
}
