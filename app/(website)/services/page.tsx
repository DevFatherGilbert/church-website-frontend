import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/page-hero";
import { getPublicData, type PublicContent } from "@/lib/api/church-api";
import { formatServiceDate, formatServiceTime, sortServices, toChurchService, type ChurchService } from "@/lib/content/services";

export const metadata: Metadata = {
  title: "Worship Services & Gathering Times | Church",
    description: "Find current Sabbath worship gatherings, Bible studies, prayer meetings, and special services.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Worship Services & Gathering Times",
    description: "Join us for Sabbath worship, prayer, Bible study, and special gatherings.",
  },
};

export const revalidate = 60;

export default async function ServicesPage() {
  const response = await getPublicData<{ items: PublicContent[] }>("/content/services?limit=50");
  const services = sortServices((response?.items ?? []).map(toChurchService));
  const regular = services.filter((service) => service.scheduleType === "weekly");
  const special = services.filter((service) => service.scheduleType === "special");

  return (
    <main>
      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }]}
        eyebrow="GATHER WITH US"
        title="There’s a place"
        emphasis="for you."
        description="Find current worship gatherings, Bible studies, prayer meetings and special services."
      />
      <section className="page-container section-space">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-secondary" />
          <p className="eyebrow text-primary">REGULAR GATHERINGS</p>
        </div>
        <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
          Weekly worship & fellowship
        </h2>

        {regular.length ? (
          <ServiceList services={regular} />
        ) : (
          <p className="mt-7 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted">
            Approved regular service times will be listed here when available.
          </p>
        )}

        {special.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-secondary" />
              <p className="eyebrow text-primary">SPECIAL SERVICES</p>
            </div>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
              Upcoming gatherings
            </h2>
            <ServiceList services={special} />
          </div>
        )}

        <div className="mt-14 rounded-2xl border border-border/80 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-8 sm:p-10">
          <h3 className="font-display text-xl font-bold text-text">
            Planning to join us for the first time?
          </h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            We&apos;d love to welcome you! Let us know you&apos;re coming and we&apos;ll save you a seat, show you around, and help you get connected.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link className="button button-primary" href="/plan-your-visit">
              Plan your visit <span aria-hidden="true">→</span>
            </Link>
            <Link className="button button-outline" href="/contact">
              Ask a question
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function ServiceList({ services }: { services: ChurchService[] }) {
  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2">
      {services.map((service) => (
        <article
          className="surface-card flex flex-col justify-between p-6 sm:p-8"
          key={service.id}
        >
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                {service.serviceType}
              </span>
              <span className="text-xs font-semibold text-muted">
                {service.scheduleType === "special" ? "Special Event" : "Weekly"}
              </span>
            </div>

            <h3 className="mt-4 font-display text-2xl font-bold text-text">
              {service.title}
            </h3>

            {service.description && (
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {service.description}
              </p>
            )}

            <div className="mt-6 space-y-3 rounded-xl border border-border/60 bg-surface-strong/50 p-4 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-muted uppercase tracking-wider">
                  {service.scheduleType === "special" ? "Date & Time" : "Day & Time"}
                </span>
                <span className="font-semibold text-text">
                  {formatServiceDate(service)} · {formatServiceTime(service)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-muted uppercase tracking-wider">Location</span>
                <span className="font-semibold text-text">
                  {service.location || "Contact the congregation to confirm"}
                </span>
              </div>
              {service.targetAudience && (
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-muted uppercase tracking-wider">Audience</span>
                  <span className="font-semibold text-text">{service.targetAudience}</span>
                </div>
              )}
            </div>

            {service.instructions && (
              <p className="mt-3 text-xs italic text-muted">
                Note: {service.instructions}
              </p>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
