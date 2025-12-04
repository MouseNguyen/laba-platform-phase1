'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginCredentials } from '@/types/auth';
import { authApi } from '@/lib/api/auth';
import { setAccessToken } from '@/lib/api/client';
import { useRouter } from 'next/navigation';

interface AuthContextType extends AuthState {
    login: (credentials: string, password?: string) => Promise<void>; // Adjusted signature to match usage in LoginPage
    logout: () => void;
    refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [state, setState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true,
    });
    const router = useRouter();

    // Initial check
    useEffect(() => {
        const initAuth = async () => {
            try {
                // Try to refresh token silently
                const { access_token } = await authApi.refreshToken();
                setAccessToken(access_token);

                // Fetch user profile
                const user = await authApi.getMe();

                setState({
                    user,
                    isAuthenticated: true,
                    isLoading: false,
                });
            } catch (error) {
                // If refresh fails, we are not logged in
                setState({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            }
        };

        initAuth();
    }, []);

    const login = async (emailOrCredentials: any, password?: string) => {
        // Handle both object and separate arguments (to support the existing LoginPage usage)
        let credentials: LoginCredentials;
        if (typeof emailOrCredentials === 'string') {
            credentials = { email: emailOrCredentials, password: password || '' };
        } else {
            credentials = emailOrCredentials;
        }

        const data = await authApi.login(credentials);
        setAccessToken(data.access_token);

        setState({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
        });
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            setAccessToken(null);
            setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
            });
            router.push('/login');
        }
    };

    const refreshToken = async () => {
        try {
            const { access_token } = await authApi.refreshToken();
            setAccessToken(access_token);
        } catch (error) {
            console.error('Refresh token failed', error);
            logout();
        }
    };

    const value = {
        ...state,
        login,
        logout,
        refreshToken,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
