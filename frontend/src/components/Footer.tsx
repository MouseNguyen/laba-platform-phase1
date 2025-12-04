'use client';

export default function Footer() {
    return (
        <footer
            style={{
                padding: '2rem 1.5rem',
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc',
                color: '#64748b',
            }}
        >
            <div
                style={{
                    maxWidth: '1100px',
                    margin: '0 auto',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                    fontSize: '0.875rem',
                }}
            >
                <div>
                    © {new Date().getFullYear()} Laba Platform. All rights reserved.
                </div>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                    }}
                >
                    <span>Backend: NestJS + Prisma</span>
                    <span>•</span>
                    <span>Frontend: Next.js</span>
                </div>
            </div>
        </footer>
    );
}
