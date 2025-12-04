import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About Us | Laba Platform',
    description: 'Learn about Laba Platform - multi-branch management system',
};

import StandardLayout from '@/components/StandardLayout';

export default function AboutPage() {
    return (
        <StandardLayout>
            <section className="space-y-6 max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                    About Laba Platform
                </h1>

                <div className="prose prose-slate max-w-none">
                    <p className="text-lg text-slate-600 leading-relaxed">
                        Laba Platform is a comprehensive multi-branch management system designed for
                        modern hospitality and agriculture businesses. Our platform seamlessly integrates
                        Farm Tours, Homestay bookings, Cafe operations, and retail Shop management.
                    </p>

                    <p className="text-slate-600 leading-relaxed">
                        Built with scalability in mind, Laba Platform empowers businesses to manage
                        their operations across multiple locations through a single, unified dashboard.
                        From inventory and staff management to customer bookings and POS systems,
                        everything is connected.
                    </p>

                    <p className="text-slate-600 leading-relaxed">
                        Our mission is to simplify complex multi-location operations while providing
                        exceptional customer experiences and data-driven insights for business growth.
                    </p>
                </div>
            </section>
        </StandardLayout>
    );
}
