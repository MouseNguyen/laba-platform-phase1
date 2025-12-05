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

    // Thumbnail state - support both file upload and URL input
    const [thumbnailMode, setThumbnailMode] = useState<'file' | 'url'>('file');
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);

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
                    setThumbnailUrl(post.thumbnailUrl);
                    setThumbnailPreview(post.thumbnailUrl);
                    setThumbnailMode('url');
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

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setThumbnailFile(file);
            setThumbnailPreview(URL.createObjectURL(file));
            setUploadError(null);
        }
    };

    const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setThumbnailUrl(url);
        setThumbnailPreview(url || null);
        setUploadError(null);
    };

    const handleModeChange = (mode: 'file' | 'url') => {
        setThumbnailMode(mode);
        setUploadError(null);
        if (mode === 'file') {
            setThumbnailPreview(thumbnailFile ? URL.createObjectURL(thumbnailFile) : null);
        } else {
            setThumbnailPreview(thumbnailUrl || null);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        setUploadError(null);

        try {
            let finalThumbnailUrl: string | undefined = undefined;

            if (thumbnailMode === 'file' && thumbnailFile) {
                // Upload file first
                try {
                    const uploadRes = await postsApi.uploadImage(thumbnailFile);
                    finalThumbnailUrl = uploadRes.url;
                } catch (uploadErr: any) {
                    console.error('Upload failed:', uploadErr);
                    setUploadError(uploadErr.response?.data?.message || 'Upload ảnh thất bại. Kiểm tra đăng nhập hoặc thử lại.');
                    setIsSaving(false);
                    return;
                }
            } else if (thumbnailMode === 'url' && thumbnailUrl) {
                // Use the provided URL directly
                finalThumbnailUrl = thumbnailUrl;
            }

            await postsApi.update(postId, {
                title: formData.title,
                slug: formData.slug,
                excerpt: formData.excerpt,
                type: formData.type,
                isPublished: formData.isPublished,
                thumbnailUrl: finalThumbnailUrl,
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
            const message = err.response?.data?.message;
            if (Array.isArray(message)) {
                setError(message.join(', '));
            } else {
                setError(message || 'Không thể cập nhật bài viết');
            }
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

                {/* Thumbnail - Mode Selector */}
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Ảnh đại diện</label>

                    {/* Mode Toggle */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <button
                            type="button"
                            onClick={() => handleModeChange('file')}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                border: 'none',
                                cursor: 'pointer',
                                background: thumbnailMode === 'file' ? '#10b981' : 'rgba(71, 85, 105, 0.5)',
                                color: thumbnailMode === 'file' ? '#020617' : '#cbd5e1',
                                fontWeight: 500,
                            }}
                        >
                            📁 Upload file
                        </button>
                        <button
                            type="button"
                            onClick={() => handleModeChange('url')}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                border: 'none',
                                cursor: 'pointer',
                                background: thumbnailMode === 'url' ? '#10b981' : 'rgba(71, 85, 105, 0.5)',
                                color: thumbnailMode === 'url' ? '#020617' : '#cbd5e1',
                                fontWeight: 500,
                            }}
                        >
                            🔗 Nhập URL
                        </button>
                    </div>

                    {/* File Upload Mode */}
                    {thumbnailMode === 'file' && (
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ color: '#cbd5e1' }}
                        />
                    )}

                    {/* URL Input Mode */}
                    {thumbnailMode === 'url' && (
                        <input
                            type="url"
                            placeholder="https://example.com/image.jpg"
                            value={thumbnailUrl}
                            onChange={handleUrlChange}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(71, 85, 105, 0.5)', color: '#fff' }}
                        />
                    )}

                    {/* Upload Error */}
                    {uploadError && (
                        <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderRadius: '4px', fontSize: '0.875rem' }}>
                            ⚠️ {uploadError}
                        </div>
                    )}

                    {/* Preview */}
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
