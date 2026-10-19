import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3, Heart, MapPin, Sparkles } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import type { SitePage } from "@/lib/content/site-pages";

export function SiteContentLayout({
  page,
  path,
  children,
}: {
  page: SitePage;
  path: string;
  children: ReactNode;
}) {
  const parentSegment = path.split("/")[1] || "home";

  return (
    <main className="bg-background">
      <PageHero
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: parentSegment.replaceAll("-", " "), href: `/${parentSegment}` },
        ]}
        description={page.description}
        emphasis={page.emphasis}
        eyebrow={page.eyebrow}
        title={page.title}
      />
      <section className="page-container py-16 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div className="min-w-0">
            <h2 className="font-headline text-3xl font-bold uppercase tracking-wide text-primary sm:text-4xl">
              {page.heading}
            </h2>
            <div className="prose-content mt-6 max-w-2xl text-base leading-relaxed text-muted">
              {page.body}
            </div>
            {children}
          </div>

          {/* Right visual sidebar */}
          <aside className="space-y-6 sm:sticky sm:top-28 h-fit">
            {/* Visual Visit Callout Card */}
            <div className="relative overflow-hidden rounded-2xl bg-stone-900 shadow-md">
              <div className="relative aspect-[16/10] w-full">
                <Image
                  alt="Church community in joyful worship"
                  className="object-cover"
                  fill
                  sizes="(max-width: 1024px) 100vw, 35vw"
                  src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/90 via-primary-dark/40 to-transparent" />
                <div className="absolute bottom-4 left-5 right-5 text-white">
                  <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-stone-950">
                    JOIN US THIS SABBATH
                  </span>
                  <p className="font-display mt-2 text-base font-bold text-white">
                    Experience Warm Fellowship & Inspiring Worship
                  </p>
                  <Link
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-secondary hover:text-white transition-colors"
                    href="/plan-your-visit"
                  >
                    <span>Plan Your Visit</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Explore Links */}
            <div className="surface-card rounded-2xl p-6 sm:p-7 border border-primary/10">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-secondary" />
                <p className="eyebrow text-primary text-xs font-bold uppercase tracking-wider">
                  QUICK NAVIGATION
                </p>
              </div>
              <nav className="mt-4 grid divide-y divide-border/60">
                {(
                  page.links ?? [
                    { label: "Plan Your Visit", href: "/plan-your-visit" },
                    { label: "Worship Services", href: "/services" },
                    { label: "Church Ministries", href: "/ministries" },
                    { label: "Submit Prayer Request", href: "/prayer-request" },
                    { label: "Get in Touch", href: "/contact" },
                  ]
                ).map((link) => (
                  <Link
                    className="group flex min-h-11 items-center justify-between gap-3 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-700 transition-colors hover:text-primary"
                    href={link.href}
                    key={link.href}
                  >
                    <span>{link.label}</span>
                    <span
                      aria-hidden="true"
                      className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary"
                    >
                      →
                    </span>
                  </Link>
                ))}
              </nav>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
