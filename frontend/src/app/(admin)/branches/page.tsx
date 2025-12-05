'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/apiClient';

interface BranchSettings {
    timezone?: string;
    openHours?: { from: string; to: string };
    maxVisitorsPerDay?: number;
    activities?: string[];
    checkInFrom?: string;
    checkOutUntil?: string;
    roomCount?: number;
    amenities?: string[];
    menuVersion?: string;
    specialties?: string[];
}

interface Branch {
    id: number;
    code: string;
    name: string;
    type: 'FARM' | 'HOMESTAY' | 'CAFE' | 'SHOP';
    address?: string;
    phone?: string;
    settings?: BranchSettings | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
}

interface PaginatedResponse {
    items: Branch[];
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
}

const typeIcons: Record<string, string> = {
    FARM: '🌾',
    HOMESTAY: '🏡',
    CAFE: '☕',
    SHOP: '🛒',
};

const typeStyles: Record<string, { bg: string; text: string }> = {
    FARM: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e' },
    HOMESTAY: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' },
    CAFE: { bg: 'rgba(249, 115, 22, 0.1)', text: '#f97316' },
    SHOP: { bg: 'rgba(168, 85, 247, 0.1)', text: '#a855f7' },
};

export default function BranchesPage() {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [stats, setStats] = useState({ total: 0, active: 0, byType: {} as Record<string, number> });

    const fetchBranches = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.get<PaginatedResponse>('/branches?limit=100');
            setBranches(response.data.items);

            // Calculate stats
            const items = response.data.items;
            const activeCount = items.filter(b => b.isActive).length;
            const byType: Record<string, number> = {};
            items.forEach(b => {
                byType[b.type] = (byType[b.type] || 0) + 1;
            });
            setStats({ total: items.length, active: activeCount, byType });
        } catch (err: any) {
            console.error('Failed to fetch branches:', err);
            setError(err.response?.data?.message || 'Failed to load branches');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBranches();
    }, [fetchBranches]);

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa chi nhánh này?')) return;

        try {
            await apiClient.delete(`/branches/${id}`);
            fetchBranches();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete branch');
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <div style={{ color: '#64748b', fontSize: '1.125rem' }}>Đang tải...</div>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <div>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: 800,
                        color: '#f1f5f9',
                        letterSpacing: '-0.025em',
                        marginBottom: '0.5rem'
                    }}>
                        Quản lý Chi nhánh
                    </h1>
                    <p style={{ color: '#64748b' }}>
                        Quản lý các địa điểm kinh doanh của bạn
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* View Toggle */}
                    <div style={{
                        display: 'flex',
                        background: '#0f172a',
                        borderRadius: '8px',
                        padding: '4px',
                        border: '1px solid #334155'
                    }}>
                        <button
                            onClick={() => setViewMode('grid')}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                background: viewMode === 'grid' ? '#334155' : 'transparent',
                                color: viewMode === 'grid' ? '#f1f5f9' : '#64748b',
                            }}
                        >
                            Lưới
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                background: viewMode === 'list' ? '#334155' : 'transparent',
                                color: viewMode === 'list' ? '#f1f5f9' : '#64748b',
                            }}
                        >
                            Danh sách
                        </button>
                    </div>
                    <Link
                        href="/branches/create"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#10b981',
                            color: '#020617',
                            borderRadius: '12px',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            textDecoration: 'none',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                        }}
                    >
                        <span>+</span> Tạo Chi nhánh
                    </Link>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div style={{
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '8px',
                    color: '#f87171'
                }}>
                    {error}
                </div>
            )}

            {/* Stats Row */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                {[
                    { label: 'Tổng Chi nhánh', value: stats.total, icon: '🏢', color: '#667eea' },
                    { label: 'Đang hoạt động', value: stats.active, icon: '✅', color: '#10b981' },
                    { label: 'Farm', value: stats.byType['FARM'] || 0, icon: '🌾', color: '#22c55e' },
                    { label: 'Homestay', value: stats.byType['HOMESTAY'] || 0, icon: '🏡', color: '#3b82f6' },
                ].map((stat) => (
                    <div key={stat.label} style={{
                        background: '#1e293b',
                        borderRadius: '12px',
                        padding: '1.25rem',
                        border: '1px solid #334155',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '4px',
                            height: '100%',
                            background: stat.color
                        }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                background: '#0f172a',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.25rem'
                            }}>
                                {stat.icon}
                            </div>
                            <div>
                                <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 500 }}>{stat.label}</p>
                                <p style={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 700 }}>{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {branches.length === 0 && !error && (
                <div style={{
                    background: '#1e293b',
                    borderRadius: '16px',
                    border: '1px solid #334155',
                    padding: '4rem 2rem',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏢</div>
                    <h3 style={{ color: '#f1f5f9', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                        Chưa có chi nhánh nào
                    </h3>
                    <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                        Bắt đầu bằng cách tạo chi nhánh đầu tiên của bạn!
                    </p>
                    <Link
                        href="/branches/create"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#10b981',
                            color: '#020617',
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            textDecoration: 'none',
                        }}
                    >
                        Tạo Chi nhánh →
                    </Link>
                </div>
            )}

            {/* Branches Grid */}
            {branches.length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : '1fr',
                    gap: '1.5rem'
                }}>
                    {branches.map((branch) => {
                        const typeStyle = typeStyles[branch.type] || typeStyles.FARM;
                        const icon = typeIcons[branch.type] || '🏢';
                        return (
                            <div
                                key={branch.id}
                                style={{
                                    background: '#1e293b',
                                    borderRadius: '16px',
                                    border: '1px solid #334155',
                                    overflow: 'hidden',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                }}
                            >
                                {/* Branch Header */}
                                <div style={{
                                    padding: '1.5rem',
                                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                                    borderBottom: '1px solid #334155'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                                width: '56px',
                                                height: '56px',
                                                borderRadius: '14px',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1.75rem'
                                            }}>
                                                {icon}
                                            </div>
                                            <div>
                                                <h3 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                                                    {branch.name}
                                                </h3>
                                                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                                                    📍 {branch.address || 'Chưa có địa chỉ'}
                                                </p>
                                            </div>
                                        </div>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            background: branch.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            color: branch.isActive ? '#10b981' : '#ef4444',
                                            border: branch.isActive ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
                                        }}>
                                            <span style={{
                                                width: '6px',
                                                height: '6px',
                                                borderRadius: '50%',
                                                backgroundColor: 'currentColor',
                                                marginRight: '0.5rem'
                                            }} />
                                            {branch.isActive ? 'Hoạt động' : 'Tạm dừng'}
                                        </span>
                                    </div>
                                </div>

                                {/* Branch Body */}
                                <div style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                        <span style={{
                                            display: 'inline-flex',
                                            padding: '0.375rem 0.75rem',
                                            borderRadius: '8px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            background: typeStyle.bg,
                                            color: typeStyle.text,
                                            border: `1px solid ${typeStyle.text}20`
                                        }}>
                                            {branch.type}
                                        </span>
                                        <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                                            Code: {branch.code}
                                        </span>
                                    </div>

                                    {branch.phone && (
                                        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1rem' }}>
                                            📞 {branch.phone}
                                        </p>
                                    )}

                                    {/* Settings Preview */}
                                    {branch.settings && (
                                        <div style={{
                                            padding: '1rem',
                                            background: '#0f172a',
                                            borderRadius: '10px',
                                            marginBottom: '1.25rem'
                                        }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                                                {branch.settings.openHours && (
                                                    <div>
                                                        <p style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 500 }}>GIỜ MỞ CỬA</p>
                                                        <p style={{ color: '#f1f5f9', fontSize: '0.875rem', fontWeight: 600 }}>
                                                            {branch.settings.openHours.from} - {branch.settings.openHours.to}
                                                        </p>
                                                    </div>
                                                )}
                                                {branch.settings.roomCount && (
                                                    <div>
                                                        <p style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 500 }}>SỐ PHÒNG</p>
                                                        <p style={{ color: '#f1f5f9', fontSize: '0.875rem', fontWeight: 600 }}>
                                                            {branch.settings.roomCount}
                                                        </p>
                                                    </div>
                                                )}
                                                {branch.settings.maxVisitorsPerDay && (
                                                    <div>
                                                        <p style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 500 }}>KHÁCH/NGÀY</p>
                                                        <p style={{ color: '#f1f5f9', fontSize: '0.875rem', fontWeight: 600 }}>
                                                            {branch.settings.maxVisitorsPerDay}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <button
                                            onClick={() => window.location.href = `/branches/${branch.id}/edit`}
                                            style={{
                                                flex: 1,
                                                padding: '0.75rem',
                                                fontSize: '0.875rem',
                                                fontWeight: 600,
                                                color: '#f1f5f9',
                                                background: '#334155',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Chỉnh sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(branch.id)}
                                            style={{
                                                flex: 1,
                                                padding: '0.75rem',
                                                fontSize: '0.875rem',
                                                fontWeight: 600,
                                                color: '#f87171',
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
