import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/site/page-hero";
import { getPublicData, type Ministry } from "@/lib/api/church-api";
import { getPublicWebsiteSettings } from "@/lib/content/website-settings";
import { DEFAULT_MINISTRIES } from "@/lib/content/default-ministries";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicWebsiteSettings().catch(() => null);
  const name = settings?.churchName || "Church";
  return {
    title: `Ministries | ${name}`,
    description: `Explore church ministries at ${name} and find a place to connect, grow, and serve.`,
    alternates: { canonical: "/ministries" },
  };
}

export const revalidate = 60;

export default async function MinistriesPage() {
  const apiItems = await getPublicData<Ministry[]>("/ministries");
  const items = apiItems && apiItems.length > 0 ? apiItems : DEFAULT_MINISTRIES;

  return <main>
    <PageHero eyebrow="FIND YOUR PEOPLE" title="There’s more than" emphasis="one way in." description="Explore the ministries and groups that help people connect, grow in faith, and serve the community." breadcrumbs={[{ label: "Home", href: "/" }]} />
    <section className="page-container section-space" aria-label="Published ministries">
      {items?.length ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((ministry) => (
            <article
              className="surface-card group flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              key={ministry.id}
            >
              {ministry.imageUrl && (
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-strong">
                  <Image
                    alt={`${ministry.name} ministry`}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    src={ministry.imageUrl}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
              )}
              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <div className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-secondary" />
                  <p className="eyebrow text-primary">MINISTRY</p>
                </div>

                <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-text transition-colors group-hover:text-primary">
                  {ministry.name}
                </h2>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">
                  {ministry.description}
                </p>

                <div className="mt-5 space-y-2.5 rounded-xl border border-border/60 bg-surface-strong/40 p-3.5 text-xs">
                  {ministry.targetAudience && (
                    <div className="flex justify-between gap-2">
                      <span className="font-bold text-muted uppercase">Who it serves</span>
                      <span className="font-semibold text-text">{ministry.targetAudience}</span>
                    </div>
                  )}
                  {ministry.meetingSchedule && (
                    <div className="flex justify-between gap-2">
                      <span className="font-bold text-muted uppercase">Schedule</span>
                      <span className="font-semibold text-text">{ministry.meetingSchedule}</span>
                    </div>
                  )}
                  {ministry.location && (
                    <div className="flex justify-between gap-2">
                      <span className="font-bold text-muted uppercase">Location</span>
                      <span className="font-semibold text-text">{ministry.location}</span>
                    </div>
                  )}
                </div>

                {ministry.leader && (
                  <p className="mt-4 text-xs font-medium text-muted">
                    Led by <span className="font-semibold text-text">{ministry.leader}</span>
                  </p>
                )}

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6">
                  <Link
                    className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-primary transition-colors hover:text-primary-hover"
                    href={`/ministries/${ministry.slug}`}
                  >
                    Learn more <span className="ml-1" aria-hidden="true">→</span>
                  </Link>
                  <Link
                    className="button button-outline text-xs uppercase tracking-wider !py-2 !px-3.5"
                    href={ministry.ctaUrl || `/ministries/${ministry.slug}`}
                  >
                    {ministry.ctaLabel || "Get involved"}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-border p-12 text-center">
          <h2 className="font-display text-2xl font-bold text-text">Ministry information is coming soon</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Published ministries will appear here. Contact the church if you would like help finding a place to connect.
          </p>
          <Link className="button button-primary mt-6" href="/contact">
            Contact the church
          </Link>
        </div>
      )}
    </section>
  </main>;
}
