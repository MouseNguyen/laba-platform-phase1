'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import StandardLayout from '@/components/StandardLayout';
import { postsApi } from '@/lib/api/posts';
import { Post } from '@/lib/types';

export default function BlogPostPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchPost() {
            if (!slug) return;
            try {
                setLoading(true);
                const data = await postsApi.getBySlug(slug);
                setPost(data);
            } catch (err: any) {
                console.error('Failed to fetch post:', err);
                if (err.response?.status === 404) {
                    setError('Bài viết không tồn tại.');
                } else {
                    setError('Không thể tải bài viết. Vui lòng thử lại sau.');
                }
            } finally {
                setLoading(false);
            }
        }
        fetchPost();
    }, [slug]);

    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Render content blocks (simplified - supports paragraph, header, list)
    const renderContent = (content: Record<string, any>) => {
        if (!content || !content.blocks) return null;

        return content.blocks.map((block: any, index: number) => {
            switch (block.type) {
                case 'paragraph':
                    return (
                        <p key={index} className="text-slate-700 leading-8 mb-6 text-lg font-light">
                            {block.data?.text || ''}
                        </p>
                    );
                case 'header':
                    const level = block.data?.level || 2;
                    const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
                    return (
                        <HeadingTag key={index} className="font-serif font-bold text-slate-900 mb-4 mt-10 text-3xl">
                            {block.data?.text || ''}
                        </HeadingTag>
                    );
                case 'list':
                    const items = block.data?.items || [];
                    return (
                        <ul key={index} className="list-disc list-inside text-slate-700 mb-6 space-y-3 pl-4 text-lg">
                            {items.map((item: string, i: number) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    );
                case 'image':
                    return (
                        <figure key={index} className="my-10 -mx-4 md:-mx-10 lg:-mx-20">
                            <img
                                src={block.data?.file?.url || block.data?.url}
                                alt={block.data?.caption || ''}
                                className="w-full rounded-2xl shadow-lg"
                            />
                            {block.data?.caption && (
                                <figcaption className="text-center text-sm text-slate-500 mt-3 italic font-serif">
                                    {block.data.caption}
                                </figcaption>
                            )}
                        </figure>
                    );
                default:
                    return null;
            }
        });
    };

    if (loading) {
        return (
            <StandardLayout>
                <div className="max-w-3xl mx-auto py-20 animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-1/4 mb-8"></div>
                    <div className="h-12 bg-slate-200 rounded w-3/4 mb-6"></div>
                    <div className="h-6 bg-slate-200 rounded w-full mb-12"></div>
                    <div className="aspect-video bg-slate-200 rounded-2xl mb-12"></div>
                    <div className="space-y-4">
                        <div className="h-4 bg-slate-200 rounded w-full"></div>
                        <div className="h-4 bg-slate-200 rounded w-full"></div>
                        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                    </div>
                </div>
            </StandardLayout>
        );
    }

    if (error || !post) {
        return (
            <StandardLayout>
                <div className="text-center py-32">
                    <h1 className="text-6xl mb-6">🍂</h1>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4 font-serif">
                        {error || 'Bài viết không tồn tại'}
                    </h2>
                    <p className="text-slate-600 mb-10 text-lg">
                        Có thể bài viết đã bị xóa hoặc đường dẫn không chính xác.
                    </p>
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-700 text-white rounded-full hover:bg-emerald-800 transition-all shadow-lg hover:shadow-emerald-200"
                    >
                        ← Quay lại Blog
                    </Link>
                </div>
            </StandardLayout>
        );
    }

    return (
        <StandardLayout>
            <article className="max-w-4xl mx-auto pb-20">
                {/* Breadcrumb */}
                <nav className="mb-10 flex justify-center">
                    <ol className="flex items-center gap-2 text-sm text-slate-500 uppercase tracking-wider font-medium">
                        <li>
                            <Link href="/" className="hover:text-emerald-600 transition-colors">Trang chủ</Link>
                        </li>
                        <li className="text-slate-300">/</li>
                        <li>
                            <Link href="/blog" className="hover:text-emerald-600 transition-colors">Blog</Link>
                        </li>
                    </ol>
                </nav>

                {/* Header */}
                <header className="text-center max-w-3xl mx-auto mb-12">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <span className="bg-emerald-50 text-emerald-700 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-emerald-100">
                            {post.type}
                        </span>
                        {post.publishedAt && (
                            <span className="text-slate-400 text-sm font-medium">
                                {formatDate(post.publishedAt)}
                            </span>
                        )}
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-8 font-serif leading-tight">
                        {post.title}
                    </h1>
                    {post.excerpt && (
                        <p className="text-xl md:text-2xl text-slate-600 leading-relaxed font-light italic">
                            "{post.excerpt}"
                        </p>
                    )}
                </header>

                {/* Author & Meta */}
                {post.author && (
                    <div className="flex items-center justify-center gap-4 mb-12 border-y border-slate-100 py-6">
                        <div className="h-12 w-12 rounded-full bg-slate-200 overflow-hidden ring-2 ring-white shadow-md">
                            <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-lg font-bold">
                                {post.author.name?.charAt(0) || post.author.email.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                                {post.author.name || post.author.email}
                            </p>
                            <p className="text-xs text-slate-500 font-medium">Tác giả</p>
                        </div>
                    </div>
                )}

                {/* Thumbnail */}
                {post.thumbnailUrl && (
                    <div className="mb-16 -mx-4 md:-mx-10 lg:-mx-20 rounded-3xl overflow-hidden shadow-2xl">
                        <img
                            src={post.thumbnailUrl}
                            alt={post.title}
                            className="w-full h-auto object-cover"
                        />
                    </div>
                )}

                {/* Content */}
                <div className="prose prose-lg prose-slate max-w-2xl mx-auto prose-headings:font-serif prose-headings:font-bold prose-p:font-light prose-a:text-emerald-600 hover:prose-a:text-emerald-700 prose-img:rounded-xl">
                    {typeof post.content === 'object' ? (
                        renderContent(post.content)
                    ) : (
                        <p className="text-slate-700 leading-8 text-lg">{String(post.content)}</p>
                    )}
                </div>

                {/* Footer / Share */}
                <div className="max-w-2xl mx-auto mt-20 pt-10 border-t border-slate-200 text-center">
                    <p className="text-slate-500 italic mb-8 font-serif">
                        Cảm ơn bạn đã đọc bài viết này. Hãy chia sẻ nếu bạn thấy hữu ích!
                    </p>
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-bold uppercase tracking-wide text-sm group"
                    >
                        <span className="group-hover:-translate-x-1 transition-transform">←</span> Quay lại Blog
                    </Link>
                </div>
            </article>
        </StandardLayout>
    );
}
