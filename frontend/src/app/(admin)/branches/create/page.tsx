'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/apiClient';

type BranchType = 'FARM' | 'HOMESTAY' | 'CAFE' | 'SHOP';

interface CreateBranchForm {
    code: string;
    name: string;
    type: BranchType;
    address: string;
    phone: string;
    isActive: boolean;
    settings: {
        timezone: string;
        openHours?: { from: string; to: string };
    };
}

const BRANCH_TYPES: { value: BranchType; label: string; icon: string }[] = [
    { value: 'FARM', label: 'Nông trại', icon: '🌾' },
    { value: 'HOMESTAY', label: 'Homestay', icon: '🏡' },
    { value: 'CAFE', label: 'Quán cà phê', icon: '☕' },
    { value: 'SHOP', label: 'Cửa hàng', icon: '🛒' },
];

export default function CreateBranchPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState<CreateBranchForm>({
        code: '',
        name: '',
        type: 'FARM',
        address: '',
        phone: '',
        isActive: true,
        settings: {
            timezone: 'Asia/Ho_Chi_Minh',
            openHours: { from: '07:00', to: '17:00' },
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setForm((prev) => ({ ...prev, [name]: checked }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = {
                code: form.code.toUpperCase().replace(/[^A-Z0-9_]/g, '_'),
                name: form.name,
                type: form.type,
                address: form.address || undefined,
                phone: form.phone || undefined,
                isActive: form.isActive,
                settings: form.settings,
            };

            await apiClient.post('/branches', payload);
            router.push('/branches');
        } catch (err: any) {
            console.error('Create branch error:', err);
            setError(err.response?.data?.message || 'Không thể tạo chi nhánh');
        } finally {
            setLoading(false);
        }
    };

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
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/branches" style={{ color: '#64748b', fontSize: '0.875rem', textDecoration: 'none' }}>
                    ← Quay lại danh sách
                </Link>
                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: 800,
                    color: '#f1f5f9',
                    marginTop: '1rem',
                    letterSpacing: '-0.025em'
                }}>
                    Tạo Chi nhánh mới
                </h1>
                <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
                    Điền thông tin để tạo chi nhánh mới
                </p>
            </div>

            {/* Error */}
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

            {/* Form */}
            <form onSubmit={handleSubmit}>
                <div style={{
                    background: '#1e293b',
                    borderRadius: '16px',
                    border: '1px solid #334155',
                    padding: '2rem',
                }}>
                    {/* Code & Name */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={labelStyle}>Mã chi nhánh *</label>
                            <input
                                type="text"
                                name="code"
                                value={form.code}
                                onChange={handleChange}
                                placeholder="VD: FARM_MAIN"
                                required
                                style={inputStyle}
                            />
                            <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                Chỉ chữ IN HOA, số và dấu gạch dưới
                            </p>
                        </div>
                        <div>
                            <label style={labelStyle}>Tên chi nhánh *</label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="VD: Laba Farm - Main"
                                required
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    {/* Type */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={labelStyle}>Loại chi nhánh *</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                            {BRANCH_TYPES.map((type) => (
                                <label
                                    key={type.value}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        padding: '1rem',
                                        background: form.type === type.value ? 'rgba(16, 185, 129, 0.1)' : '#0f172a',
                                        border: form.type === type.value ? '2px solid #10b981' : '1px solid #334155',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name="type"
                                        value={type.value}
                                        checked={form.type === type.value}
                                        onChange={handleChange}
                                        style={{ display: 'none' }}
                                    />
                                    <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{type.icon}</span>
                                    <span style={{ color: form.type === type.value ? '#10b981' : '#f1f5f9', fontWeight: 500 }}>
                                        {type.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Address & Phone */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={labelStyle}>Địa chỉ</label>
                            <input
                                type="text"
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                placeholder="VD: Thôn 5, Xã Lạc Dương, Lâm Đồng"
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Số điện thoại</label>
                            <input
                                type="text"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="VD: +84 123 456 789"
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    {/* isActive */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={form.isActive}
                                onChange={handleChange}
                                style={{ width: '20px', height: '20px', accentColor: '#10b981' }}
                            />
                            <span style={{ color: '#f1f5f9', fontWeight: 500 }}>Kích hoạt chi nhánh</span>
                        </label>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #334155' }}>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                flex: 1,
                                padding: '0.875rem',
                                background: loading ? '#334155' : '#10b981',
                                color: loading ? '#94a3b8' : '#020617',
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                cursor: loading ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {loading ? 'Đang tạo...' : 'Tạo Chi nhánh'}
                        </button>
                        <Link
                            href="/branches"
                            style={{
                                padding: '0.875rem 2rem',
                                background: '#334155',
                                color: '#f1f5f9',
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                textDecoration: 'none',
                                textAlign: 'center',
                            }}
                        >
                            Hủy
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
}
