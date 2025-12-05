// =============================================
// Laba Platform - Landing Page (FE2)
// =============================================
// Server Component: fetch data từ backend
// Render các blocks: hero, farm, homestay, cafe, about
// =============================================

import Image from 'next/image';
import Link from 'next/link';
import type { LandingBlock, LandingResponse } from '@/lib/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// API Base URL
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000') + '/api/v1';

// Fetch landing data (Server-side)
async function getLandingData(locale: string = 'vi'): Promise<LandingResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/landing?locale=${locale}`, {
      cache: 'no-store', // Always fetch fresh data
    });

    if (!res.ok) {
      console.error(`Failed to fetch landing: ${res.status}`);
      return null;
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching landing:', error);
    return null;
  }
}

// Helper: Get link target attribute
function getLinkTarget(target?: string | null): '_self' | '_blank' {
  if (!target) return '_self';
  const normalized = target.toLowerCase();
  return normalized === 'blank' || normalized === '_blank' ? '_blank' : '_self';
}

// =============================================
// Hero Section Component
// =============================================
function HeroSection({ block }: { block: LandingBlock }) {
  return (
    <section
      id="section-hero"
      style={{
        position: 'relative',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: '#0f172a',
      }}
    >
      {/* Background Image */}
      {block.image_url && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
          }}
        >
          <Image
            src={block.image_url}
            alt={block.image_alt || block.title}
            fill
            priority
            style={{ objectFit: 'cover' }}
          />
          {/* Dark Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
            }}
          />
          {/* Gradient Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.3) 0%, rgba(15, 23, 42, 0.8) 100%)',
            }}
          />
        </div>
      )}

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1000px',
          padding: '2rem',
          textAlign: 'center',
          color: '#fff',
        }}
      >
        {/* Badge */}
        <div style={{ marginBottom: '2rem' }}>
          <span
            style={{
              display: 'inline-block',
              padding: '0.5rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#10b981',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '9999px',
              backdropFilter: 'blur(4px)',
            }}
          >
            🌿 Laba Platform
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: '1.5rem',
            textShadow: '0 4px 12px rgba(0,0,0,0.3)',
            letterSpacing: '-0.02em',
          }}
        >
          {block.title}
        </h1>

        {/* Subtitle */}
        {block.subtitle && (
          <p
            style={{
              fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)',
              color: '#e2e8f0',
              marginBottom: '2rem',
              fontWeight: 300,
              maxWidth: '800px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            {block.subtitle}
          </p>
        )}

        {/* Short Story */}
        <p
          style={{
            fontSize: '1.125rem',
            lineHeight: 1.8,
            color: '#cbd5e1',
            maxWidth: '700px',
            margin: '0 auto 3rem',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          }}
        >
          {block.short_story}
        </p>

        {/* Story Link */}
        {block.story_link && (
          <Link
            href={block.story_link}
            target={getLinkTarget(block.story_link_target)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem 2.5rem',
              fontSize: '1rem',
              fontWeight: 600,
              color: '#020617',
              background: '#10b981',
              borderRadius: '9999px',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
            }}
          >
            Khám phá ngay
            <span style={{ fontSize: '1.25rem' }}>→</span>
          </Link>
        )}
      </div>

      {/* Scroll indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#94a3b8',
          fontSize: '0.875rem',
          textAlign: 'center',
          zIndex: 10,
          opacity: 0.8,
        }}
      >
        <div style={{ marginBottom: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.75rem' }}>Cuộn xuống</div>
        <div style={{ fontSize: '1.5rem', animation: 'bounce 2s infinite' }}>↓</div>
      </div>
    </section>
  );
}

// =============================================
// Content Section Component (Farm, Homestay, Cafe, About)
// =============================================
function ContentSection({
  block,
  reverse = false,
  bgColor = '#0f172a',
}: {
  block: LandingBlock;
  reverse?: boolean;
  bgColor?: string;
}) {
  const sectionId = `section-${block.key}`;

  return (
    <section
      id={sectionId}
      style={{
        padding: '8rem 2rem',
        background: bgColor,
        color: '#f8fafc',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: reverse ? 'row-reverse' : 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '5rem',
        }}
      >
        {/* Image Side */}
        <div
          style={{
            flex: '1 1 500px',
            position: 'relative',
          }}
        >
          {block.image_url ? (
            <div
              style={{
                position: 'relative',
                aspectRatio: '4/3',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                transform: reverse ? 'rotate(2deg)' : 'rotate(-2deg)',
                transition: 'transform 0.5s ease',
              }}
            >
              <Image
                src={block.image_url}
                alt={block.image_alt || block.title}
                fill
                style={{ objectFit: 'cover' }}
              />
              {/* Glass overlay effect */}
              <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)' }} />
            </div>
          ) : (
            <div
              style={{
                aspectRatio: '4/3',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                fontSize: '1rem',
              }}
            >
              Hình ảnh đang được cập nhật
            </div>
          )}

          {/* Decorative element */}
          <div
            style={{
              position: 'absolute',
              top: '-20px',
              [reverse ? 'left' : 'right']: '-20px',
              width: '100px',
              height: '100px',
              background: 'rgba(16, 185, 129, 0.2)',
              borderRadius: '50%',
              filter: 'blur(40px)',
              zIndex: -1,
            }}
          />
        </div>

        {/* Content Side */}
        <div
          style={{
            flex: '1 1 400px',
          }}
        >
          {/* Block Key Badge */}
          <span
            style={{
              display: 'inline-block',
              marginBottom: '1.5rem',
              padding: '0.5rem 1rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#10b981',
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}
          >
            {block.key}
          </span>

          {/* Title */}
          <h2
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: '1.5rem',
              color: '#f1f5f9',
              letterSpacing: '-0.02em',
            }}
          >
            {block.title}
          </h2>

          {/* Subtitle */}
          {block.subtitle && (
            <p
              style={{
                fontSize: '1.25rem',
                color: '#94a3b8',
                marginBottom: '2rem',
                fontStyle: 'italic',
                borderLeft: '4px solid #10b981',
                paddingLeft: '1rem',
              }}
            >
              {block.subtitle}
            </p>
          )}

          {/* Short Story */}
          <p
            style={{
              fontSize: '1.125rem',
              lineHeight: 1.8,
              color: '#cbd5e1',
              marginBottom: '2.5rem',
            }}
          >
            {block.short_story}
          </p>

          {/* Story Link */}
          {block.story_link && (
            <Link
              href={block.story_link}
              target={getLinkTarget(block.story_link_target)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '1rem',
                fontWeight: 600,
                color: '#10b981',
                textDecoration: 'none',
                paddingBottom: '0.25rem',
                borderBottom: '2px solid transparent',
                transition: 'border-color 0.2s',
              }}
            >
              Đọc thêm câu chuyện
              <span>→</span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

// =============================================
// Blog Section Component (Fetches from API)
// =============================================
interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt?: string;
  thumbnailUrl?: string;
  type: string;
  publishedAt?: string;
}

async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/posts?type=BLOG&limit=6`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

