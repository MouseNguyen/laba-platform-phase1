'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { postsApi } from '@/lib/api/posts';
import { Post } from '@/lib/types';

export default function PostsPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const data = await postsApi.getAll();
                setPosts(data);
            } catch (err) {
                console.error('Failed to fetch posts:', err);
                setError('Failed to load posts');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPosts();
    }, []);

    if (isLoading) {
        return <div style={{ padding: '2rem', color: '#94a3b8' }}>Loading posts...</div>;
    }

    if (error) {
        return <div style={{ padding: '2rem', color: '#f87171' }}>{error}</div>;
    }

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f1f5f9' }}>
                    Post Management
                </h1>
                <Link
                    href="/posts/create"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.5rem 1rem',
                        backgroundColor: '#10b981',
                        color: '#020617',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        textDecoration: 'none',
                    }}
                >
                    Create Post
                </Link>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(71, 85, 105, 0.5)', borderRadius: '8px', overflow: 'hidden' }}>
                {posts.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No posts found. Create one!</div>
                ) : (
                    <div>
                        {posts.map((post) => (
                            <div key={post.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(71, 85, 105, 0.5)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    {post.thumbnailUrl && (
                                        <img
                                            src={post.thumbnailUrl}
                                            alt={post.title}
                                            style={{ width: '48px', height: '48px', borderRadius: '4px', objectFit: 'cover' }}
                                        />
                                    )}
                                    <div>
                                        <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#f1f5f9', marginBottom: '0.25rem' }}>{post.title}</h3>
                                        <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                            Updated: {new Date(post.updatedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span
                                        style={{
                                            display: 'inline-flex',
                                            padding: '0.25rem 0.5rem',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            borderRadius: '9999px',
                                            backgroundColor: post.isPublished ? 'rgba(16, 185, 129, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                                            color: post.isPublished ? '#10b981' : '#eab308',
                                        }}
                                    >
                                        {post.isPublished ? 'PUBLISHED' : 'DRAFT'}
                                    </span>
                                    <Link href={`/posts/${post.id}/edit`} style={{ fontSize: '0.875rem', color: '#f1f5f9', cursor: 'pointer', textDecoration: 'none' }}>Edit</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
