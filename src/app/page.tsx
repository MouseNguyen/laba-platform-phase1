// src/app/page.tsx
import Image from "next/image";
import { getLanding } from "@/lib/apiClient";
import type { LandingBlock } from "@/types/landing";

function SectionBlock({
  block,
  reverse = false,
}: {
  block: LandingBlock;
  reverse?: boolean;
}) {
  return (
    <section className="border-b border-slate-800/70 bg-slate-950">
      <div
        className={`mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-12 md:px-6 md:py-16 ${
          reverse ? "md:flex-row-reverse" : "md:flex-row"
        }`}
      >
        {/* Text */}
        <div className="flex-1 space-y-4">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
            {block.key}
          </p>
          <h2 className="text-2xl font-semibold text-emerald-50 md:text-3xl">
            {block.title}
          </h2>

          {block.subtitle && (
            <p className="text-sm text-emerald-100/80">{block.subtitle}</p>
          )}

          <p className="text-sm leading-relaxed text-slate-100/90">
            {block.short_story}
          </p>

          {block.story_link && (
            <a
              href={block.story_link}
              target={block.story_link_target || "_self"}
              className="inline-flex items-center text-xs font-medium text-emerald-300 hover:text-emerald-200"
            >
              Đọc thêm câu chuyện
              <span className="ml-1">↗</span>
            </a>
          )}
        </div>

        {/* Image */}
        <div className="flex-1 w-full md:max-w-md">
          {block.image_url ? (
            <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900">
              <Image
                src={block.image_url}
                alt={block.image_alt || block.title}
                width={1200}
                height={900}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-700 text-xs text-slate-500">
              No image
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const landing = await getLanding("vi");

  const blocks = [...landing.blocks].sort(
    (a, b) => a.sort_order - b.sort_order,
  );

  const hero = blocks.find((b) => b.key === "hero");
  const farm = blocks.find((b) => b.key === "farm");
  const homestay = blocks.find((b) => b.key === "homestay");
  const cafe = blocks.find((b) => b.key === "cafe");
  const about = blocks.find((b) => b.key === "about");

  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      {/* HERO */}
      {hero && (
        <section className="border-b border-slate-800/80 bg-slate-950">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-12 md:flex-row md:px-6 md:py-16">
            {/* Text */}
            <div className="flex-1 space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/80">
                Laba Platform · Phase 1
              </p>
              <h1 className="text-3xl font-semibold leading-tight text-emerald-50 md:text-4xl">
                {hero.title}
              </h1>
              {hero.subtitle && (
                <p className="text-base text-emerald-200/80">
                  {hero.subtitle}
                </p>
              )}
              <p className="text-sm leading-relaxed text-slate-100/90">
                {hero.short_story}
              </p>
            </div>

            {/* Image */}
            {hero.image_url && (
              <div className="flex-1 w-full md:max-w-md">
                <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900">
                  <Image
                    src={hero.image_url}
                    alt={hero.image_alt || hero.title}
                    width={1600}
                    height={900}
                    priority
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* OTHER SECTIONS */}
      <div className="pb-16 pt-4">
        {farm && <SectionBlock block={farm} />}
        {homestay && <SectionBlock block={homestay} reverse />}
        {cafe && <SectionBlock block={cafe} />}
        {about && <SectionBlock block={about} reverse />}
      </div>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-xs text-slate-400 md:px-6">
          <span>
            © {new Date().getFullYear()} Laba Farm. All rights reserved.
          </span>
          <span className="hidden md:inline">
            Backend: NestJS + Prisma · Frontend: Next.js
          </span>
        </div>
      </footer>
    </main>
  );
}
