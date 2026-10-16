import { SubmissionForm } from "../forms/submission-form";
import { PageHero } from "../site/page-hero";

export function PrayerRequestPage() {
  return (
    <main>
      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }]}
        eyebrow="PRAYER & CARE"
        title="You do not have to"
        emphasis="carry it alone."
        description="Share a confidential prayer request with our church pastoral and intercessory prayer team."
      />
      <section className="page-container section-space grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-secondary" />
            <p className="eyebrow text-primary">WE ARE HERE WITH YOU</p>
          </div>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
            A safe, prayerful space
          </h2>
          <p className="text-base leading-relaxed text-muted font-normal">
            Every prayer request shared here is treated with complete confidentiality, honor, and care. Our pastoral staff and prayer team pray over each need faithfully.
          </p>

          <div className="rounded-2xl border border-border/80 bg-surface-strong/40 p-6 space-y-4">
            <h3 className="font-display text-base font-bold text-text">
              What happens to your request?
            </h3>
            <ul className="space-y-2.5 text-sm text-muted">
              <li className="flex items-start gap-2">
                <span className="text-secondary font-bold">✓</span>
                <span>Prayed over by dedicated intercessors during weekly prayer gatherings.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary font-bold">✓</span>
                <span>Pastoral follow-up if you request a call or message.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary font-bold">✓</span>
                <span>Option to remain completely anonymous.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="surface-card rounded-2xl p-7 sm:p-10">
          <div className="flex items-center gap-2 mb-6">
            <span className="size-2 rounded-full bg-secondary" />
            <h3 className="font-display text-2xl font-bold text-text">Send your request</h3>
          </div>
          <SubmissionForm type="prayer" />
        </div>
      </section>
    </main>
  );
}
