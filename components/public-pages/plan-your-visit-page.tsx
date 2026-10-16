import Link from "next/link";
import { SubmissionForm } from "../forms/submission-form";
import { PageHero } from "../site/page-hero";
import { formatServiceDate, formatServiceTime, type ChurchService } from "@/lib/content/services";
import type { ChurchInformation } from "@/lib/content/website-settings";

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
    <main>
      <PageHero
        eyebrow="YOUR FIRST VISIT"
        title="Come as you are."
        emphasis="We will save you a seat."
        description="Check the current published service times and location, and let the church team know you are coming so we can give you a warm welcome."
        breadcrumbs={[{ label: "Home", href: "/" }]}
      />
      <section className="page-container section-space grid gap-12 lg:grid-cols-2">
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-secondary" />
              <p className="eyebrow text-primary">WHAT TO EXPECT</p>
            </div>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
              A warm welcome, from the start.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Whether you’ve grown up in church or this is your first time walking through the doors, you will find friendly faces, uplifting worship, and relevant biblical teaching.
            </p>
          </div>

          <div className="surface-card rounded-2xl p-6 sm:p-7">
            <h3 className="eyebrow text-primary">SERVICE SCHEDULE</h3>
            {services.length ? (
              <div className="mt-4 divide-y divide-border/60">
                {services.slice(0, 6).map((service) => (
                  <div
                    className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1.5 py-3 text-sm"
                    key={service.id}
                  >
                    <span className="font-bold text-text">{service.title}</span>
                    <span className="text-muted">
                      {formatServiceDate(service)} · {formatServiceTime(service)}
                      {service.location ? ` · ${service.location}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted">
                Approved service times will appear here as they are published.
              </p>
            )}
          </div>

          <div className="surface-card rounded-2xl p-6 sm:p-7">
            <h3 className="eyebrow text-primary">LOCATION & DIRECTIONS</h3>
            {address ? (
              <address className="mt-3 whitespace-pre-line text-sm not-italic leading-relaxed text-text">
                {address}
              </address>
            ) : (
              <p className="mt-3 text-sm text-muted">
                The church address has not been published yet. Please contact the team to confirm the location before visiting.
              </p>
            )}
            {(contact.phone || contact.email) && (
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                {contact.phone && (
                  <a
                    className="font-semibold text-primary transition-colors hover:text-primary-hover"
                    href={`tel:${contact.phone}`}
                  >
                    {contact.phone}
                  </a>
                )}
                {contact.email && (
                  <a
                    className="font-semibold text-primary transition-colors hover:text-primary-hover"
                    href={`mailto:${contact.email}`}
                  >
                    {contact.email}
                  </a>
                )}
              </div>
            )}
            {contact.directionsUrl && (
              <a
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:text-primary-hover"
                href={contact.directionsUrl}
                rel="noreferrer"
                target="_blank"
              >
                Get directions <span>↗</span>
              </a>
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

        <div className="surface-card h-fit rounded-2xl p-7 sm:p-10">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-secondary" />
            <p className="eyebrow text-primary">LET US KNOW YOU ARE COMING</p>
          </div>
          <h2 className="mt-3 font-display text-2xl font-bold text-text">
            Plan your visit
          </h2>
          <p className="mb-6 mt-2 text-sm leading-relaxed text-muted">
            Share a little information and our hospitality team will save you a seat and answer any questions.
          </p>
          <SubmissionForm type="visitor" compact />
        </div>
      </section>
    </main>
  );
}
