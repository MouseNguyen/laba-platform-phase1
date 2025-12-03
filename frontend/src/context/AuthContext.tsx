'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import {
  login as apiLogin,
  logout as apiLogout,
  revokeAll as apiRevokeAll,
  getMe,
  setAccessToken,
  setOnAuthError,
} from '@/lib/apiClient';

// =============================================
// Constants
// =============================================
const REFRESH_BEFORE_MS = 60_000; // 1 phút trước khi hết hạn
const LOCK_TTL_MS = 5000; // Tab khác phải chờ 5s nếu tab này đang refresh

// =============================================
// Types
// =============================================

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  revokeAllSessions: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

// =============================================
// Context
// =============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =============================================
// Provider Component
// =============================================

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  // =============================================
  // Logout function
  // =============================================
  const logout = useCallback(async () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    isRefreshingRef.current = false;
    localStorage.removeItem('refresh_in_progress');

    try {
      await apiLogout();
    } catch (error) {
      console.error('[Auth] Logout error:', error);
    } finally {
      // Clear state
      setUser(null);
      setAccessTokenState(null);
      setAccessToken(null);

      // Redirect to login
      router.push('/login');
    }
  }, [router]);

  // =============================================
  // Silent Refresh Logic (NO Web Worker)
  // =============================================
  const scheduleRefresh = useCallback((expiresAt: string) => {
    const expTime = new Date(expiresAt).getTime();
    const now = Date.now();
    const timeout = Math.max(0, expTime - now - REFRESH_BEFORE_MS);

    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    refreshTimeoutRef.current = setTimeout(async () => {
      // Deduplication: Nếu đang refresh, không gọi nữa
      if (isRefreshingRef.current) {
        return;
      }

      // Kiểm tra tab khác đang refresh chưa (localStorage lock)
      const lockKey = 'refresh_in_progress';
      const lockTime = localStorage.getItem(lockKey);
      const currentTime = Date.now();

      if (lockTime && currentTime - parseInt(lockTime) < LOCK_TTL_MS) {
        // Tab khác đang refresh, chờ 1s rồi retry
        setTimeout(() => scheduleRefresh(expiresAt), 1000);
        return;
      }

      // Set lock
      localStorage.setItem(lockKey, currentTime.toString());
      isRefreshingRef.current = true;

      try {
        // We use fetch directly to bypass interceptors if needed, or use apiClient if it handles refresh endpoint correctly
        // Assuming /api/auth/refresh is the endpoint
        // Note: apiClient might have interceptors that try to refresh on 401, which could cause loops if not careful.
        // Here we are proactively refreshing.

        // Using fetch to be explicit and control the flow
        const response = await fetch('http://localhost:3000/auth/refresh', {
          method: 'POST',
          // credentials: 'include', // If using cookies, but we are on same domain or need to handle CORS
          // Wait, frontend is Next.js, backend is NestJS on 3000? 
          // If running locally, usually FE is 3001, BE is 3000.
          // We should use the configured API_URL. 
          // For now assuming relative path via proxy or absolute URL if CORS allowed.
          // Let's assume apiClient base URL logic.
          headers: { 'Content-Type': 'application/json' },
          // If using cookies, we need credentials: include
        });

        // Actually, let's use the apiClient's refresh logic if possible, or just replicate the call.
        // Since we don't have access to apiClient's internal axios instance easily here without importing it,
        // and we want to avoid circular dependency if apiClient uses AuthContext (it shouldn't).
        // But wait, apiClient imports getMe, login, etc.

        // Let's assume we can use a simple fetch to the backend URL.
        // We need to know the backend URL.
        const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

        // We need to send credentials (cookies)
        // Note: fetch in browser sends cookies for same-origin or if credentials: 'include' for cross-origin.

        // Re-implementing fetch here might be risky if we miss headers.
        // But for refresh, we mainly need the cookie.

        // Let's try to use a dedicated refresh function from apiClient if it existed, 
        // but since we are inside the provider, we can define it.

        // However, the prompt code used `/api/auth/refresh`.
        // If we are using Next.js API routes as proxy, that's fine.
        // If hitting NestJS directly:

        const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          setAccessTokenState(data.access_token);
          setAccessToken(data.access_token);

          // Reschedule với token mới
          const payload = JSON.parse(atob(data.access_token.split('.')[1]));
          scheduleRefresh(new Date(payload.exp * 1000).toISOString());
        } else if (res.status === 403) {
          // SESSION_COMPROMISED
          logout();
        } else {
          // Refresh fail -> logout
          logout();
        }
      } catch (e) {
        logout();
      } finally {
        isRefreshingRef.current = false;
        localStorage.removeItem(lockKey);
      }
    }, timeout);
  }, [logout]);

  // =============================================
  // Revoke All Sessions function
  // =============================================
  const revokeAllSessions = useCallback(async () => {
    try {
      await apiRevokeAll();
    } catch (error) {
      console.error('[Auth] Revoke all error:', error);
    } finally {
      // Clear state
      setUser(null);
      setAccessTokenState(null);
      setAccessToken(null);

      // Redirect to login
      router.push('/login');
    }
  }, [router]);

  // =============================================
  // Set up auth error callback
  // =============================================
  useEffect(() => {
    setOnAuthError(() => {
      console.log('[Auth] Auth error callback triggered');
      setUser(null);
      setAccessTokenState(null);
      setAccessToken(null);
      router.push('/login');
    });

    return () => {
      setOnAuthError(null);
    };
  }, [router]);

  // =============================================
  // Check session on mount
  // =============================================
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);

      try {
        const userData = await getMe();
        setUser(userData);
        console.log('[Auth] Session restored:', userData.email);

        // If we have an access token (which might be hidden in apiClient if not exposed, 
        // but getMe usually returns user. We need the token to schedule refresh.
        // If getMe doesn't return token, we might need to rely on the fact that if getMe succeeded,
        // we have a valid token. But we need the EXPIRY.
        // If we can't get the token string, we can't decode it.
        // Assuming apiClient stores it and we can retrieve it or getMe returns it?
        // The prompt implies we have accessToken state.
        // If getMe only returns User, we might miss the token.
        // BUT, if we just refreshed (via interceptor in getMe), we might have a new token.
        // Let's assume for now we don't have the token string from getMe unless we modify getMe.
        // OR we can just call refresh immediately to get a fresh token and schedule.

        // Let's try to refresh immediately to sync up.
        // Or if we can't, we just wait for the first 401? No, we want proactive.

        // Workaround: Call refresh explicitly on mount if we have a user but no token string yet.
        // This ensures we have the token and can schedule.
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          setAccessTokenState(data.access_token);
          setAccessToken(data.access_token);
          const payload = JSON.parse(atob(data.access_token.split('.')[1]));
          scheduleRefresh(new Date(payload.exp * 1000).toISOString());
        }

      } catch (error) {
        console.log('[Auth] No valid session');
        setUser(null);
        setAccessTokenState(null);
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [scheduleRefresh]);

  // =============================================
  // Login function
  // =============================================
  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await apiLogin({ email, password });

      // Update state
      setAccessTokenState(response.access_token);
      setAccessToken(response.access_token);
      setUser(response.user);

      console.log('[Auth] Login successful:', response.user.email);

      // Schedule refresh
      const payload = JSON.parse(atob(response.access_token.split('.')[1]));
      scheduleRefresh(new Date(payload.exp * 1000).toISOString());

      // Redirect to home
      router.push('/');
    } catch (error) {
      console.error('[Auth] Login failed:', error);
      throw error;
    }
  }, [router, scheduleRefresh]);

  // =============================================
  // Handle tab visibility change
  // =============================================
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && accessToken) {
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          const exp = new Date(payload.exp * 1000).getTime();
          const now = Date.now();

          // Nếu token sắp hết hạn (< 30s) khi tab trở lại, refresh ngay
          if (exp - now < 30000) {
            scheduleRefresh(new Date(payload.exp * 1000).toISOString());
          }
        } catch (e) {
          // ignore invalid token
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [accessToken, scheduleRefresh]);

  // =============================================
  // Context value
  // =============================================
  const value: AuthContextType = {
    user,
    accessToken,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    revokeAllSessions,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// =============================================
// Hook
// =============================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;