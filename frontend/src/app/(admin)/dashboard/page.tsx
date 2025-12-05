'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/apiClient';

interface UserRole {
    id: number;
    name: string;
}

interface User {
    id: number;
    email: string;
    lockUntil?: string | null;
    roles: UserRole[];
}

interface PaginatedUsers {
    items: User[];
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
}

interface Branch {
    id: number;
    name: string;
    isActive: boolean;
}

interface PaginatedBranches {
    items: Branch[];
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
}

interface Post {
    id: number;
    title: string;
    isPublished: boolean;
    publishedAt?: string;
}

interface PaginatedPosts {
    items: Post[];
    totalItems: number;
}

interface DashboardStats {
    totalUsers: number;
    activeUsers: number;
    lockedUsers: number;
    adminUsers: number;
    totalBranches: number;
    activeBranches: number;
    totalPosts: number;
}

interface RecentActivity {
    id: number;
    action: string;
    detail: string;
    time: string;
    emoji: string;
}

const quickActions = [
    { label: 'Tạo bài viết', emoji: '✏️', href: '/posts/create' },
    { label: 'Thêm User', emoji: '👤', href: '/users' },
    { label: 'Chi nhánh mới', emoji: '🏢', href: '/branches/create' },
    { label: 'Xem bài viết', emoji: '📊', href: '/posts' },
];

