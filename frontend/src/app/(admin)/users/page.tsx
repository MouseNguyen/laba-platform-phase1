'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/apiClient';

interface UserRole {
    id: number;
    name: string;
    description?: string;
}

interface User {
    id: number;
    email: string;
    fullName?: string | null;
    roles: UserRole[];
    lockUntil?: string | null;
    failedLoginAttempts?: number;
    createdAt: string;
    updatedAt: string;
}

interface PaginatedUsers {
    items: User[];
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
}

interface Role {
    id: number;
    name: string;
    description?: string;
}

const roleStyles: Record<string, { bg: string; text: string; label: string }> = {
    super_admin: { bg: 'rgba(168, 85, 247, 0.1)', text: '#a855f7', label: 'Super Admin' },
    admin: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', label: 'Admin' },
    branch_manager: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', label: 'Manager' },
    staff: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e', label: 'Staff' },
    editor: { bg: 'rgba(249, 115, 22, 0.1)', text: '#f97316', label: 'Editor' },
};

const getAvatar = (name: string | null | undefined, roles: UserRole[]) => {
    if (roles.some(r => r.name === 'super_admin')) return '👑';
    if (roles.some(r => r.name === 'admin')) return '🛡️';
    if (roles.some(r => r.name === 'branch_manager')) return '👔';
    if (roles.some(r => r.name === 'editor')) return '✏️';
    return '👤';
};

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({ total: 0, active: 0, locked: 0, admins: 0 });

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({ email: '', fullName: '', tempPassword: '', roleIds: [] as number[] });
    const [saving, setSaving] = useState(false);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [usersRes, rolesRes] = await Promise.all([
                apiClient.get<PaginatedUsers>('/admin/users?limit=50'),
                apiClient.get<Role[]>('/admin/users/roles'),
            ]);
            setUsers(usersRes.data.items);
            setRoles(rolesRes.data);

            // Calculate stats
            const items = usersRes.data.items;
            const now = new Date();
            const lockedCount = items.filter(u => u.lockUntil && new Date(u.lockUntil) > now).length;
            const adminCount = items.filter(u => u.roles.some(r => r.name === 'admin' || r.name === 'super_admin')).length;
            setStats({
                total: items.length,
                active: items.length - lockedCount,
                locked: lockedCount,
                admins: adminCount,
            });
        } catch (err: any) {
            console.error('Failed to fetch users:', err);
            setError(err.response?.data?.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const isLocked = (user: User) => {
        if (!user.lockUntil) return false;
        return new Date(user.lockUntil) > new Date();
    };

    const handleLock = async (id: number) => {
        try {
            await apiClient.put(`/admin/users/${id}/lock`);
            fetchUsers();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to lock user');
        }
    };

    const handleUnlock = async (id: number) => {
        try {
            await apiClient.put(`/admin/users/${id}/unlock`);
            fetchUsers();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to unlock user');
        }
    };

    const handleCreateUser = async () => {
        if (!formData.email || !formData.tempPassword) {
            alert('Email và mật khẩu là bắt buộc');
            return;
        }
        try {
            setSaving(true);
            await apiClient.post('/admin/users', formData);
            setShowAddModal(false);
            setFormData({ email: '', fullName: '', tempPassword: '', roleIds: [] });
            fetchUsers();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to create user');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateRoles = async () => {
        if (!selectedUser) return;
        try {
            setSaving(true);
            await apiClient.put(`/admin/users/${selectedUser.id}/roles`, { roleIds: formData.roleIds });
            setShowEditModal(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to update roles');
        } finally {
            setSaving(false);
        }
    };

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setFormData({ ...formData, roleIds: user.roles.map(r => r.id) });
        setShowEditModal(true);
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 60) return `${diffMins} phút trước`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} giờ trước`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} ngày trước`;
    };

    if (loading) {
        return (
            <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <div style={{ color: '#64748b', fontSize: '1.125rem' }}>Đang tải...</div>
            </div>
        );
    }

    const inputStyle = {
        width: '100%',
        padding: '0.75rem 1rem',
        background: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '10px',
        color: '#f1f5f9',
        fontSize: '0.875rem',
        outline: 'none',
    };

    const labelStyle = {
        display: 'block',
        color: '#94a3b8',
        fontSize: '0.875rem',
        fontWeight: 500,
        marginBottom: '0.5rem',
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>
                        User Management
                    </h1>
                    <p style={{ color: '#64748b' }}>Manage user accounts and permissions</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
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
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                    }}
                >
                    <span>+</span> Add User
                </button>
            </div>

            {/* Error */}
            {error && (
                <div style={{ padding: '1rem', marginBottom: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#f87171' }}>
                    {error}
                </div>
            )}

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Total Users', value: stats.total, icon: '👥' },
                    { label: 'Active', value: stats.active, icon: '✅' },
                    { label: 'Locked', value: stats.locked, icon: '🔒' },
                    { label: 'Admins', value: stats.admins, icon: '👑' },
                ].map((stat) => (
                    <div key={stat.label} style={{ background: '#1e293b', borderRadius: '12px', padding: '1.25rem', border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
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
                    style={{ ...inputStyle, maxWidth: '400px' }}
                />
            </div>

            {/* Users Table */}
            <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #334155', background: '#0f172a' }}>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>User</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>Roles</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>Status</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>Created</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => {
                            const locked = isLocked(user);
                            return (
                                <tr key={user.id} style={{ borderBottom: '1px solid #334155' }}>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                                                {getAvatar(user.fullName, user.roles)}
                                            </div>
                                            <div>
                                                <p style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: '0.125rem' }}>{user.fullName || 'No name'}</p>
                                                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            {user.roles.map((role) => {
                                                const style = roleStyles[role.name] || roleStyles.staff;
                                                return (
                                                    <span key={role.id} style={{ display: 'inline-flex', alignItems: 'center', padding: '0.375rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, background: style.bg, color: style.text, border: `1px solid ${style.text}20` }}>
                                                        {style.label}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: locked ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: locked ? '#ef4444' : '#10b981', border: locked ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)' }}>
                                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor', marginRight: '0.5rem' }} />
                                            {locked ? 'Locked' : 'Active'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                                        {formatDate(user.createdAt)}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button onClick={() => openEditModal(user)} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 500, color: '#f1f5f9', background: '#334155', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                                Edit
                                            </button>
                                            <button onClick={() => locked ? handleUnlock(user.id) : handleLock(user.id)} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 500, color: locked ? '#10b981' : '#f87171', background: locked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                                {locked ? 'Unlock' : 'Lock'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '2rem', width: '100%', maxWidth: '500px' }}>
                        <h2 style={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Thêm User Mới</h2>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={labelStyle}>Email *</label>
                            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="user@laba.vn" style={inputStyle} />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={labelStyle}>Họ tên</label>
                            <input type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} placeholder="Nguyen Van A" style={inputStyle} />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={labelStyle}>Mật khẩu tạm (min 8 ký tự) *</label>
                            <input type="password" value={formData.tempPassword} onChange={(e) => setFormData({ ...formData, tempPassword: e.target.value })} placeholder="TempPass123" style={inputStyle} />
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={labelStyle}>Roles</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {roles.map((role) => (
                                    <label key={role.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: formData.roleIds.includes(role.id) ? 'rgba(16, 185, 129, 0.1)' : '#0f172a', border: formData.roleIds.includes(role.id) ? '2px solid #10b981' : '1px solid #334155', borderRadius: '8px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.roleIds.includes(role.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setFormData({ ...formData, roleIds: [...formData.roleIds, role.id] });
                                                } else {
                                                    setFormData({ ...formData, roleIds: formData.roleIds.filter(id => id !== role.id) });
                                                }
                                            }}
                                            style={{ display: 'none' }}
                                        />
                                        <span style={{ color: formData.roleIds.includes(role.id) ? '#10b981' : '#f1f5f9', fontWeight: 500 }}>{role.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={handleCreateUser} disabled={saving} style={{ flex: 1, padding: '0.875rem', background: saving ? '#334155' : '#10b981', color: saving ? '#94a3b8' : '#020617', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
                                {saving ? 'Đang tạo...' : 'Tạo User'}
                            </button>
                            <button onClick={() => setShowAddModal(false)} style={{ padding: '0.875rem 2rem', background: '#334155', color: '#f1f5f9', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Roles Modal */}
            {showEditModal && selectedUser && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '2rem', width: '100%', maxWidth: '500px' }}>
                        <h2 style={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Chỉnh sửa Roles</h2>
                        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{selectedUser.email}</p>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={labelStyle}>Roles</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {roles.map((role) => (
                                    <label key={role.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: formData.roleIds.includes(role.id) ? 'rgba(16, 185, 129, 0.1)' : '#0f172a', border: formData.roleIds.includes(role.id) ? '2px solid #10b981' : '1px solid #334155', borderRadius: '8px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.roleIds.includes(role.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setFormData({ ...formData, roleIds: [...formData.roleIds, role.id] });
                                                } else {
                                                    setFormData({ ...formData, roleIds: formData.roleIds.filter(id => id !== role.id) });
                                                }
                                            }}
                                            style={{ display: 'none' }}
                                        />
                                        <span style={{ color: formData.roleIds.includes(role.id) ? '#10b981' : '#f1f5f9', fontWeight: 500 }}>{role.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={handleUpdateRoles} disabled={saving} style={{ flex: 1, padding: '0.875rem', background: saving ? '#334155' : '#10b981', color: saving ? '#94a3b8' : '#020617', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
                                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                            <button onClick={() => { setShowEditModal(false); setSelectedUser(null); }} style={{ padding: '0.875rem 2rem', background: '#334155', color: '#f1f5f9', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
