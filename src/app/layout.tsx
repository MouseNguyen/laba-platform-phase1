import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Laba Farm – Landing Phase 1",
    description: "Laba Farm – sống chậm giữa vườn, thở cùng thiên nhiên",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="vi">
            <body className="min-h-screen bg-slate-950 text-slate-50 font-sans antialiased">
                <main className="flex flex-col min-h-screen">
                    {children}
                </main>
            </body>
        </html>
    );
}
