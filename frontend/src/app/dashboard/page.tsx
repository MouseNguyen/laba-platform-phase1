'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// Role color mapping
const ROLE_COLORS = {
    super_admin: { bg: 'bg-green-100', text: 'text-green-800', label: 'Super Admin' },
    admin: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Admin' },
    manager: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Manager' },
    staff: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Staff' },
    customer: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Customer' },
};

function getRoleBadgeClass(role: string): string {
    const colors = ROLE_COLORS[role as keyof typeof ROLE_COLORS] || ROLE_COLORS.customer;
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`;
}

function getRoleLabel(role: string): string {
    return ROLE_COLORS[role as keyof typeof ROLE_COLORS]?.label || 'Customer';
}

export default function DashboardPage() {
    const { user, isLoading, isAuthenticated, revokeAllSessions } = useAuth();
    const router = useRouter();
    const [isRevoking, setIsRevoking] = useState(false);

    // =============================================
    // Route Protection
    // =============================================
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login?redirect=/dashboard');
        }
    }, [isLoading, isAuthenticated, router]);

    // Prevent rendering if not authenticated
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    // =============================================
    // Handlers
    // =============================================
    const handleRevokeAll = async () => {
        if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi tất cả các thiết bị? Hành động này không thể hoàn tác.')) {
            try {
                setIsRevoking(true);
                await revokeAllSessions();
                // Redirect handled in revokeAllSessions or AuthContext, but we can ensure here too
            } catch (error) {
                console.error('Revoke error:', error);
                alert('Có lỗi xảy ra khi đăng xuất tất cả thiết bị.');
            } finally {
                setIsRevoking(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8 pt-24">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center sm:text-left">
                    <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển</h1>
                    <p className="mt-2 text-gray-600">Quản lý thông tin tài khoản và phiên đăng nhập của bạn.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* User Info Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-800">Thông tin cá nhân</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Họ và tên</label>
                                <p className="mt-1 text-gray-900 font-medium">{user.full_name}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Email</label>
                                <p className="mt-1 text-gray-900">{user.email}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">User ID</label>
                                <p className="mt-1 text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">{user.id}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-2">Vai trò</label>
                                <div className="flex flex-wrap gap-2">
                                    {Array.isArray(user.roles) && user.roles.length > 0 ? (
                                        user.roles.map((role: string) => (
                                            <span key={role} className={getRoleBadgeClass(role)}>
                                                {getRoleLabel(role)}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-400 italic">Không có vai trò</span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Trạng thái</label>
                                <div className="mt-1">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        <span className="w-2 h-2 mr-1.5 bg-green-500 rounded-full"></span>
                                        Active
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats & Actions */}
                    <div className="space-y-6">

                        {/* Stats Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Thống kê nhanh</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                    <p className="text-sm text-blue-600 font-medium">Session đang hoạt động</p>
                                    <p className="text-2xl font-bold text-blue-900 mt-1">1</p>
                                </div>
                                {/* Placeholder for other stats */}
                            </div>
                        </div>

                        {/* Security Actions */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Bảo mật</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Nếu bạn nghi ngờ tài khoản bị xâm nhập, hãy đăng xuất khỏi tất cả các thiết bị ngay lập tức.
                            </p>
                            <button
                                onClick={handleRevokeAll}
                                disabled={isRevoking}
                                className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isRevoking ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    'Đăng xuất tất cả thiết bị'
                                )}
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}