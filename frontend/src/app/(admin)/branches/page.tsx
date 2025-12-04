'use client';

import { useState } from 'react';
import Link from 'next/link';

const branches = [
    {
        id: 1,
        name: 'Laba Farm',
        type: 'FARM',
        location: 'Da Lat, Lam Dong',
        status: 'Active',
        image: '🌾',
        description: 'Organic farm experience with fresh produce',
        stats: { bookings: 24, rating: 4.8, revenue: '$12,450' }
    },
    {
        id: 2,
        name: 'Laba Homestay',
        type: 'HOMESTAY',
        location: 'Sapa, Lao Cai',
        status: 'Active',
        image: '🏡',
        description: 'Cozy mountain retreat with stunning views',
        stats: { bookings: 56, rating: 4.9, revenue: '$28,900' }
    },
    {
        id: 3,
        name: 'Laba Cafe',
        type: 'CAFE',
        location: 'Hanoi, Vietnam',
        status: 'Inactive',
        image: '☕',
        description: 'Artisan coffee and local delicacies',
        stats: { bookings: 0, rating: 4.5, revenue: '$0' }
    },
    {
        id: 4,
        name: 'Laba Resort',
        type: 'RESORT',
        location: 'Phu Quoc, Kien Giang',
        status: 'Active',
        image: '🏖️',
        description: 'Luxury beachfront resort experience',
        stats: { bookings: 89, rating: 4.7, revenue: '$45,200' }
    },
];

const typeStyles: Record<string, { bg: string; text: string }> = {
    FARM: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e' },
    HOMESTAY: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' },
    CAFE: { bg: 'rgba(249, 115, 22, 0.1)', text: '#f97316' },
    RESORT: { bg: 'rgba(168, 85, 247, 0.1)', text: '#a855f7' },
};

export default function BranchesPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
                        Branch Management
                    </h1>
                    <p style={{ color: '#64748b' }}>
                        Manage your business locations and properties
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
                            Grid
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
                            List
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
                        <span>+</span> Create Branch
                    </Link>
                </div>
            </div>

            {/* Stats Row */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                {[
                    { label: 'Total Branches', value: branches.length, icon: '🏢', color: '#667eea' },
                    { label: 'Active', value: branches.filter(b => b.status === 'Active').length, icon: '✅', color: '#10b981' },
                    { label: 'Total Bookings', value: branches.reduce((sum, b) => sum + b.stats.bookings, 0), icon: '📅', color: '#f59e0b' },
                    { label: 'Avg. Rating', value: '4.7', icon: '⭐', color: '#ec4899' },
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

            {/* Branches Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : '1fr',
                gap: '1.5rem'
            }}>
                {branches.map((branch) => {
                    const typeStyle = typeStyles[branch.type] || typeStyles.FARM;
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
                                            {branch.image}
                                        </div>
                                        <div>
                                            <h3 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                                                {branch.name}
                                            </h3>
                                            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                                                📍 {branch.location}
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
                                        background: branch.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        color: branch.status === 'Active' ? '#10b981' : '#ef4444',
                                        border: branch.status === 'Active' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
                                    }}>
                                        <span style={{
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            backgroundColor: 'currentColor',
                                            marginRight: '0.5rem'
                                        }} />
                                        {branch.status}
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
                                </div>

                                <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                                    {branch.description}
                                </p>

                                {/* Stats */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: '1rem',
                                    padding: '1rem',
                                    background: '#0f172a',
                                    borderRadius: '10px',
                                    marginBottom: '1.25rem'
                                }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 500, marginBottom: '0.25rem' }}>BOOKINGS</p>
                                        <p style={{ color: '#f1f5f9', fontSize: '1rem', fontWeight: 700 }}>{branch.stats.bookings}</p>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 500, marginBottom: '0.25rem' }}>RATING</p>
                                        <p style={{ color: '#f1f5f9', fontSize: '1rem', fontWeight: 700 }}>⭐ {branch.stats.rating}</p>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 500, marginBottom: '0.25rem' }}>REVENUE</p>
                                        <p style={{ color: '#10b981', fontSize: '1rem', fontWeight: 700 }}>{branch.stats.revenue}</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        color: '#f1f5f9',
                                        background: '#334155',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}>
                                        Edit
                                    </button>
                                    <button style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        color: '#f87171',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
