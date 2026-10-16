import type { ReactNode } from "react";
import Link from "next/link";
import { PageHero } from "@/components/site/page-hero";
import type { SitePage } from "@/lib/content/site-pages";

export function SiteContentLayout({ page, path, children }: { page: SitePage; path: string; children: ReactNode }) {
  const parentSegment = path.split("/")[1];

  return (
    <main>
      <PageHero
        eyebrow={page.eyebrow}
        title={page.title}
        emphasis={page.emphasis}
        description={page.description}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: parentSegment.replaceAll("-", " "), href: `/${parentSegment}` },
        ]}
      />
      <section className="page-container section-space">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:gap-16">
          <div className="min-w-0">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
              {page.heading}
            </h2>
            <div className="prose-content mt-6 max-w-2xl text-base leading-relaxed text-muted">
              {page.body}
            </div>
            {children}
          </div>
          <aside className="surface-card h-fit rounded-2xl p-6 sm:sticky sm:top-28 sm:p-8">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-secondary" />
              <p className="eyebrow text-muted">EXPLORE MORE</p>
            </div>
            <nav className="mt-5 grid divide-y divide-border/60">
              {(
                page.links ?? [
                  { label: "Plan your visit", href: "/plan-your-visit" },
                  { label: "Get in touch", href: "/contact" },
                ]
              ).map((link) => (
                <Link
                  className="group flex min-h-12 items-center justify-between gap-3 py-3.5 text-sm font-semibold text-text transition-colors hover:text-primary"
                  href={link.href}
                  key={link.href}
                >
                  <span>{link.label}</span>
                  <span
                    aria-hidden="true"
                    className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
                  >
                    ↗
                  </span>
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      </section>
    </main>
  );
}
