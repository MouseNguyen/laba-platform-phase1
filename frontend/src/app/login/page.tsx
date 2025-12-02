// =============================================
// Laba Platform - Login Page (FE3)
// =============================================
// Form đăng nhập với email/password
// Sử dụng AuthContext để login
// =============================================

'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { AxiosError } from 'axios';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect nếu đã login
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  // Handle form submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate
    if (!email.trim()) {
      setError('Vui lòng nhập email');
      return;
    }
    if (!password) {
      setError('Vui lòng nhập mật khẩu');
      return;
    }

    setIsSubmitting(true);

    try {
      await login(email, password);
      // Login thành công, AuthContext sẽ redirect
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle error message
      if (err instanceof AxiosError) {
        const message = err.response?.data?.message;
        if (message === 'Invalid credentials') {
          setError('Email hoặc mật khẩu không đúng');
        } else if (err.response?.status === 423) {
          setError('Tài khoản đã bị khóa tạm thời. Vui lòng thử lại sau.');
        } else {
          setError(message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
        }
      } else {
        setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
        }}
      >
        <div style={{ color: '#94a3b8', fontSize: '1rem' }}>
          Đang kiểm tra phiên đăng nhập...
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
      }}
    >
      {/* Back Link */}
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
        }}
      >
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#94a3b8',
            fontSize: '0.875rem',
            textDecoration: 'none',
          }}
        >
          ← Về trang chủ
        </Link>
      </div>

      {/* Login Box */}
      <div
        style={{
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(71, 85, 105, 0.5)',
          borderRadius: '16px',
          padding: '2.5rem',
          maxWidth: '400px',
          width: '100%',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌿</div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: '#f9fafb',
              marginBottom: '0.5rem',
            }}
          >
            Đăng nhập
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Laba Platform – Phase 1
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              marginBottom: '1.5rem',
              color: '#f87171',
              fontSize: '0.875rem',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email Input */}
          <div style={{ marginBottom: '1rem' }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#cbd5e1',
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@laba.vn"
              autoComplete="email"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(51, 65, 85, 0.5)',
                border: '1px solid rgba(71, 85, 105, 0.5)',
                borderRadius: '8px',
                color: '#f1f5f9',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
            />
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#cbd5e1',
              }}
            >
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(51, 65, 85, 0.5)',
                border: '1px solid rgba(71, 85, 105, 0.5)',
                borderRadius: '8px',
                color: '#f1f5f9',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '0.75rem 1.5rem',
              backgroundColor: isSubmitting ? 'rgba(16, 185, 129, 0.5)' : '#10b981',
              color: '#020617',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '1rem',
              border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        {/* Demo Accounts Info */}
        <div
          style={{
            marginTop: '2rem',
            padding: '1rem',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '8px',
          }}
        >
          <p
            style={{
              fontSize: '0.75rem',
              color: '#10b981',
              marginBottom: '0.5rem',
              fontWeight: 600,
            }}
          >
            📝 Tài khoản demo:
          </p>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            <p>• admin@laba.vn / Admin@123</p>
            <p>• tester01@laba.vn / Tester@123</p>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div
        style={{
          marginTop: '2rem',
          fontSize: '0.75rem',
          color: '#64748b',
          textAlign: 'center',
        }}
      >
        <p>Backend API: POST /auth/login</p>
        <p style={{ marginTop: '0.25rem' }}>
          Access token lưu trong memory • Refresh token trong HttpOnly cookie
        </p>
      </div>
    </div>
  );
}
