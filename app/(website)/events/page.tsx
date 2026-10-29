import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, MapPin } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { getPublicData, type ChurchEvent } from "@/lib/api/church-api";
import { getPublicWebsiteSettings } from "@/lib/content/website-settings";

const EVENT_TYPE_PHOTOS = [
  {
    src: "https://images.unsplash.com/photo-1519817914152-22d216bb9170?w=700&q=80",
    alt: "Sabbath worship service",
    label: "Worship Services",
    desc: "Sabbath & weekday gatherings",
  },
  {
    src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=700&q=80",
    alt: "Youth group gathering",
    label: "Youth Programs",
    desc: "Camps, rallies & Bible studies",
  },
  {
    src: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=700&q=80",
    alt: "Community outreach volunteers",
    label: "Community Outreach",
    desc: "Serving our neighbours together",
  },
];

function displayDate(date: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "Africa/Kigali" }).format(new Date(`${date}T12:00:00`));
}

function displayTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return value;
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours < 12 ? "AM" : "PM"}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicWebsiteSettings().catch(() => null);
  const name = settings?.churchName || "Our Church";
  return {
    title: `Upcoming Events | ${name}`,
    description: `Discover upcoming worship gatherings, conferences, retreats, youth programmes and community activities at ${name}.`,
    alternates: { canonical: "/events" },
    openGraph: {
      title: `Upcoming Events at ${name}`,
      description: "Keep up with the latest events, meetings, and community gatherings.",
    },
  };
}

export const revalidate = 60;

export default async function EventsPage() {
  const events = await getPublicData<ChurchEvent[]>("/events");
  return (
    <main>
      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }]}
        eyebrow="LIFE AT OUR CHURCH"
        title="Good things are"
        emphasis="coming up."
        description="Keep up with worship gatherings, conferences, retreats, community activities, youth programs and special celebrations."
      />
      {/* Event Type Photos */}
      <section className="bg-surface-strong border-y border-border">
        <div className="page-container py-10">
          <div className="grid gap-4 sm:grid-cols-3">
            {EVENT_TYPE_PHOTOS.map(({ src, alt, label, desc }) => (
              <div key={label} className="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-primary-dark">
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-85"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/70">{desc}</p>
                  <p className="mt-0.5 text-base font-bold text-white">{label}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-muted">
            {[
              { icon: Calendar, text: "Regular Sabbath gatherings" },
              { icon: Clock, text: "Evening & midweek meetings" },
              { icon: MapPin, text: "On-site & community locations" },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-2 font-medium">
                <Icon className="size-4 text-primary" />
                {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="page-container section-space">
        {events?.length ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <article
                className="surface-card group flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                key={event.id}
              >
                {event.flyerUrl && (
                  <div className="relative aspect-[16/10] overflow-hidden bg-surface-strong">
                    <Image
                      alt={`Event: ${event.name}`}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      src={event.flyerUrl}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                    <span className="size-1.5 rounded-full bg-primary" />
                    {displayDate(event.date)}
                  </div>

                  <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-text">
                    <Link
                      className="transition-colors hover:text-primary"
                      href={`/events/${event.id}`}
                    >
                      {event.name}
                    </Link>
                  </h2>

                  {event.description && (
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">
                      {event.description}
                    </p>
                  )}

                  <div className="mt-5 space-y-2.5 rounded-xl border border-border/60 bg-surface-strong/40 p-3.5 text-xs">
                    <div className="flex justify-between gap-2">
                      <span className="font-bold text-muted uppercase">Time</span>
                      <span className="font-semibold text-text">
                        {displayTime(event.time)}
                        {event.endTime ? ` – ${displayTime(event.endTime)}` : ""}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="font-bold text-muted uppercase">Location</span>
                      <span className="font-semibold text-text">{event.location}</span>
                    </div>
                    {event.speaker && (
                      <div className="flex justify-between gap-2">
                        <span className="font-bold text-muted uppercase">Speaker</span>
                        <span className="font-semibold text-text">{event.speaker}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto pt-6">
                    {event.registrationRequired ? (
                      <Link
                        className="button button-primary w-full text-xs uppercase tracking-wider"
                        href={`/contact?topic=${encodeURIComponent(event.name)}`}
                      >
                        Register interest <span aria-hidden="true">→</span>
                      </Link>
                    ) : (
                      <Link
                        className="button button-outline w-full text-xs uppercase tracking-wider"
                        href={`/events/${event.id}`}
                      >
                        View details <span aria-hidden="true">→</span>
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-border p-12 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="size-2 rounded-full bg-secondary" />
              <p className="eyebrow text-primary">UPCOMING EVENTS</p>
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold text-text">
              The calendar is being updated
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Confirmed event dates, times, venues, and registration details will appear here. Contact us if you’re looking for an upcoming gathering.
            </p>
            <Link className="button button-primary mt-6" href="/contact?topic=events">
              Ask about an event <span aria-hidden="true">→</span>
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
