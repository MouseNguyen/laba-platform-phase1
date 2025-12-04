import { ReactNode } from 'react';
import Link from 'next/link';

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <div className="min-h-screen flex bg-slate-100">
            {/* Sidebar */}
            <aside style={{ width: '256px', backgroundColor: '#0f172a', color: '#f1f5f9', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #1e293b' }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: '#10b981' }}>
                        <span style={{ fontSize: '1.25rem' }}>🏠</span>
                        <span style={{ fontSize: '0.875rem' }}>Về Trang Chủ</span>
                    </Link>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginTop: '1rem', color: '#f1f5f9' }}>Laba Admin</h2>
                </div>

                <nav style={{ flex: 1, padding: '1rem' }}>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li>
                            <Link
                                href="/dashboard"
                                style={{ display: 'block', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.875rem', color: '#cbd5e1', textDecoration: 'none' }}
                            >
                                📊 Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/users"
                                style={{ display: 'block', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.875rem', color: '#cbd5e1', textDecoration: 'none' }}
                            >
                                👥 Users
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/branches"
                                style={{ display: 'block', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.875rem', color: '#cbd5e1', textDecoration: 'none' }}
                            >
                                🏢 Branches
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/posts"
                                style={{ display: 'block', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.875rem', color: '#cbd5e1', textDecoration: 'none' }}
                            >
                                📝 Posts
                            </Link>
                        </li>
                    </ul>
                </nav>

                <div style={{ padding: '1rem', borderTop: '1px solid #1e293b' }}>
                    <Link href="/login" style={{ display: 'block', fontSize: '0.875rem', color: '#94a3b8', textDecoration: 'none' }}>
                        🚪 Đăng xuất
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow-sm border-b">
                    <div className="px-6 py-4">
                        <h1 className="text-2xl font-semibold text-slate-900">Admin Portal</h1>
                    </div>
                </header>

                <main className="flex-1 p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
