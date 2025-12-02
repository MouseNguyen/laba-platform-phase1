// =============================================
// Laba Platform - Root Layout (FE3)
// =============================================

import type { Metadata } from 'next';
import '@/styles/globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'Laba Platform – Phase 1',
  description: 'Laba Platform – Nền tảng quản lý Farm, Homestay, Cafe',
  keywords: ['laba', 'farm', 'homestay', 'cafe', 'platform'],
  authors: [{ name: 'Laba Team' }],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="vi">
      <body>
        <AuthProvider>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
