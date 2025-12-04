// =============================================
// Laba Platform - API Client (FE3)
// =============================================
// Axios instance với:
// - Auto attach Authorization header
// - Auto refresh token khi 401
// - Handle SESSION_COMPROMISED (403)
// =============================================

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type {
  LandingResponse,
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  LogoutResponse,
  RevokeAllResponse,
  User,
} from './types';

// Base URL từ environment variable
const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000') + '/api/v1';

// =============================================
// Module-level state
// =============================================

// Access token được lưu trong memory (không lưu localStorage để bảo mật)
let accessToken: string | null = null;

// Callback khi auth error (được set bởi AuthContext)
let onAuthError: (() => void) | null = null;

// Flag để tránh gọi refresh nhiều lần đồng thời
let isRefreshing = false;

// Queue các request đang chờ refresh xong
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: Error) => void;
}> = [];

// =============================================
// Helper functions
// =============================================

/**
 * Set access token (gọi từ AuthContext)
 */
export function setAccessToken(token: string | null): void {
  accessToken = token;
}

/**
 * Get current access token
 */
export function getAccessToken(): string | null {
  return accessToken;
}

/**
 * Set auth error callback (gọi từ AuthContext)
 */
export function setOnAuthError(callback: (() => void) | null): void {
  onAuthError = callback;
}

/**
 * Process failed queue sau khi refresh
 */
function processQueue(error: Error | null, token: string | null = null): void {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
}

// =============================================
// Axios Instance
// =============================================

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Quan trọng: gửi cookie HttpOnly
});

// =============================================
// Request Interceptor
// =============================================

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Gắn Authorization header nếu có accessToken
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// =============================================
// Response Interceptor
// =============================================

apiClient.interceptors.response.use(
  // Success response
  (response) => response,

  // Error response
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Không có config (network error, etc.)
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Handle 403 SESSION_COMPROMISED
    if (error.response?.status === 403) {
      const data = error.response.data as { code?: string };
      if (data?.code === 'SESSION_COMPROMISED') {
        console.error('[Auth] Session compromised detected');
        // Logout và redirect
        if (onAuthError) {
          onAuthError();
        }
        return Promise.reject(error);
      }
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Nếu đang refresh, queue request này
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // Mark request đã retry
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi refresh endpoint with Web Locks to prevent multi-tab race conditions
        let response;
        if (typeof navigator !== 'undefined' && navigator.locks) {
          response = await navigator.locks.request('auth_refresh_lock', async () => {
            return axios.post<RefreshResponse>(
              `${API_BASE_URL}/auth/refresh`,
              {},
              { withCredentials: true }
            );
          });
        } else {
          response = await axios.post<RefreshResponse>(
            `${API_BASE_URL}/auth/refresh`,
            {},
            { withCredentials: true }
          );
        }

        const newToken = response.data.access_token;

        // Update access token
        setAccessToken(newToken);

        // Process queue với token mới
        processQueue(null, newToken);

        // Retry original request với token mới
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed
        console.error('[Auth] Refresh token failed:', refreshError);
        processQueue(refreshError as Error, null);

        // Clear token và gọi auth error callback
        setAccessToken(null);
        if (onAuthError) {
          onAuthError();
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// =============================================
// Landing API
// =============================================

export async function fetchLanding(locale: string = 'vi'): Promise<LandingResponse> {
  const response = await apiClient.get<LandingResponse>('/landing', {
    params: { locale },
  });
  return response.data;
}

export const getLanding = fetchLanding;

// =============================================
// Auth API
// =============================================

/**
 * Login với email và password
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
  return response.data;
}

/**
 * Lấy thông tin user hiện tại
 */
export async function getMe(): Promise<User> {
  const response = await apiClient.get<User>('/auth/me');
  return response.data;
}

/**
 * Refresh access token
 */
export async function refreshToken(): Promise<RefreshResponse> {
  const response = await apiClient.post<RefreshResponse>('/auth/refresh');
  return response.data;
}

/**
 * Logout
 */
export async function logout(): Promise<LogoutResponse> {
  const response = await apiClient.post<LogoutResponse>('/auth/logout');
  return response.data;
}

/**
 * Revoke all sessions
 */
export async function revokeAll(): Promise<RevokeAllResponse> {
  const response = await apiClient.post<RevokeAllResponse>('/auth/revoke-all');
  return response.data;
}

export default apiClient;
