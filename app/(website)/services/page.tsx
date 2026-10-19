import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarDays, Clock3, Heart, MapPin, Sparkles, Users } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { getPublicData, type PublicContent } from "@/lib/api/church-api";
import { formatServiceDate, formatServiceTime, sortServices, toChurchService, type ChurchService } from "@/lib/content/services";

export const metadata: Metadata = {
  title: "Worship Services & Gathering Times | Sabbath Worship",
  description: "Find current Sabbath worship gatherings, Bible studies, prayer meetings, and special services. Experience warm fellowship and uplifting worship.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Worship Services & Gathering Times",
    description: "Join us for Sabbath worship, prayer, Bible study, and special gatherings.",
  },
};

export const revalidate = 60;

const servicePhotos = [
  "https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=800&q=80",
];

const visitorSteps = [
  {
    step: "01",
    title: "Warm Arrival & Easy Parking",
    description: "Our hospitality greeters are at the doors to welcome you, answer questions, and direct you to the sanctuary.",
    imageUrl: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&q=80",
    imageAlt: "Welcoming church entrance and friendly smiles",
  },
  {
    step: "02",
    title: "Bible Study for All Ages",
    description: "Interactive Sabbath School classes for adults, youth, and children where everyone can ask questions and study God's Word.",
    imageUrl: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=600&q=80",
    imageAlt: "Interactive Sabbath School class studying the Bible",
  },
  {
    step: "03",
    title: "Inspiring Worship & Preaching",
    description: "Uplifting choir and congregational singing followed by practical, Christ-centered sermons from the Scriptures.",
    imageUrl: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=600&q=80",
    imageAlt: "Worship sanctuary during prayer and praise",
  },
  {
    step: "04",
    title: "Fellowship & Refreshments",
    description: "Stay after the service to meet new friends, enjoy warm conversation, and share in Christian fellowship.",
    imageUrl: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=600&q=80",
    imageAlt: "Members sharing fellowship lunch together",
  },
];

