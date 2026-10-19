import Image from "next/image";
import { CheckCircle2, Heart, Lock, Shield, Sparkles } from "lucide-react";
import { SubmissionForm } from "../forms/submission-form";
import { PageHero } from "../site/page-hero";

const scripturePromises = [
  {
    verse: "Philippians 4:6-7",
    text: "“Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.”",
  },
  {
    verse: "Matthew 18:20",
    text: "“For where two or three gather in my name, there am I with them.”",
  },
  {
    verse: "James 5:16",
    text: "“The prayer of a righteous person is powerful and effective.”",
  },
];

export function PrayerRequestPage() {
  return (
    <main className="bg-background">
      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }]}
        description="Share your heart and prayer needs. Our pastoral team and dedicated intercessors pray faithfully over every request received."
        emphasis="alone."
        eyebrow="PASTORAL PRAYER & CARE"
        title="You do not have to walk"
      />

      <section className="page-container py-16 sm:py-24 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        {/* Left column — Visual assurances and scripture */}
        <div className="space-y-8">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-secondary">
              SAFE & CONFIDENTIAL
            </p>
            <h2 className="font-headline mt-2 text-3xl sm:text-4xl font-bold uppercase tracking-wide text-primary">
              We Are Standing in Prayer With You
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted font-normal">
              Whatever you are walking through — health challenges, family struggles, spiritual searching, or thanksgiving for answered prayers — we consider it a sacred privilege to bring your requests before the Throne of Grace.
            </p>
          </div>

          {/* Photo feature */}
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-stone-900 shadow-md">
            <Image
              alt="Hands joined together in prayer and fellowship"
              className="object-cover"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              src="https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=900&q=80"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/85 via-primary-dark/20 to-transparent" />
            <div className="absolute bottom-4 left-5 right-5 text-white">
              <span className="flex items-center gap-1.5 text-xs font-bold text-secondary uppercase tracking-wider">
                <Lock className="size-3.5" /> Strict Confidentiality Guaranteed
              </span>
              <p className="font-display mt-1 text-sm font-semibold text-white/90">
                Only authorized pastoral intercessors have access to your prayer requests.
              </p>
            </div>
          </div>

          {/* Scripture Promises */}
          <div className="space-y-3">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-primary">
              Biblical Promises for Comfort & Strength
            </h3>
            {scripturePromises.map((p) => (
              <blockquote className="rounded-xl border border-primary/10 bg-white p-4 text-xs leading-relaxed shadow-xs" key={p.verse}>
                <p className="italic text-stone-800 font-medium">{p.text}</p>
                <cite className="mt-1 block font-bold not-italic text-secondary uppercase tracking-wider">
                  — {p.verse}
                </cite>
              </blockquote>
            ))}
          </div>
        </div>

        {/* Right column — Submission Form */}
        <div className="surface-card h-fit rounded-3xl p-7 sm:p-10 shadow-lg border border-primary/10">
          <div className="flex items-center gap-2 mb-2">
            <span className="size-2 rounded-full bg-secondary" />
            <p className="eyebrow text-primary text-xs font-bold uppercase tracking-wider">
              SEND YOUR PRAYER REQUEST
            </p>
          </div>
          <h3 className="font-display text-2xl font-bold text-text">
            How Can We Pray for You?
          </h3>
          <p className="mt-2 mb-7 text-sm leading-relaxed text-muted">
            Share as much or as little detail as you wish. If you would like a pastor to follow up with you, include your phone or email.
          </p>
          <SubmissionForm type="prayer" />
        </div>
      </section>
    </main>
  );
}
