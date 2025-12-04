'use client';

import { ReactNode } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface StandardLayoutProps {
    children: ReactNode;
    theme?: 'light' | 'dark';
}

export default function StandardLayout({ children, theme = 'light' }: StandardLayoutProps) {
    const isDark = theme === 'dark';

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: isDark ? '#020617' : '#ffffff',
                color: isDark ? '#f1f5f9' : '#0f172a',
            }}
        >
            <Header />
            {/* Add padding-top to account for fixed header */}
            <main
                style={{
                    flex: 1,
                    width: '100%',
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '2rem 1rem',
                    marginTop: '64px', // Height of header
                }}
            >
                {children}
            </main>
            <Footer />
        </div>
    );
}