export default function DashboardPage() {
    const [mounted, setMounted] = useState(false);
    const [currentTime, setCurrentTime] = useState('');
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        activeUsers: 0,
        lockedUsers: 0,
        adminUsers: 0,
        totalBranches: 0,
        activeBranches: 0,
        totalPosts: 0,
    });
    const [loading, setLoading] = useState(true);
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

    useEffect(() => {
        setMounted(true);
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleString('vi-VN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }));
        };
        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);

            let totalUsers = 0, activeUsers = 0, lockedUsers = 0, adminUsers = 0;
            let totalBranches = 0, activeBranches = 0;
            let totalPosts = 0;
            const activities: RecentActivity[] = [];
            const now = new Date();

            // Fetch Users - using EXACT same endpoint as UsersPage
            try {
                const usersRes = await apiClient.get<PaginatedUsers>('/admin/users?limit=50');
                const users = usersRes.data.items || [];
                totalUsers = users.length;
                lockedUsers = users.filter(u => u.lockUntil && new Date(u.lockUntil) > now).length;
                activeUsers = totalUsers - lockedUsers;
                adminUsers = users.filter(u => u.roles?.some(r => r.name === 'admin' || r.name === 'super_admin')).length;

                // Add user activities
                users.slice(0, 2).forEach((user, i) => {
                    activities.push({
                        id: i + 1,
                        action: 'User đã đăng ký',
                        detail: user.email,
                        time: 'Gần đây',
                        emoji: '👤',
                    });
                });
            } catch (err) {
                console.log('Users API error:', err);
            }

            // Fetch Branches - using EXACT same endpoint as BranchesPage
            try {
                const branchesRes = await apiClient.get<PaginatedBranches>('/branches?limit=100');
                const branches = branchesRes.data.items || [];
                totalBranches = branches.length;
                activeBranches = branches.filter(b => b.isActive).length;

                // Add branch activities
                branches.slice(0, 2).forEach((branch, i) => {
                    activities.push({
                        id: 10 + i,
                        action: 'Chi nhánh',
                        detail: branch.name,
                        time: branch.isActive ? 'Đang hoạt động' : 'Tạm đóng',
                        emoji: '🏢',
                    });
                });
            } catch (err) {
                console.log('Branches API error:', err);
            }

            // Fetch Posts - using EXACT same endpoint as PostsPage (/cms/posts)
            try {
                const postsRes = await apiClient.get<PaginatedPosts>('/cms/posts?limit=50');
                const posts = postsRes.data.items || [];
                totalPosts = posts.length;

                // Add post activities
                posts.slice(0, 3).forEach((post, i) => {
                    activities.push({
                        id: 20 + i,
                        action: 'Bài viết',
                        detail: post.title?.substring(0, 35) + (post.title?.length > 35 ? '...' : ''),
                        time: post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : 'Nháp',
                        emoji: '📝',
                    });
                });
            } catch (err) {
                console.log('Posts API error:', err);
            }

            setStats({
                totalUsers,
                activeUsers,
                lockedUsers,
                adminUsers,
                totalBranches,
                activeBranches,
                totalPosts,
            });

            setRecentActivity(activities.length > 0 ? activities : [
                { id: 1, action: 'Chào mừng', detail: 'Dashboard đã sẵn sàng', time: 'Bây giờ', emoji: '🎉' }
            ]);
        } catch (error) {
            console.error('Dashboard fetch error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const statsConfig = [
        {
            label: 'Tổng Users',
            value: stats.totalUsers,
            subLabel: `${stats.activeUsers} active • ${stats.lockedUsers} locked`,
            emoji: '👥',
            color: '#7c3aed',
            href: '/users',
        },
        {
            label: 'Chi nhánh',
            value: stats.totalBranches,
            subLabel: `${stats.activeBranches} đang hoạt động`,
            emoji: '🏢',
            color: '#06b6d4',
            href: '/branches',
        },
        {
            label: 'Bài viết',
            value: stats.totalPosts,
            subLabel: 'Tổng số bài',
            emoji: '📝',
            color: '#10b981',
            href: '/posts',
        },
        {
            label: 'Admins',
            value: stats.adminUsers,
            subLabel: 'Quản trị viên',
            emoji: '👑',
            color: '#f97316',
            href: '/users',
        },
    ];

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
            padding: '24px',
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                        <div>
                            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#f1f5f9', marginBottom: '8px' }}>
                                Welcome back, Admin! 👋
                            </h1>
                            <p style={{ color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                    width: '8px',
                                    height: '8px',
                                    backgroundColor: loading ? '#f97316' : '#10b981',
                                    borderRadius: '50%',
                                    display: 'inline-block',
                                }} />
                                {loading ? 'Đang tải dữ liệu...' : currentTime}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <Link href="/posts" style={{
                                padding: '10px 16px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                color: '#94a3b8',
                                fontSize: '14px',
                                fontWeight: 500,
                                textDecoration: 'none',
                            }}>
                                📋 Quản lý bài viết
                            </Link>
                            <Link href="/posts/create" style={{
                                padding: '10px 16px',
                                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                                borderRadius: '12px',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: 500,
                                textDecoration: 'none',
                            }}>
                                ➕ Tạo bài viết mới
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '20px',
                    marginBottom: '32px',
                }}>
                    {statsConfig.map((stat, index) => (
                        <Link
                            key={stat.label}
                            href={stat.href}
                            style={{
                                position: 'relative',
                                background: 'linear-gradient(135deg, rgba(30,41,59,0.9), rgba(15,23,42,0.95))',
                                borderRadius: '16px',
                                padding: '24px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                textDecoration: 'none',
                                display: 'block',
                                opacity: mounted ? 1 : 0,
                                transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                                transition: 'all 0.4s ease',
                                transitionDelay: `${index * 80}ms`,
                            }}
                        >
                            {/* Top line */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '3px',
                                background: `linear-gradient(90deg, ${stat.color}, ${stat.color}88)`,
                            }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                                        {stat.label}
                                    </p>
                                    <p style={{ fontSize: '42px', fontWeight: 700, color: '#f1f5f9', lineHeight: 1 }}>
                                        {loading ? '...' : stat.value}
                                    </p>
                                    <p style={{ marginTop: '12px', color: '#10b981', fontSize: '13px', fontWeight: 500 }}>
                                        ✓ {stat.subLabel}
                                    </p>
                                </div>
                                <div style={{
                                    width: '52px',
                                    height: '52px',
                                    borderRadius: '14px',
                                    background: `${stat.color}20`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '26px',
                                }}>
                                    {stat.emoji}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                    {/* Recent Activity */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(30,41,59,0.9), rgba(15,23,42,0.95))',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.05)',
                    }}>
                        <div style={{
                            padding: '20px 24px',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <div>
                                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#f1f5f9' }}>Hoạt động gần đây</h2>
                                <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>Dữ liệu thực từ hệ thống</p>
                            </div>
                            <button onClick={() => fetchDashboardData()} style={{
                                padding: '8px 16px',
                                background: 'rgba(124, 58, 237, 0.2)',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#a78bfa',
                                fontSize: '13px',
                                fontWeight: 500,
                                cursor: 'pointer',
                            }}>
                                🔄 Refresh
                            </button>
                        </div>
                        <div>
                            {loading ? (
                                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                                    Đang tải dữ liệu...
                                </div>
                            ) : recentActivity.length > 0 ? (
                                recentActivity.map((activity) => (
                                    <div key={activity.id} style={{
                                        padding: '16px 24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                                    }}>
                                        <div style={{
                                            width: '44px',
                                            height: '44px',
                                            borderRadius: '12px',
                                            background: 'rgba(16, 185, 129, 0.15)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '20px',
                                        }}>
                                            {activity.emoji}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: 500 }}>
                                                {activity.action}
                                            </p>
                                            <p style={{ color: '#64748b', fontSize: '13px', marginTop: '2px' }}>
                                                {activity.detail}
                                            </p>
                                        </div>
                                        <span style={{ color: '#64748b', fontSize: '13px' }}>
                                            {activity.time}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                                    Chưa có dữ liệu
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(30,41,59,0.9), rgba(15,23,42,0.95))',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.05)',
                    }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#f1f5f9' }}>Thao tác nhanh</h2>
                        </div>
                        <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            {quickActions.map((action) => (
                                <Link key={action.label} href={action.href} style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '20px 16px',
                                    background: 'rgba(15,23,42,0.5)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: '12px',
                                    textDecoration: 'none',
                                }}>
                                    <span style={{ fontSize: '28px' }}>{action.emoji}</span>
                                    <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 500 }}>
                                        {action.label}
                                    </span>
                                </Link>
                            ))}
                        </div>

                        {/* System Status */}
                        <div style={{ padding: '16px' }}>
                            <div style={{
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                borderRadius: '12px',
                                padding: '16px',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                    <div style={{
                                        width: '10px',
                                        height: '10px',
                                        backgroundColor: '#10b981',
                                        borderRadius: '50%',
                                        boxShadow: '0 0 10px #10b981',
                                    }} />
                                    <span style={{ color: '#10b981', fontSize: '14px', fontWeight: 600 }}>
                                        Hệ thống hoạt động
                                    </span>
                                </div>
                                <p style={{ color: 'rgba(16, 185, 129, 0.7)', fontSize: '12px' }}>
                                    {stats.totalUsers} users • {stats.totalBranches} branches • {stats.totalPosts} posts
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ marginTop: '32px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                    <p>Laba Platform v1.0 • Phase 1 Complete 🎉</p>
                </div>
            </div>
        </div>
    );
}
