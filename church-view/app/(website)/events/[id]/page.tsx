import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  CheckCircle2,
  Mail,
  ExternalLink,
} from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { getPublicData, type ChurchEvent } from "@/lib/api/church-api";

function displayTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return value;
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours < 12 ? "AM" : "PM"}`;
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getPublicData<ChurchEvent>(`/events/${encodeURIComponent(id)}`, { allowNotFound: true });
  if (!event) notFound();

  const name = event?.name ?? id.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

  return (
    <main>
      <PageHero
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Events", href: "/events" },
          { label: name, href: `/events/${id}` },
        ]}
        description={event?.description ?? "Details for this gathering will be shared when the event is confirmed."}
        eyebrow="EVENT DETAILS"
        title={name}
      />

      <section className="page-container section-space">
        <div className="mb-8">
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-primary transition"
            href="/events"
          >
            <ArrowLeft className="size-4" />
            Back to All Events
          </Link>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1fr_.40fr]">
          <div className="space-y-8">
            {event?.flyerUrl && (
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border shadow-md">
                <Image
                  alt={`Event: ${name}`}
                  className="object-cover"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 65vw"
                  src={event.flyerUrl}
                  unoptimized
                />
              </div>
            )}

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">About This Event</p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Come be part of it.
              </h2>
              <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-muted">
                {event?.description || "Published event information will be shared here when available."}
              </p>
            </div>

            {event?.registrationInfo && (
              <div className="rounded-2xl border border-amber-200/60 bg-amber-50/50 p-6 dark:border-amber-900/40 dark:bg-amber-950/20">
                <h3 className="flex items-center gap-2 font-display text-base font-bold text-amber-950 dark:text-amber-200">
                  <CheckCircle2 className="size-5 text-primary" />
                  Registration Information
                </h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted">
                  {event.registrationInfo}
                </p>
              </div>
            )}

            {event?.mapUrl && (
              <div>
                <a
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-primary shadow-xs transition hover:bg-surface-strong hover:text-primary-hover"
                  href={event.mapUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  <MapPin className="size-4" />
                  View Location on Map
                  <ExternalLink className="size-3.5 opacity-70" />
                </a>
              </div>
            )}
          </div>

          <aside className="h-fit space-y-6">
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs sm:p-8">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">Plan Ahead</p>
              <dl className="mt-6 divide-y divide-border text-sm">
                <div className="flex items-start gap-3 py-3.5">
                  <Calendar className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wider text-muted">Date</dt>
                    <dd className="mt-0.5 font-semibold text-foreground">{event?.date ?? "To be confirmed"}</dd>
                  </div>
                </div>

                <div className="flex items-start gap-3 py-3.5">
                  <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wider text-muted">Time</dt>
                    <dd className="mt-0.5 font-semibold text-foreground">
                      {event ? `${displayTime(event.time)}${event.endTime ? ` – ${displayTime(event.endTime)}` : ""}` : "To be confirmed"}
                    </dd>
                  </div>
                </div>

                {event?.location && (
                  <div className="flex items-start gap-3 py-3.5">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wider text-muted">Location</dt>
                      <dd className="mt-0.5 font-semibold text-foreground">{event.location}</dd>
                    </div>
                  </div>
                )}

                {event?.organizer && (
                  <div className="flex items-start gap-3 py-3.5">
                    <Users className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wider text-muted">Organizer</dt>
                      <dd className="mt-0.5 font-semibold text-foreground">{event.organizer}</dd>
                    </div>
                  </div>
                )}

                {event?.speaker && (
                  <div className="flex items-start gap-3 py-3.5">
                    <User className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wider text-muted">Speaker</dt>
                      <dd className="mt-0.5 font-semibold text-foreground">{event.speaker}</dd>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 py-3.5">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wider text-muted">Registration</dt>
                    <dd className="mt-0.5 font-semibold text-foreground">
                      {event?.registrationRequired ? "Registration required" : "Free / No registration required"}
                    </dd>
                  </div>
                </div>

                {event?.contactInfo && (
                  <div className="flex items-start gap-3 py-3.5">
                    <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wider text-muted">Contact</dt>
                      <dd className="mt-0.5 font-semibold text-foreground">{event.contactInfo}</dd>
                    </div>
                  </div>
                )}
              </dl>

              <div className="mt-6 border-t border-border pt-6">
                <Link
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-md transition hover:bg-primary-hover active:scale-[0.98]"
                  href={`/contact?topic=${encodeURIComponent(name)}`}
                >
                  Ask About This Event →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
