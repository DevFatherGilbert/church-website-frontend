import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, Heart, MapPin, Shield, Sparkles, Users } from "lucide-react";
import { SubmissionForm } from "../forms/submission-form";
import { PageHero } from "../site/page-hero";
import { formatServiceDate, formatServiceTime, type ChurchService } from "@/lib/content/services";
import type { ChurchInformation } from "@/lib/content/website-settings";

const visitAssurances = [
  {
    title: "Dedicated Parking & Easy Arrival",
    description: "Ample on-site parking with friendly parking attendants ready to guide you straight to the entrance.",
    icon: "🚗",
  },
  {
    title: "Come As You Are",
    description: "Whether you wear Sunday best, cultural attire, or casual clothes, there is zero dress code pressure.",
    icon: "👔",
  },
  {
    title: "Safe, Engaging Children's Care",
    description: "Fun, Christ-centered Sabbath School classes with screened volunteers where your children will thrive.",
    icon: "👶",
  },
  {
    title: "A Friendly Host Just for You",
    description: "A host will meet you at the door, show you where to sit, introduce you to friends, and give you a welcome packet.",
    icon: "🤝",
  },
];

export function PlanYourVisitPage({
  services,
  contact,
}: {
  services: ChurchService[];
  contact: ChurchInformation["contact"];
}) {
  const address = [contact.address, contact.city, contact.country]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="bg-background">
      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }]}
        description="Visiting a new church should feel welcoming, not intimidating. Let us know you are coming and we will save you a seat, show you around, and ensure your family has a wonderful Sabbath."
        emphasis="save you a seat."
        eyebrow="YOUR FIRST VISIT"
        title="Come as you are, we’ll"
      />

      {/* ── Visual Experience Preview Section ── */}
      <section className="page-container py-12 sm:py-20 border-b border-border/80">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-secondary">
              FIRST-TIME VISITOR GUIDE
            </p>
            <h2 className="font-headline mt-3 text-2xl sm:text-4xl font-bold uppercase tracking-wide text-primary leading-tight">
              We Can&apos;t Wait to Meet You
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Whether you&apos;ve grown up attending church or this is your very first time, you will find warm smiles, uplifting music, and an environment of peace.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {visitAssurances.map((item) => (
                <div className="rounded-xl border border-primary/10 bg-white p-4 shadow-xs" key={item.title}>
                  <span className="text-2xl" role="img" aria-hidden="true">{item.icon}</span>
                  <h3 className="font-display mt-2 font-bold text-sm text-text">{item.title}</h3>
                  <p className="mt-1 text-xs text-muted leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 3-Photo Visual Collage — hidden on mobile, shown on lg+ */}
          <div className="hidden lg:grid grid-cols-12 gap-3 sm:gap-4">
            <div className="col-span-7 relative aspect-[4/5] overflow-hidden rounded-2xl bg-stone-900 shadow-lg">
              <Image
                alt="Hospitality team welcoming church visitors"
                className="object-cover transition-transform duration-700 hover:scale-105"
                fill
                priority
                sizes="(max-width: 1024px) 60vw, 30vw"
                src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=900&q=80"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <span className="absolute bottom-4 left-4 text-xs font-bold text-white uppercase tracking-wider">
                Warm Welcome Team
              </span>
            </div>
            <div className="col-span-5 flex flex-col gap-3 sm:gap-4">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-stone-900 shadow-md">
                <Image
                  alt="Children learning in Sabbath school"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  fill
                  sizes="(max-width: 1024px) 40vw, 20vw"
                  src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=600&q=80"
                  unoptimized
                />
              </div>
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-stone-900 shadow-md">
                <Image
                  alt="Uplifting worship gathering"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  fill
                  sizes="(max-width: 1024px) 40vw, 20vw"
                  src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=600&q=80"
                  unoptimized
                />
              </div>
            </div>
          </div>

          {/* Mobile-only: single wide photo */}
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-stone-900 shadow-lg lg:hidden">
            <Image
              alt="Hospitality team welcoming church visitors"
              className="object-cover"
              fill
              sizes="100vw"
              src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=900&q=80"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <span className="absolute bottom-4 left-4 text-xs font-bold text-white uppercase tracking-wider">
              A Warm Welcome Awaits You
            </span>
          </div>
        </div>
      </section>

      {/* ── Schedule & Form Section ── */}
      <section className="page-container py-16 sm:py-24 grid gap-12 lg:grid-cols-2">
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-secondary" />
              <p className="eyebrow text-primary">WHEN & WHERE</p>
            </div>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
              Sabbath Gathering Schedule
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Choose the gathering that fits you best. We recommend arriving 15 minutes early so our team can greet you and help you find great seats.
            </p>
          </div>

          {/* Service Times Card */}
          <div className="surface-card rounded-2xl p-6 sm:p-8">
            <h3 className="eyebrow text-primary text-xs font-bold uppercase tracking-wider">
              PUBLISHED GATHERINGS
            </h3>
            {services.length ? (
              <div className="mt-4 divide-y divide-border/60">
                {services.slice(0, 6).map((service) => (
                  <div
                    className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1.5 py-3.5 text-sm"
                    key={service.id}
                  >
                    <div>
                      <span className="font-bold text-text block">{service.title}</span>
                      {service.location && (
                        <span className="text-xs text-muted flex items-center gap-1 mt-0.5">
                          <MapPin className="size-3 text-primary" /> {service.location}
                        </span>
                      )}
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                      {formatServiceDate(service)} · {formatServiceTime(service)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted">
                Weekly service times will appear here as they are published.
              </p>
            )}
          </div>

          {/* Location & Map Card */}
          <div className="surface-card rounded-2xl p-6 sm:p-8">
            <h3 className="eyebrow text-primary text-xs font-bold uppercase tracking-wider">
              CHURCH LOCATION & DIRECTIONS
            </h3>
            {address ? (
              <address className="mt-3 whitespace-pre-line text-sm not-italic leading-relaxed text-text font-medium">
                📍 {address}
              </address>
            ) : (
              <p className="mt-3 text-sm text-muted">
                Please contact our office to confirm the sanctuary location.
              </p>
            )}

            {(contact.phone || contact.email) && (
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm border-t border-border/60 pt-4">
                {contact.phone && (
                  <a className="font-semibold text-primary hover:underline" href={`tel:${contact.phone}`}>
                    📞 {contact.phone}
                  </a>
                )}
                {contact.email && (
                  <a className="font-semibold text-primary hover:underline" href={`mailto:${contact.email}`}>
                    ✉ {contact.email}
                  </a>
                )}
              </div>
            )}

            {contact.directionsUrl && (
              <div className="mt-4">
                <a
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:text-primary-hover"
                  href={contact.directionsUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Get Directions in Google Maps <span>↗</span>
                </a>
              </div>
            )}

            {contact.mapUrl && (
              <div className="mt-5 overflow-hidden rounded-xl border border-border shadow-sm">
                <iframe
                  title="Map showing the church location"
                  className="h-64 w-full border-0"
                  loading="lazy"
                  src={contact.mapUrl}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Form Card */}
        <div className="surface-card h-fit rounded-3xl p-7 sm:p-10 shadow-lg border border-primary/10">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-secondary" />
            <p className="eyebrow text-primary text-xs font-bold uppercase tracking-wider">
              LET US KNOW YOU ARE COMING
            </p>
          </div>
          <h2 className="mt-3 font-display text-2xl sm:text-3xl font-bold text-text">
            Register Your Visit
          </h2>
          <p className="mb-6 mt-2 text-sm leading-relaxed text-muted">
            Tell us when you plan to visit, and our pastoral and welcome team will have a warm greeting, reserved seating, and materials ready for your family.
          </p>
          <SubmissionForm type="visitor" compact />
        </div>
      </section>
    </main>
  );
}