async function BlogSection() {
  const posts = await getBlogPosts();

  if (posts.length === 0) return null;

  return (
    <section
      id="section-blog"
      style={{
        padding: '6rem 1.5rem',
        background: '#0f172a',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span
            style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: '1rem',
            }}
          >
            📝 Latest Blog
          </span>
          <h2
            style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color: '#f1f5f9',
              marginBottom: '1rem',
            }}
          >
            Bài viết mới nhất
          </h2>
          <p style={{ fontSize: '1.125rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>
            Khám phá các câu chuyện, mẹo và tin tức từ Laba
          </p>
        </div>

        {/* Posts Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '2rem',
          }}
        >
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              style={{
                display: 'block',
                background: 'rgba(30, 41, 59, 0.5)',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(51, 65, 85, 0.5)',
                textDecoration: 'none',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              {/* Thumbnail */}
              <div
                style={{
                  aspectRatio: '16/9',
                  background: post.thumbnailUrl
                    ? `url(${post.thumbnailUrl}) center/cover`
                    : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {!post.thumbnailUrl && (
                  <span style={{ fontSize: '3rem' }}>📝</span>
                )}
              </div>

              {/* Content */}
              <div style={{ padding: '1.5rem' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    marginBottom: '0.75rem',
                  }}
                >
                  {post.type}
                </span>
                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: '#f1f5f9',
                    marginBottom: '0.5rem',
                    lineHeight: 1.4,
                  }}
                >
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: '#94a3b8',
                      lineHeight: 1.6,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {post.excerpt}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <Link
            href="/blog"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem 2rem',
              background: '#10b981',
              color: '#020617',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Xem tất cả bài viết →
          </Link>
        </div>
      </div>
    </section>
  );
}

// =============================================
// Error Component
// =============================================
function ErrorMessage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
      }}
    >
      <div
        style={{
          fontSize: '4rem',
          marginBottom: '1.5rem',
        }}
      >
        🌱
      </div>
      <h1
        style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          color: '#f1f5f9',
          marginBottom: '1rem',
        }}
      >
        Nội dung đang được cập nhật
      </h1>
      <p
        style={{
          fontSize: '1rem',
          color: '#94a3b8',
          maxWidth: '400px',
          marginBottom: '2rem',
        }}
      >
        Không tải được nội dung landing. Vui lòng thử lại sau hoặc kiểm tra kết nối với backend.
      </p>
      <Link
        href="/login"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: '#020617',
          background: '#10b981',
          borderRadius: '8px',
          textDecoration: 'none',
        }}
      >
        Đi tới trang Login
      </Link>
    </div>
  );
}

// =============================================
// Main Page Component
// =============================================
export default async function HomePage() {
  const data = await getLandingData('vi');

  // Handle error state
  if (!data || !data.blocks || data.blocks.length === 0) {
    return <ErrorMessage />;
  }

  // Sort blocks by sort_order
  const sortedBlocks = [...data.blocks].sort((a, b) => a.sort_order - b.sort_order);

  // Find specific blocks
  const hero = sortedBlocks.find((b) => b.key === 'hero');
  const farm = sortedBlocks.find((b) => b.key === 'farm');
  const homestay = sortedBlocks.find((b) => b.key === 'homestay');
  const cafe = sortedBlocks.find((b) => b.key === 'cafe');
  const about = sortedBlocks.find((b) => b.key === 'about');

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#020617',
        color: '#f9fafb',
      }}
    >
      <Header />

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        {/* Hero Section */}
        {hero && <HeroSection block={hero} />}

        {/* Content Sections */}
        {farm && (
          <ContentSection
            block={farm}
            reverse={false}
            bgColor="#0f172a"
          />
        )}

        {homestay && (
          <ContentSection
            block={homestay}
            reverse={true}
            bgColor="#1e293b"
          />
        )}

        {cafe && (
          <ContentSection
            block={cafe}
            reverse={false}
            bgColor="#0f172a"
          />
        )}

        {about && (
          <ContentSection
            block={about}
            reverse={true}
            bgColor="#1e293b"
          />
        )}

        {/* Blog Section */}
        <BlogSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
