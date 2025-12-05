'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import StandardLayout from '@/components/StandardLayout';
import { postsApi } from '@/lib/api/posts';
import { Post } from '@/lib/types';

export default function BlogPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchPosts() {
            try {
                setLoading(true);
                const data = await postsApi.getPublishedBlogs(20);
                setPosts(data);
            } catch (err: any) {
                console.error('Failed to fetch blog posts:', err);
                setError('Không thể tải bài viết. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        }
        fetchPosts();
    }, []);

    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return 'Chưa xuất bản';
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getReadTime = (content: string | undefined) => {
        if (!content) return '3 phút đọc';
        const words = content.split(/\s+/).length;
        const minutes = Math.ceil(words / 200);
        return `${minutes} phút đọc`;
    };

    return (
        <StandardLayout>
            {/* Hero Section - Full Width with Gradient */}
            <div style={{
                position: 'relative',
                marginTop: '-32px',
                marginLeft: 'calc(-50vw + 50%)',
                marginRight: 'calc(-50vw + 50%)',
                width: '100vw',
                background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 50%, #fef3c7 100%)',
                padding: '80px 20px',
                marginBottom: '60px',
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'white',
                        padding: '8px 20px',
                        borderRadius: '100px',
                        boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
                        marginBottom: '24px',
                    }}>
                        <span style={{ fontSize: '18px' }}>🌿</span>
                        <span style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#059669',
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                        }}>
                            Laba Journal
                        </span>
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(36px, 6vw, 56px)',
                        fontWeight: 800,
                        color: '#0f172a',
                        lineHeight: 1.1,
                        marginBottom: '20px',
                        fontFamily: 'Georgia, serif',
                    }}>
                        Chuyện kể từ Nông trại
                    </h1>

                    <p style={{
                        fontSize: '18px',
                        color: '#475569',
                        lineHeight: 1.7,
                        maxWidth: '600px',
                        margin: '0 auto',
                    }}>
                        Nơi chúng tôi chia sẻ về hành trình canh tác bền vững, văn hóa bản địa
                        và những khoảnh khắc bình yên giữa thiên nhiên.
                    </p>

                    {/* Decorative Elements */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '32px',
                        marginTop: '40px',
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '28px', marginBottom: '4px' }}>☕</div>
                            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Cà phê</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '28px', marginBottom: '4px' }}>🌾</div>
                            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Nông trại</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '28px', marginBottom: '4px' }}>🏡</div>
                            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Homestay</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                    gap: '32px',
                    marginBottom: '60px',
                }}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} style={{
                            background: '#f8fafc',
                            borderRadius: '24px',
                            overflow: 'hidden',
                        }}>
                            <div style={{
                                height: '220px',
                                background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
                                backgroundSize: '200% 100%',
                                animation: 'shimmer 1.5s infinite',
                            }} />
                            <div style={{ padding: '24px' }}>
                                <div style={{ height: '16px', background: '#e2e8f0', borderRadius: '8px', width: '40%', marginBottom: '12px' }} />
                                <div style={{ height: '24px', background: '#e2e8f0', borderRadius: '8px', width: '90%', marginBottom: '12px' }} />
                                <div style={{ height: '16px', background: '#e2e8f0', borderRadius: '8px', width: '70%' }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Error State */}
            {error && (
                <div style={{
                    textAlign: 'center',
                    padding: '80px 20px',
                    background: 'linear-gradient(135deg, #fef2f2, #fff1f2)',
                    borderRadius: '32px',
                    marginBottom: '60px',
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>😔</div>
                    <p style={{ color: '#dc2626', fontSize: '16px', fontWeight: 500, marginBottom: '20px' }}>{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '14px 32px',
                            background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '100px',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 4px 20px rgba(220, 38, 38, 0.3)',
                        }}
                    >
                        Thử lại
                    </button>
                </div>
            )}

            {/* Posts Grid */}
            {!loading && !error && posts.length > 0 && (
                <div style={{ marginBottom: '80px' }}>
                    {/* Featured Post */}
                    <article style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '48px',
                        alignItems: 'center',
                        marginBottom: '80px',
                        padding: '48px',
                        background: 'linear-gradient(135deg, #fafaf9 0%, #f5f5f4 100%)',
                        borderRadius: '32px',
                    }}>
                        <div style={{
                            position: 'relative',
                            aspectRatio: '4/3',
                            borderRadius: '24px',
                            overflow: 'hidden',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                        }}>
                            {posts[0].thumbnailUrl ? (
                                <img
                                    src={posts[0].thumbnailUrl}
                                    alt={posts[0].title}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        transition: 'transform 0.6s ease',
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                />
                            ) : (
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    background: 'linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <span style={{ fontSize: '64px', opacity: 0.5 }}>🌿</span>
                                </div>
                            )}
                            <div style={{
                                position: 'absolute',
                                top: '16px',
                                left: '16px',
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                color: 'white',
                                padding: '6px 14px',
                                borderRadius: '100px',
                                fontSize: '12px',
                                fontWeight: 600,
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                            }}>
                                ✨ Bài mới nhất
                            </div>
                        </div>

                        <div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginBottom: '16px',
                            }}>
                                <span style={{
                                    fontSize: '13px',
                                    color: '#64748b',
                                    fontWeight: 500,
                                }}>
                                    📅 {formatDate(posts[0].publishedAt)}
                                </span>
                                <span style={{ color: '#cbd5e1' }}>•</span>
                                <span style={{
                                    fontSize: '13px',
                                    color: '#64748b',
                                    fontWeight: 500,
                                }}>
                                    ⏱ {getReadTime(posts[0].content)}
                                </span>
                            </div>

                            <h2 style={{
                                fontSize: 'clamp(24px, 4vw, 36px)',
                                fontWeight: 700,
                                color: '#0f172a',
                                lineHeight: 1.3,
                                marginBottom: '16px',
                                fontFamily: 'Georgia, serif',
                            }}>
                                <Link
                                    href={`/blog/${posts[0].slug}`}
                                    style={{
                                        color: 'inherit',
                                        textDecoration: 'none',
                                        transition: 'color 0.3s',
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.color = '#059669'}
                                    onMouseOut={(e) => e.currentTarget.style.color = '#0f172a'}
                                >
                                    {posts[0].title}
                                </Link>
                            </h2>

                            <p style={{
                                fontSize: '16px',
                                color: '#64748b',
                                lineHeight: 1.8,
                                marginBottom: '24px',
                            }}>
                                {posts[0].excerpt}
                            </p>

                            <Link
                                href={`/blog/${posts[0].slug}`}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '14px 28px',
                                    background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                                    color: 'white',
                                    borderRadius: '100px',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 20px rgba(15, 23, 42, 0.2)',
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(15, 23, 42, 0.3)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(15, 23, 42, 0.2)';
                                }}
                            >
                                Đọc bài viết
                                <span style={{ fontSize: '16px' }}>→</span>
                            </Link>
                        </div>
                    </article>

                    {/* Section Title */}
                    {posts.length > 1 && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            marginBottom: '40px',
                        }}>
                            <h3 style={{
                                fontSize: '24px',
                                fontWeight: 700,
                                color: '#0f172a',
                            }}>
                                Bài viết khác
                            </h3>
                            <div style={{
                                flex: 1,
                                height: '1px',
                                background: 'linear-gradient(90deg, #e2e8f0, transparent)',
                            }} />
                        </div>
                    )}

                    {/* Other Posts Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                        gap: '32px',
                    }}>
                        {posts.slice(1).map((post) => (
                            <article
                                key={post.id}
                                style={{
                                    background: 'white',
                                    borderRadius: '24px',
                                    overflow: 'hidden',
                                    border: '1px solid #f1f5f9',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-8px)';
                                    e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.1)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                                    <div style={{
                                        position: 'relative',
                                        aspectRatio: '16/10',
                                        overflow: 'hidden',
                                    }}>
                                        {post.thumbnailUrl ? (
                                            <img
                                                src={post.thumbnailUrl}
                                                alt={post.title}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    transition: 'transform 0.5s ease',
                                                }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: '100%',
                                                height: '100%',
                                                background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}>
                                                <span style={{ fontSize: '48px', opacity: 0.4 }}>📝</span>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ padding: '24px' }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            marginBottom: '12px',
                                        }}>
                                            <span style={{
                                                background: '#ecfdf5',
                                                color: '#059669',
                                                padding: '4px 12px',
                                                borderRadius: '100px',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                            }}>
                                                {post.type}
                                            </span>
                                            <span style={{
                                                fontSize: '12px',
                                                color: '#94a3b8',
                                            }}>
                                                {formatDate(post.publishedAt)}
                                            </span>
                                        </div>

                                        <h3 style={{
                                            fontSize: '20px',
                                            fontWeight: 700,
                                            color: '#0f172a',
                                            lineHeight: 1.4,
                                            marginBottom: '12px',
                                            fontFamily: 'Georgia, serif',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                        }}>
                                            {post.title}
                                        </h3>

                                        <p style={{
                                            fontSize: '14px',
                                            color: '#64748b',
                                            lineHeight: 1.7,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            marginBottom: '16px',
                                        }}>
                                            {post.excerpt}
                                        </p>

                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            color: '#059669',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                        }}>
                                            Đọc tiếp
                                            <span>→</span>
                                        </div>
                                    </div>
                                </Link>
                            </article>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && posts.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '100px 20px',
                    background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
                    borderRadius: '32px',
                }}>
                    <div style={{ fontSize: '64px', marginBottom: '24px' }}>🌱</div>
                    <h3 style={{
                        fontSize: '24px',
                        fontWeight: 700,
                        color: '#0f172a',
                        marginBottom: '12px',
                    }}>
                        Chưa có bài viết nào
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '16px' }}>
                        Chúng tôi đang chuẩn bị những câu chuyện thú vị. Hãy quay lại sau nhé!
                    </p>
                </div>
            )}

            {/* Newsletter Section */}
            <div style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                borderRadius: '32px',
                padding: '60px 40px',
                textAlign: 'center',
                marginBottom: '40px',
            }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>✉️</div>
                <h3 style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    color: 'white',
                    marginBottom: '12px',
                }}>
                    Đăng ký nhận bài viết mới
                </h3>
                <p style={{
                    color: '#94a3b8',
                    fontSize: '16px',
                    marginBottom: '32px',
                    maxWidth: '400px',
                    margin: '0 auto 32px',
                }}>
                    Nhận thông báo khi có bài viết mới từ Laba Farm
                </p>
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    maxWidth: '400px',
                    margin: '0 auto',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                }}>
                    <input
                        type="email"
                        placeholder="Email của bạn"
                        style={{
                            flex: 1,
                            minWidth: '200px',
                            padding: '16px 24px',
                            borderRadius: '100px',
                            border: 'none',
                            fontSize: '14px',
                            background: 'rgba(255,255,255,0.1)',
                            color: 'white',
                            outline: 'none',
                        }}
                    />
                    <button style={{
                        padding: '16px 32px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '100px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
                    }}>
                        Đăng ký
                    </button>
                </div>
            </div>

            {/* CSS for shimmer animation */}
            <style jsx>{`
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>
        </StandardLayout>
    );
}
