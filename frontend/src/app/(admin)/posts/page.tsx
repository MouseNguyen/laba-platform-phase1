'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { postsApi } from '@/lib/api/posts';
import { Post } from '@/lib/types';

export default function PostsPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const data = await postsApi.getAll();
            setPosts(data);
        } catch (err: any) {
            console.error('Failed to fetch posts:', err);
            const msg = err.response?.data?.message || err.message || 'Failed to load posts';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;

        setDeletingId(id);
        try {
            await postsApi.delete(id);
            setPosts(posts.filter(p => p.id !== id));
        } catch (err: any) {
            console.error('Failed to delete post:', err);
            alert('Failed to delete post: ' + (err.response?.data?.message || err.message));
        } finally {
            setDeletingId(null);
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#94a3b8' }}>
                <div style={{ animation: 'spin 1s linear infinite', border: '2px solid #1e293b', borderTop: '2px solid #10b981', borderRadius: '50%', width: '24px', height: '24px', marginRight: '0.5rem' }}></div>
                Loading posts...
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>
                        Post Management
                    </h1>
                    <p style={{ color: '#64748b' }}>Manage your blog posts, news, and pages.</p>
                </div>
                <Link
                    href="/posts/create"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#10b981',
                        color: '#020617',
                        borderRadius: '12px',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        textDecoration: 'none',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                        transition: 'transform 0.2s',
                    }}
                >
                    <span>+</span> Create New Post
                </Link>
            </div>

            {error && (
                <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderRadius: '12px', marginBottom: '2rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    {error}
                </div>
            )}

            <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
                {posts.length === 0 ? (
                    <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '0.5rem' }}>No posts found</h3>
                        <p style={{ marginBottom: '2rem' }}>Get started by creating your first post.</p>
                        <Link
                            href="/posts/create"
                            style={{ color: '#10b981', fontWeight: 600, textDecoration: 'none' }}
                        >
                            Create Post →
                        </Link>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #334155', background: '#0f172a' }}>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>Post</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>Status</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>Date</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.map((post) => (
                                <tr key={post.id} style={{ borderBottom: '1px solid #334155', transition: 'background 0.2s' }} className="hover:bg-slate-800/50">
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#334155', flexShrink: 0 }}>
                                                {post.thumbnailUrl ? (
                                                    <img src={post.thumbnailUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.75rem' }}>No Img</div>
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: '#f1f5f9', marginBottom: '0.25rem' }}>{post.title}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{post.slug}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                backgroundColor: post.isPublished ? 'rgba(16, 185, 129, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                                                color: post.isPublished ? '#10b981' : '#eab308',
                                                border: post.isPublished ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(234, 179, 8, 0.2)',
                                            }}
                                        >
                                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor', marginRight: '0.5rem' }}></span>
                                            {post.isPublished ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                                        {new Date(post.updatedAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                            <Link
                                                href={`/posts/${post.id}/edit`}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    fontSize: '0.875rem',
                                                    fontWeight: 500,
                                                    color: '#f1f5f9',
                                                    textDecoration: 'none',
                                                    backgroundColor: '#334155',
                                                    borderRadius: '6px',
                                                    transition: 'background 0.2s',
                                                }}
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(post.id)}
                                                disabled={deletingId === post.id}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    fontSize: '0.875rem',
                                                    fontWeight: 500,
                                                    color: '#f87171',
                                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    transition: 'background 0.2s',
                                                }}
                                            >
                                                {deletingId === post.id ? '...' : 'Delete'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
