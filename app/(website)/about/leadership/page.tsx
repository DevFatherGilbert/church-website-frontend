import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/site/page-hero";
import { getPublicData, type PublicContent } from "@/lib/api/church-api";
import { getPublicWebsiteSettings } from "@/lib/content/website-settings";

const path = "/about/leadership";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicWebsiteSettings().catch(() => null);
  const name = settings?.churchName || "Church";
  return {
    title: `Pastoral & Ministry Leadership | ${name}`,
    description: `Meet the pastors, elders, and ministry coordinators who shepherd and serve the faith family at ${name}.`,
    alternates: { canonical: path },
  };
}

export const revalidate = 300;

type Leader = PublicContent & {
  details: PublicContent["details"] & {
    role?: string;
    imageUrl?: string;
    ministryResponsibilities?: string;
    displayOrder?: number;
    email?: string;
    phone?: string;
  };
};

export default async function LeadershipPage() {
  const response = await getPublicData<{ items: Leader[] }>("/content/leaders?limit=100");
  const leaders = response?.items ?? [];

  return <main>
    <PageHero eyebrow="OUR LEADERSHIP" title="People who" emphasis="serve." description="Meet the people who support worship, ministry and care across the church community." breadcrumbs={[{ label: "Home", href: "/" }, { label: "About", href: "/about/our-story" }]} />
    <section aria-label="Published church leaders" className="page-container section-space">
      {leaders.length ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {leaders.map((leader) => (
            <article
              className="surface-card group flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              key={leader.id}
            >
              {leader.details.imageUrl ? (
                <div className="relative aspect-[4/3] overflow-hidden bg-surface-strong">
                  <Image
                    alt={`${leader.title}, ${leader.details.role ?? "church leader"}`}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    src={leader.details.imageUrl}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
              ) : (
                <div
                  aria-hidden="true"
                  className="grid aspect-[4/3] place-items-center bg-gradient-to-br from-primary/10 to-primary/5 font-display text-6xl font-bold text-primary"
                >
                  {leader.title.trim().charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <span className="w-fit rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                  {leader.details.role ?? "Church leader"}
                </span>
                <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-text transition-colors group-hover:text-primary">
                  {leader.title}
                </h2>
                {leader.description && (
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted font-normal">
                    {leader.description}
                  </p>
                )}
                {leader.details.ministryResponsibilities && (
                  <div className="mt-5 rounded-xl border border-border/60 bg-surface-strong/40 p-3.5 text-xs">
                    <h3 className="font-bold uppercase tracking-wider text-muted">
                      Responsibilities
                    </h3>
                    <p className="mt-1 text-text leading-relaxed">
                      {leader.details.ministryResponsibilities}
                    </p>
                  </div>
                )}
                {(leader.details.email || leader.details.phone) && (
                  <div className="mt-auto border-t border-border/60 pt-4 text-xs font-semibold">
                    {leader.details.email && (
                      <a
                        className="block break-all text-primary transition-colors hover:text-primary-hover"
                        href={`mailto:${leader.details.email}`}
                      >
                        ✉ {leader.details.email}
                      </a>
                    )}
                    {leader.details.phone && (
                      <a
                        className="mt-1 block text-primary transition-colors hover:text-primary-hover"
                        href={`tel:${leader.details.phone}`}
                      >
                        📞 {leader.details.phone}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="surface-card mx-auto max-w-2xl rounded-2xl p-10 text-center sm:p-12">
          <div className="flex items-center justify-center gap-2">
            <span className="size-2 rounded-full bg-secondary" />
            <p className="eyebrow text-primary">LEADERSHIP</p>
          </div>
          <h2 className="mt-3 font-display text-2xl font-bold text-text">
            Serving the church together
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Approved leadership profiles will appear here when they are published. To connect with a ministry, please contact the church.
          </p>
          <a className="button button-primary mt-6" href="/contact">
            Contact the church <span>→</span>
          </a>
        </div>
      )}
    </section>
  </main>;
}
