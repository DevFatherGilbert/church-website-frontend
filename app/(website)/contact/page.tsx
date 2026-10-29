import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock3, LogIn, Mail, MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { SubmissionForm } from "@/components/forms/submission-form";
import { getPublicWebsiteSettings } from "@/lib/content/website-settings";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; type?: string }>;
}) {
  const { topic, type } = await searchParams;
  const { church, churchRecord, churchName } = await getPublicWebsiteSettings();
  const name = churchName || churchRecord?.title || "Seventh-day Adventist Fellowship";
  const initialMessage = topic ? `I'd like to learn more about ${topic.slice(0, 120)}.` : "";

  const address = [church.contact.address, church.contact.city, church.contact.country]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="bg-background">
      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }]}
        description="Whether you have questions about our services, want to learn about ministries, or need directions, we are here to help."
        emphasis="hear from you."
        eyebrow="VISIT · CONNECT · PRAY"
        title="We’d love to"
      />

      <section className="page-container py-16 sm:py-24 grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        {/* Left column — church info with photo */}
        <aside className="space-y-6">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-secondary">
              GET IN TOUCH
            </p>
            <h2 className="font-headline mt-2 text-3xl sm:text-4xl font-bold uppercase tracking-wide text-primary">
              Connect With Our Team
            </h2>
            <p className="mt-3 text-base text-muted">
              We look forward to meeting you! Our pastoral staff and church administration are available throughout the week.
            </p>
          </div>

          {/* Welcoming Church Photo */}
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-stone-900 shadow-md">
            <Image
              alt={`${name} sanctuary and entrance`}
              className="object-cover"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=900&q=80"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-5 right-5 text-white">
              <span className="block text-xs font-bold uppercase tracking-wider text-secondary">
                Our Church Sanctuary
              </span>
              <p className="font-display mt-0.5 text-sm font-semibold text-white/90">
                A sanctuary dedicated to worship, Bible study, and warm Christian community.
              </p>
            </div>
          </div>

          {/* Contact Details Cards */}
          <div className="surface-card space-y-3.5 rounded-2xl p-6 sm:p-7 border border-primary/10">
            <h3 className="eyebrow text-primary text-xs font-bold uppercase tracking-wider">
              OFFICIAL CONTACT CHANNELS
            </h3>

            {address && (
              <div className="flex items-start gap-3 rounded-xl bg-surface-strong/60 p-3.5 text-xs text-text">
                <MapPin className="size-4 shrink-0 text-primary mt-0.5" />
                <div>
                  <strong className="block text-stone-900">Physical Address</strong>
                  <span className="text-muted">{address}</span>
                </div>
              </div>
            )}

            {church.contact.phone && (
              <div className="flex items-start gap-3 rounded-xl bg-surface-strong/60 p-3.5 text-xs text-text">
                <Phone className="size-4 shrink-0 text-primary mt-0.5" />
                <div>
                  <strong className="block text-stone-900">Telephone Office</strong>
                  <a className="text-primary hover:underline font-semibold" href={`tel:${church.contact.phone}`}>
                    {church.contact.phone}
                  </a>
                </div>
              </div>
            )}

            {church.contact.email && (
              <div className="flex items-start gap-3 rounded-xl bg-surface-strong/60 p-3.5 text-xs text-text">
                <Mail className="size-4 shrink-0 text-primary mt-0.5" />
                <div>
                  <strong className="block text-stone-900">Email Address</strong>
                  <a className="text-primary hover:underline font-semibold" href={`mailto:${church.contact.email}`}>
                    {church.contact.email}
                  </a>
                </div>
              </div>
            )}

            {church.contact.directionsUrl && (
              <div className="pt-2">
                <a
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:text-primary-hover"
                  href={church.contact.directionsUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open in Google Maps <ArrowUpRight className="size-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Interactive Map */}
          {church.contact.mapUrl && (
            <div className="overflow-hidden rounded-2xl border border-border/80 shadow-sm">
              <iframe
                title="Map showing church location"
                className="h-60 w-full border-0"
                loading="lazy"
                src={church.contact.mapUrl}
              />
            </div>
          )}

          {/* Church Staff & Administrative Portal Access */}
          <div className="surface-card rounded-2xl p-5 border border-primary/10 bg-surface-strong/40">
            <h3 className="eyebrow text-primary text-xs font-bold uppercase tracking-wider">
              STAFF & MINISTRY LEADERS
            </h3>
            <p className="mt-1.5 text-xs text-muted leading-relaxed">
              Authorized pastoral staff and ministry leaders can access administrative tools, manage announcements, and update schedules here.
            </p>
            <Link
              className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl border border-primary/20 bg-surface px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-primary hover:border-primary hover:bg-primary/5 transition-colors"
              href="/admin/login"
            >
              <LogIn className="size-3.5" aria-hidden="true" />
              <span>Staff Portal Login →</span>
            </Link>
          </div>
        </aside>

        {/* Right column — Unified Submission Form */}
        <div className="surface-card h-fit rounded-3xl p-7 sm:p-10 shadow-lg border border-primary/10">
          <div className="flex items-center gap-2 mb-2">
            <span className="size-2 rounded-full bg-secondary" />
            <p className="eyebrow text-primary text-xs font-bold uppercase tracking-wider">
              SEND US A MESSAGE
            </p>
          </div>
          <h2 className="font-headline text-2xl sm:text-3xl font-bold uppercase tracking-wide text-primary">
            How Can We Assist You?
          </h2>
          <p className="mb-7 mt-2 text-sm leading-relaxed text-muted">
            Choose what best describes your message, fill in your details, and someone from our pastoral team will follow up promptly.
          </p>
          <SubmissionForm
            type={(type as "contact" | "visitor" | "prayer") || "contact"}
            initialMessage={initialMessage}
            showTypeSelector
          />
        </div>
      </section>
    </main>
  );
}
