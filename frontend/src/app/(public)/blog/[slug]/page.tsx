import { Metadata } from 'next';

interface BlogPostPageProps {
    params: {
        slug: string;
    };
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
    return {
        title: `${params.slug} | Laba Platform Blog`,
        description: `Read about ${params.slug} on Laba Platform`,
    };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
    return (
        <article className="space-y-6 max-w-3xl">
            <header className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Blog Post: {params.slug}
                </h1>
                <p className="text-slate-600">
                    This is a dynamic blog post page. The content for "{params.slug}" will be loaded from the API.
                </p>
            </header>

            <section className="prose prose-slate max-w-none">
                <p className="text-slate-600">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    This is placeholder content that will be replaced with real blog post data from the CMS.
                </p>

                <p className="text-slate-600">
                    To implement: Fetch post data using the slug from params in a Server Component or use getStaticProps/getServerSideProps.
                </p>
            </section>
        </article>
    );
}
