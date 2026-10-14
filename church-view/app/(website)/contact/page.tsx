import { PageHero } from "@/components/site/page-hero";
import { SubmissionForm } from "@/components/forms/submission-form";
import { getPublicWebsiteSettings } from "@/lib/content/website-settings";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const { topic } = await searchParams;
  const { church, churchRecord } = await getPublicWebsiteSettings();
  const initialMessage = topic
    ? `I’d like to learn more about ${topic.slice(0, 120)}.`
    : "";

  return (
    <main>
      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }]}
        eyebrow="VISIT · CONNECT · PRAY"
        title="We’d love to"
        emphasis="hear from you."
        description="Planning your first visit, asking about a ministry or carrying something you’d like prayer for? Reach out and our team will follow up."
      />
      <section className="page-container section-space grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="space-y-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-secondary" />
              <p className="eyebrow text-primary">GET IN TOUCH</p>
            </div>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-text sm:text-4xl">
              {churchRecord?.title || "The church"}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {[church.contact.address, church.contact.city, church.contact.country]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>

          <div className="surface-card space-y-4 rounded-2xl p-6 sm:p-7">
            <h3 className="eyebrow text-primary">CONTACT CHANNELS</h3>
            <div className="space-y-3 pt-1">
              {church.contact.phone && (
                <div className="rounded-xl border border-border/60 bg-surface-strong/40 p-4">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-muted">
                    Phone
                  </span>
                  <a
                    className="mt-1 block font-semibold text-text transition-colors hover:text-primary"
                    href={`tel:${church.contact.phone}`}
                  >
                    {church.contact.phone}
                  </a>
                </div>
              )}
              {church.contact.email && (
                <div className="rounded-xl border border-border/60 bg-surface-strong/40 p-4">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-muted">
                    Email
                  </span>
                  <a
                    className="mt-1 block font-semibold text-text transition-colors hover:text-primary"
                    href={`mailto:${church.contact.email}`}
                  >
                    {church.contact.email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {(church.contact.directionsUrl || church.contact.address) && (
            <div className="surface-card rounded-2xl p-6 sm:p-7">
              <h3 className="eyebrow text-primary">VISIT US</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {[church.contact.address, church.contact.city, church.contact.country]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              {church.contact.directionsUrl && (
                <a
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:text-primary-hover"
                  href={church.contact.directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Get directions <span>↗</span>
                </a>
              )}
            </div>
          )}

          {church.contact.mapUrl && (
            <div className="overflow-hidden rounded-2xl border border-border/80 shadow-sm">
              <iframe
                title="Map showing the church location"
                className="h-64 w-full border-0"
                loading="lazy"
                src={church.contact.mapUrl}
              />
            </div>
          )}
        </aside>

        <div className="space-y-8">
          <div className="surface-card rounded-2xl p-7 sm:p-10">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-secondary" />
              <p className="eyebrow text-primary">SEND US A MESSAGE</p>
            </div>
            <h2 className="mt-3 font-display text-2xl font-bold text-text">
              General Contact & Questions
            </h2>
            <p className="mb-6 mt-2 text-sm leading-relaxed text-muted">
              For general questions, visitor inquiries, or ministry connections.
            </p>
            <SubmissionForm initialMessage={initialMessage} type="contact" />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="surface-card rounded-2xl p-6 sm:p-8">
              <p className="eyebrow text-primary">PLAN A VISIT</p>
              <h3 className="mt-2 font-display text-xl font-bold text-text">
                We’ll save you a seat.
              </h3>
              <p className="mb-5 mt-2 text-xs leading-relaxed text-muted">
                Tell us you’re coming and we can help you know what to expect.
              </p>
              <SubmissionForm type="visitor" compact />
            </div>

            <div className="surface-card rounded-2xl p-6 sm:p-8">
              <p className="eyebrow text-secondary">PRAYER REQUEST</p>
              <h3 className="mt-2 font-display text-xl font-bold text-text">
                You don’t walk alone.
              </h3>
              <p className="mb-5 mt-2 text-xs leading-relaxed text-muted">
                Share a confidential request with the church prayer team.
              </p>
              <SubmissionForm type="prayer" compact />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
