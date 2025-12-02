// =============================================
// Laba Platform - Landing Page (FE2)
// =============================================
// Server Component: fetch data từ backend
// Render các blocks: hero, farm, homestay, cafe, about
// =============================================

import Image from 'next/image';
import Link from 'next/link';
import type { LandingBlock, LandingResponse } from '@/lib/types';
import LandingWrapper from '@/components/LandingWrapper';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

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
      className="hero-section"
      style={{
        position: 'relative',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
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
          {/* Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.4) 0%, rgba(15, 23, 42, 0.8) 100%)',
            }}
          />
        </div>
      )}

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '800px',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        {/* Badge */}
        <span
          style={{
            display: 'inline-block',
            padding: '0.5rem 1rem',
            marginBottom: '1.5rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#10b981',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '9999px',
          }}
        >
          🌿 Laba Platform
        </span>

        {/* Title */}
        <h1
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            lineHeight: 1.2,
            marginBottom: '1rem',
            color: '#f1f5f9',
          }}
        >
          {block.title}
        </h1>

        {/* Subtitle */}
        {block.subtitle && (
          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: '#94a3b8',
              marginBottom: '1.5rem',
              fontStyle: 'italic',
            }}
          >
            {block.subtitle}
          </p>
        )}

        {/* Short Story */}
        <p
          style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: '#cbd5e1',
            maxWidth: '600px',
            margin: '0 auto 2rem',
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
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#020617',
              background: '#10b981',
              borderRadius: '8px',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
          >
            Khám phá thêm
            <span>→</span>
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
          color: '#64748b',
          fontSize: '0.75rem',
          textAlign: 'center',
        }}
      >
        <div style={{ marginBottom: '0.5rem' }}>Cuộn xuống</div>
        <div style={{ animation: 'bounce 2s infinite' }}>↓</div>
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
  bgColor = 'transparent',
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
        padding: '5rem 1.5rem',
        background: bgColor,
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: reverse ? 'row-reverse' : 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '3rem',
        }}
      >
        {/* Image */}
        <div
          style={{
            flex: '1 1 400px',
            minWidth: '280px',
          }}
        >
          {block.image_url ? (
            <div
              style={{
                position: 'relative',
                aspectRatio: '4/3',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              }}
            >
              <Image
                src={block.image_url}
                alt={block.image_alt || block.title}
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          ) : (
            <div
              style={{
                aspectRatio: '4/3',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                fontSize: '0.875rem',
              }}
            >
              Hình ảnh đang được cập nhật
            </div>
          )}
        </div>

        {/* Content */}
        <div
          style={{
            flex: '1 1 400px',
            minWidth: '280px',
          }}
        >
          {/* Block Key Badge */}
          <span
            style={{
              display: 'inline-block',
              marginBottom: '1rem',
              padding: '0.25rem 0.75rem',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#10b981',
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '4px',
            }}
          >
            {block.key}
          </span>

          {/* Title */}
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 700,
              lineHeight: 1.3,
              marginBottom: '1rem',
              color: '#f1f5f9',
            }}
          >
            {block.title}
          </h2>

          {/* Subtitle */}
          {block.subtitle && (
            <p
              style={{
                fontSize: '1rem',
                color: '#94a3b8',
                marginBottom: '1rem',
                fontStyle: 'italic',
              }}
            >
              {block.subtitle}
            </p>
          )}

          {/* Short Story */}
          <p
            style={{
              fontSize: '1rem',
              lineHeight: 1.8,
              color: '#cbd5e1',
              marginBottom: '1.5rem',
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
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#10b981',
                textDecoration: 'none',
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
// Footer Component
// =============================================
function Footer() {
  return (
    <footer
      style={{
        padding: '2rem 1.5rem',
        borderTop: '1px solid rgba(51, 65, 85, 0.5)',
        background: 'rgba(15, 23, 42, 0.8)',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          fontSize: '0.875rem',
          color: '#64748b',
        }}
      >
        <div>
          © {new Date().getFullYear()} Laba Farm. All rights reserved.
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <span>Backend: NestJS + Prisma</span>
          <span>•</span>
          <span>Frontend: Next.js</span>
        </div>
      </div>
    </footer>
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
    <LandingWrapper>
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#020617',
          color: '#f9fafb',
        }}
      >
        {/* Main Content */}
        <main style={{ flex: 1 }}>
          {/* Hero Section */}
          {hero && <HeroSection block={hero} />}

        {/* Content Sections */}
        {farm && (
          <ContentSection
            block={farm}
            reverse={false}
            bgColor="rgba(15, 23, 42, 0.5)"
          />
        )}

        {homestay && (
          <ContentSection
            block={homestay}
            reverse={true}
            bgColor="transparent"
          />
        )}

        {cafe && (
          <ContentSection
            block={cafe}
            reverse={false}
            bgColor="rgba(15, 23, 42, 0.5)"
          />
        )}

        {about && (
          <ContentSection
            block={about}
            reverse={true}
            bgColor="transparent"
          />
        )}
      </main>

      {/* Footer */}
      <Footer />
      </div>
    </LandingWrapper>
  );
}
