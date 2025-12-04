'use client';

import { useState, useEffect } from 'react';

const stats = [
    {
        label: 'Total Users',
        value: 42,
        change: '+12%',
        positive: true,
        icon: '👥',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
        label: 'Active Branches',
        value: 5,
        change: '+2',
        positive: true,
        icon: '🏢',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
        label: 'Published Posts',
        value: 12,
        change: '+3',
        positive: true,
        icon: '📝',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
        label: 'Pending Bookings',
        value: 3,
        change: '-1',
        positive: false,
        icon: '📅',
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    },
];

const recentActivity = [
    { id: 1, action: 'New user registered', user: 'john@example.com', time: '2 minutes ago', icon: '👤' },
    { id: 2, action: 'Branch updated', user: 'admin@laba.vn', time: '15 minutes ago', icon: '🏢' },
    { id: 3, action: 'Post published', user: 'editor@laba.vn', time: '1 hour ago', icon: '📝' },
    { id: 4, action: 'Booking confirmed', user: 'guest@gmail.com', time: '2 hours ago', icon: '✅' },
];

export default function DashboardPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{
                    fontSize: '2.25rem',
                    fontWeight: 800,
                    color: '#f1f5f9',
                    letterSpacing: '-0.025em',
                    marginBottom: '0.5rem'
                }}>
                    Dashboard
                </h1>
                <p style={{ color: '#64748b', fontSize: '1rem' }}>
                    Welcome back! Here's what's happening with your platform today.
                </p>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2.5rem'
            }}>
                {stats.map((stat, index) => (
                    <div
                        key={stat.label}
                        style={{
                            background: '#1e293b',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            border: '1px solid #334155',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            opacity: mounted ? 1 : 0,
                            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                            transitionDelay: `${index * 100}ms`,
                        }}
                    >
                        {/* Gradient accent */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: stat.gradient,
                        }} />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <p style={{
                                    color: '#94a3b8',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    marginBottom: '0.5rem'
                                }}>
                                    {stat.label}
                                </p>
                                <p style={{
                                    fontSize: '2.5rem',
                                    fontWeight: 700,
                                    color: '#f1f5f9',
                                    lineHeight: 1
                                }}>
                                    {stat.value}
                                </p>
                            </div>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'rgba(255,255,255,0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem'
                            }}>
                                {stat.icon}
                            </div>
                        </div>

                        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                background: stat.positive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: stat.positive ? '#10b981' : '#ef4444',
                            }}>
                                {stat.positive ? '↑' : '↓'} {stat.change}
                            </span>
                            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>vs last month</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Two Column Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Recent Activity */}
                <div style={{
                    background: '#1e293b',
                    borderRadius: '16px',
                    border: '1px solid #334155',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        padding: '1.25rem 1.5rem',
                        borderBottom: '1px solid #334155',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#f1f5f9' }}>
                            Recent Activity
                        </h2>
                        <button style={{
                            color: '#10b981',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer'
                        }}>
                            View all →
                        </button>
                    </div>
                    <div>
                        {recentActivity.map((activity, index) => (
                            <div
                                key={activity.id}
                                style={{
                                    padding: '1rem 1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    borderBottom: index < recentActivity.length - 1 ? '1px solid #334155' : 'none',
                                    transition: 'background 0.2s',
                                }}
                            >
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    background: '#0f172a',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.125rem'
                                }}>
                                    {activity.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ color: '#f1f5f9', fontSize: '0.875rem', fontWeight: 500 }}>
                                        {activity.action}
                                    </p>
                                    <p style={{ color: '#64748b', fontSize: '0.75rem' }}>
                                        {activity.user}
                                    </p>
                                </div>
                                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                                    {activity.time}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div style={{
                    background: '#1e293b',
                    borderRadius: '16px',
                    border: '1px solid #334155',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        padding: '1.25rem 1.5rem',
                        borderBottom: '1px solid #334155'
                    }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#f1f5f9' }}>
                            Quick Actions
                        </h2>
                    </div>
                    <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {[
                            { label: 'Create Post', icon: '✏️', color: '#10b981' },
                            { label: 'Add User', icon: '👤', color: '#6366f1' },
                            { label: 'New Branch', icon: '🏢', color: '#f59e0b' },
                            { label: 'View Reports', icon: '📊', color: '#ec4899' },
                        ].map((action) => (
                            <button
                                key={action.label}
                                style={{
                                    padding: '1.25rem',
                                    background: '#0f172a',
                                    border: '1px solid #334155',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }}
                            >
                                <span style={{ fontSize: '1.5rem' }}>{action.icon}</span>
                                <span style={{ color: '#f1f5f9', fontSize: '0.875rem', fontWeight: 500 }}>
                                    {action.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
