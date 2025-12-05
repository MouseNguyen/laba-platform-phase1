// =============================================
// Laba Platform - Header Component (FE3)
// =============================================
// Hiển thị navigation và auth state
// =============================================

'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: '0.75rem 1.5rem',
        background: 'rgba(2, 6, 23, 0.9)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(51, 65, 85, 0.3)',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#10b981',
            textDecoration: 'none',
          }}
        >
          🌿 Laba
        </Link>

        {/* Navigation */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
          }}
        >
          {/* Menu Links */}
          <Link
            href="/#section-farm"
            style={{
              fontSize: '0.875rem',
              color: '#94a3b8',
              textDecoration: 'none',
            }}
          >
            Farm
          </Link>
          <Link
            href="/#section-homestay"
            style={{
              fontSize: '0.875rem',
              color: '#94a3b8',
              textDecoration: 'none',
            }}
          >
            Homestay
          </Link>
          <Link
            href="/#section-cafe"
            style={{
              fontSize: '0.875rem',
              color: '#94a3b8',
              textDecoration: 'none',
            }}
          >
            Cafe
          </Link>
          <Link
            href="/about"
            style={{
              fontSize: '0.875rem',
              color: '#94a3b8',
              textDecoration: 'none',
            }}
          >
            About
          </Link>
          <Link
            href="/blog"
            style={{
              fontSize: '0.875rem',
              color: '#94a3b8',
              textDecoration: 'none',
            }}
          >
            Blog
          </Link>
          <Link
            href="/contact"
            style={{
              fontSize: '0.875rem',
              color: '#94a3b8',
              textDecoration: 'none',
            }}
          >
            Contact
          </Link>

          {/* Divider */}
          <div
            style={{
              width: '1px',
              height: '20px',
              background: 'rgba(71, 85, 105, 0.5)',
            }}
          />

          {/* Auth Section */}
          {isLoading ? (
            <span
              style={{
                fontSize: '0.875rem',
                color: '#64748b',
              }}
            >
              Đang tải...
            </span>
          ) : isAuthenticated && user ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              {/* Dashboard Link */}
              <Link
                href="/dashboard"
                className="text-[#10b981] hover:underline text-sm font-medium"
              >
                Dashboard
              </Link>

              {/* User Info */}
              <span
                style={{
                  fontSize: '0.875rem',
                  color: '#cbd5e1',
                }}
              >
                Xin chào,{' '}
                <strong style={{ color: '#10b981' }}>
                  {user.full_name || user.email}
                </strong>
              </span>

              {/* Logout Button */}
              <button
                onClick={() => logout()}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#f1f5f9',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#020617',
                background: '#10b981',
                borderRadius: '6px',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
            >
              Đăng nhập
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
