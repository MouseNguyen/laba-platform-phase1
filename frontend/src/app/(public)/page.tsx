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
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
