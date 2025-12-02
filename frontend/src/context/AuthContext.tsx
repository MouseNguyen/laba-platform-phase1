// =============================================
// Laba Platform - Auth Context (FE3)
// =============================================
// Quản lý authentication state:
// - Lưu accessToken trong memory
// - Auto check session khi mount (via /auth/me)
// - Provide login, logout functions
// - Set up auth error callback cho apiClient
// =============================================

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import {
  login as apiLogin,
  logout as apiLogout,
  getMe,
  setAccessToken,
  setOnAuthError,
} from '@/lib/apiClient';

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

  // =============================================
  // Logout function
  // =============================================
  const logout = useCallback(async () => {
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
  // Set up auth error callback
  // =============================================
  useEffect(() => {
    // Khi apiClient gặp lỗi auth (401 sau khi refresh fail, hoặc 403 SESSION_COMPROMISED)
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
        // Thử gọi /auth/me
        // Nếu có refresh_token cookie hợp lệ, interceptor sẽ tự động refresh
        const userData = await getMe();
        setUser(userData);
        console.log('[Auth] Session restored:', userData.email);
      } catch (error) {
        // Không có session hợp lệ
        console.log('[Auth] No valid session');
        setUser(null);
        setAccessTokenState(null);
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

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
      
      // Redirect to home
      router.push('/');
    } catch (error) {
      console.error('[Auth] Login failed:', error);
      throw error;
    }
  }, [router]);

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
