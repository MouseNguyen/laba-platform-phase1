import { Metadata } from 'next';
import Link from 'next/link';
import StandardLayout from '@/components/StandardLayout';

export const metadata: Metadata = {
    title: 'Blog | Laba Platform',
    description: 'Latest news and updates from Laba Platform',
};

// Sample data - will be replaced with API call
const posts = [
    {
        id: 1,
        slug: 'welcome-to-laba-farm',
        title: 'Welcome to Laba Farm Experience',
        excerpt: 'Discover the beauty of sustainable farming and agri-tourism. Learn about our practices, the animals, and the fresh produce we offer.',
        date: 'January 15, 2024',
        category: 'Farm Life',
        author: 'John Doe',
    },
    {
        id: 2,
        slug: 'homestay-booking-guide',
        title: 'Complete Guide to Booking Homestay',
        excerpt: 'Everything you need to know about booking accommodations at Laba. From choosing your room to check-in procedures, we cover it all.',
        date: 'January 10, 2024',
        category: 'Accommodation',
        author: 'Jane Smith',
    },
    {
        id: 3,
        slug: 'best-local-coffee',
        title: 'Tasting the Best Local Coffee',
        excerpt: 'Explore our signature coffee blends and brewing techniques. A journey through the rich flavors of locally sourced beans.',
        date: 'January 05, 2024',
        category: 'Local Delights',
        author: 'Coffee Lover',
    },
    {
        id: 4,
        slug: 'seasonal-harvest-festival',
        title: 'Join Our Seasonal Harvest Festival',
        excerpt: 'Celebrate the bounty of the season with us! Activities for all ages, fresh food, and live music.',
        date: 'December 20, 2023',
        category: 'Events',
        author: 'Event Team',
    },
    {
        id: 5,
        slug: 'sustainable-practices-at-laba',
        title: 'Our Commitment to Sustainable Practices',
        excerpt: 'Learn how Laba Platform is dedicated to eco-friendly farming and tourism, preserving nature for future generations.',
        date: 'December 10, 2023',
        category: 'Sustainability',
        author: 'Environmentalist',
    },
    {
        id: 6,
        slug: 'exploring-local-crafts',
        title: 'Exploring the Richness of Local Crafts',
        excerpt: 'Discover the intricate artistry and traditions behind the handmade crafts from our local community.',
        date: 'November 28, 2023',
        category: 'Culture',
        author: 'Art Enthusiast',
    },
];

export default function BlogPage() {
    return (
        <StandardLayout>
            <section className="space-y-8">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4">
                        Laba Blog
                    </h1>
                    <p className="text-lg text-slate-600">
                        Stories about sustainable farming, local culture, and the future of agri-tourism.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post) => (
                        <article
                            key={post.id}
                            className="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="aspect-video bg-slate-100 relative">
                                {/* Placeholder for blog image */}
                                <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                                    Image
                                </div>
                            </div>
                            <div className="flex flex-1 flex-col p-6">
                                <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                                    <span>{post.category}</span>
                                    <span>•</span>
                                    <span>{post.date}</span>
                                </div>
                                <h2 className="text-xl font-semibold text-slate-900 mb-2">
                                    <Link href={`/blog/${post.slug}`} className="hover:text-emerald-600 transition-colors">
                                        {post.title}
                                    </Link>
                                </h2>
                                <p className="text-slate-600 text-sm line-clamp-3 mb-4 flex-1">
                                    {post.excerpt}
                                </p>
                                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-100">
                                    <div className="h-8 w-8 rounded-full bg-slate-200" />
                                    <span className="text-sm font-medium text-slate-900">
                                        {post.author}
                                    </span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </StandardLayout>
    );
}