export default async function ServicesPage() {
  const response = await getPublicData<{ items: PublicContent[] }>("/content/services?limit=50");
  const services = sortServices((response?.items ?? []).map(toChurchService));
  const regular = services.filter((service) => service.scheduleType === "weekly");
  const special = services.filter((service) => service.scheduleType === "special");

  return (
    <main className="bg-background">
      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }]}
        description="Find our regular Sabbath worship gatherings, interactive Bible studies, midweek prayer meetings, and special celebrations."
        emphasis="for you."
        eyebrow="GATHER WITH US"
        title="There’s always a place"
      />

      {/* ── Regular Worship Services with Photography (SRS Section 12 & 26) ── */}
      <section className="page-container py-16 sm:py-24">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-secondary">
            REGULAR SERVICES
          </p>
          <h2 className="font-headline mt-2 text-3xl sm:text-4xl font-bold uppercase tracking-wide text-primary">
            Weekly Worship Gatherings
          </h2>
          <p className="mt-3 text-base text-muted">
            We would love to have you join us for worship, biblical study, and genuine fellowship this Sabbath.
          </p>
        </div>

        {regular.length ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {regular.map((service, index) => {
              const photo = servicePhotos[index % servicePhotos.length];
              return (
                <article
                  className="group flex flex-col overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
                  key={service.id}
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-stone-900">
                    <Image
                      alt={`${service.title} gathering`}
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      src={photo}
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/85 via-transparent to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-stone-950">
                        {service.serviceType || "Weekly Service"}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2 text-xs font-bold text-white">
                      <Clock3 className="size-4 text-secondary" />
                      <span>{formatServiceDate(service)} · {formatServiceTime(service)}</span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-6 sm:p-7">
                    <div>
                      <h3 className="font-display text-2xl font-bold text-text group-hover:text-primary transition-colors">
                        {service.title}
                      </h3>
                      {service.description && (
                        <p className="mt-3 text-sm leading-relaxed text-muted font-normal">
                          {service.description}
                        </p>
                      )}

                      <div className="mt-5 space-y-2 rounded-xl bg-surface-strong/60 p-3.5 text-xs">
                        {service.location && (
                          <div className="flex items-center gap-2 text-stone-700">
                            <MapPin className="size-3.5 text-primary shrink-0" />
                            <span className="truncate">{service.location}</span>
                          </div>
                        )}
                        {service.targetAudience && (
                          <div className="flex items-center gap-2 text-stone-700">
                            <Users className="size-3.5 text-primary shrink-0" />
                            <span>{service.targetAudience}</span>
                          </div>
                        )}
                      </div>

                      {service.instructions && (
                        <p className="mt-3 text-xs italic text-amber-800">
                          Note: {service.instructions}
                        </p>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-border/60">
                      <Link
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary group-hover:translate-x-1 transition-transform"
                        href="/plan-your-visit"
                      >
                        Plan your visit for this service <ArrowUpRight className="size-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted">
            Approved regular service times will be listed here when available.
          </p>
        )}

        {/* Special Services */}
        {special.length > 0 && (
          <div className="mt-20">
            <div className="max-w-2xl mb-8">
              <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-secondary">
                SPECIAL EVENTS
              </p>
              <h2 className="font-headline mt-2 text-3xl sm:text-4xl font-bold uppercase tracking-wide text-primary">
                Special Services & Vigils
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {special.map((service) => (
                <article className="surface-card flex flex-col justify-between p-7 rounded-2xl" key={service.id}>
                  <div>
                    <span className="inline-block rounded-full bg-secondary/30 px-3 py-1 text-xs font-bold text-amber-950 uppercase tracking-wider">
                      {service.serviceType || "Special Gathering"}
                    </span>
                    <h3 className="font-display mt-3 text-2xl font-bold text-text">{service.title}</h3>
                    {service.description && (
                      <p className="mt-2 text-sm text-muted">{service.description}</p>
                    )}
                    <p className="mt-4 text-xs font-bold text-primary">
                      {formatServiceDate(service)} · {formatServiceTime(service)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── What to Expect on Your First Visit: Visual 4-Step Walkthrough ── */}
      <section className="bg-surface-strong/70 py-16 sm:py-24 border-y border-border/80">
        <div className="page-container">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-secondary">
              FIRST TIME VISITING?
            </p>
            <h2 className="font-headline mt-2 text-3xl sm:text-4xl font-bold uppercase tracking-wide text-primary">
              What to Expect on the Sabbath
            </h2>
            <p className="mt-3 text-base text-muted">
              We know visiting a new church can be intimidating. Here is a quick visual look at how your Sabbath morning with us will feel.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {visitorSteps.map((step) => (
              <div
                className="group flex flex-col overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                key={step.title}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-stone-900">
                  <Image
                    alt={step.imageAlt}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    src={step.imageUrl}
                    unoptimized
                  />
                  <div className="absolute top-3 left-3 flex size-8 items-center justify-center rounded-full bg-secondary font-display text-xs font-extrabold text-stone-950 shadow-md">
                    {step.step}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <h3 className="font-display text-lg font-bold text-text group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted font-normal">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Plan Your Visit CTA Banner ── */}
      <section className="page-container py-16 sm:py-20">
        <div className="rounded-3xl bg-primary-dark p-8 text-white sm:p-12 lg:p-14 flex flex-col md:flex-row md:items-center md:justify-between gap-8 shadow-xl">
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
              READY TO JOIN US?
            </span>
            <h3 className="font-display mt-2 text-2xl sm:text-3xl font-bold">
              Let Us Save You a Seat This Sabbath
            </h3>
            <p className="mt-3 text-sm text-white/80">
              Tell our hospitality team you are coming and we will have someone ready at the doors to guide you, show your children their classes, and make your visit unforgettable.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link className="button button-secondary text-xs uppercase tracking-wider font-bold px-7 py-3.5" href="/plan-your-visit">
              Plan Your Visit <ArrowRight className="size-4" />
            </Link>
            <Link className="button border-2 border-white/40 bg-white/10 text-white text-xs uppercase tracking-wider font-bold px-6 py-3.5 hover:bg-white/20" href="/contact">
              Directions & Map
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
