'use client';

import { useState } from 'react';

const users = [
    {
        id: 1,
        email: 'admin@laba.vn',
        name: 'Admin User',
        role: 'SUPER_ADMIN',
        status: 'Active',
        avatar: '👑',
        lastActive: '2 minutes ago'
    },
    {
        id: 2,
        email: 'manager@laba.vn',
        name: 'Branch Manager',
        role: 'BRANCH_MANAGER',
        status: 'Active',
        avatar: '👔',
        lastActive: '1 hour ago'
    },
    {
        id: 3,
        email: 'staff@laba.vn',
        name: 'Staff Member',
        role: 'STAFF',
        status: 'Locked',
        avatar: '👤',
        lastActive: '3 days ago'
    },
    {
        id: 4,
        email: 'editor@laba.vn',
        name: 'Content Editor',
        role: 'EDITOR',
        status: 'Active',
        avatar: '✏️',
        lastActive: '5 hours ago'
    },
];

const roleStyles: Record<string, { bg: string; text: string; label: string }> = {
    SUPER_ADMIN: { bg: 'rgba(168, 85, 247, 0.1)', text: '#a855f7', label: 'Super Admin' },
    BRANCH_MANAGER: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', label: 'Manager' },
    STAFF: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e', label: 'Staff' },
    EDITOR: { bg: 'rgba(249, 115, 22, 0.1)', text: '#f97316', label: 'Editor' },
};

export default function UsersPage() {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                        User Management
                    </h1>
                    <p style={{ color: '#64748b' }}>
                        Manage user accounts and permissions
                    </p>
                </div>
                <button style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#10b981',
                    color: '#020617',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                    transition: 'transform 0.2s',
                }}>
                    <span>+</span> Add User
                </button>
            </div>

            {/* Stats Row */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                {[
                    { label: 'Total Users', value: users.length, icon: '👥' },
                    { label: 'Active', value: users.filter(u => u.status === 'Active').length, icon: '✅' },
                    { label: 'Locked', value: users.filter(u => u.status === 'Locked').length, icon: '🔒' },
                    { label: 'Admins', value: users.filter(u => u.role === 'SUPER_ADMIN').length, icon: '👑' },
                ].map((stat) => (
                    <div key={stat.label} style={{
                        background: '#1e293b',
                        borderRadius: '12px',
                        padding: '1.25rem',
                        border: '1px solid #334155',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
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
                ))}
            </div>

            {/* Search */}
            <div style={{ marginBottom: '1.5rem' }}>
                <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        maxWidth: '400px',
                        padding: '0.75rem 1rem',
                        background: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '10px',
                        color: '#f1f5f9',
                        fontSize: '0.875rem',
                        outline: 'none',
                    }}
                />
            </div>

            {/* Users Table */}
            <div style={{
                background: '#1e293b',
                borderRadius: '16px',
                border: '1px solid #334155',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #334155', background: '#0f172a' }}>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>User</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>Role</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>Status</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>Last Active</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => {
                            const roleStyle = roleStyles[user.role] || roleStyles.STAFF;
                            return (
                                <tr key={user.id} style={{ borderBottom: '1px solid #334155' }}>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                                width: '44px',
                                                height: '44px',
                                                borderRadius: '12px',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1.25rem'
                                            }}>
                                                {user.avatar}
                                            </div>
                                            <div>
                                                <p style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: '0.125rem' }}>{user.name}</p>
                                                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            padding: '0.375rem 0.75rem',
                                            borderRadius: '8px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            background: roleStyle.bg,
                                            color: roleStyle.text,
                                            border: `1px solid ${roleStyle.text}20`
                                        }}>
                                            {roleStyle.label}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            background: user.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            color: user.status === 'Active' ? '#10b981' : '#ef4444',
                                            border: user.status === 'Active' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
                                        }}>
                                            <span style={{
                                                width: '6px',
                                                height: '6px',
                                                borderRadius: '50%',
                                                backgroundColor: 'currentColor',
                                                marginRight: '0.5rem'
                                            }} />
                                            {user.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                                        {user.lastActive}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button style={{
                                                padding: '0.5rem 1rem',
                                                fontSize: '0.875rem',
                                                fontWeight: 500,
                                                color: '#f1f5f9',
                                                background: '#334155',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer'
                                            }}>
                                                Edit
                                            </button>
                                            <button style={{
                                                padding: '0.5rem 1rem',
                                                fontSize: '0.875rem',
                                                fontWeight: 500,
                                                color: '#f87171',
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer'
                                            }}>
                                                {user.status === 'Active' ? 'Lock' : 'Unlock'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
