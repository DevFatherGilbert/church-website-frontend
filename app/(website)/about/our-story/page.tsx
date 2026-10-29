import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, Heart, MapPin, Sparkles, Users } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { getPublicWebsiteSettings } from "@/lib/content/website-settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicWebsiteSettings().catch(() => null);
  const name = settings?.churchName || "Church";
  return {
    title: `Our Story & Heritage | ${name}`,
    description: `Discover how God planted ${name}, our journey through the years, and our continuous heart for people and the Gospel.`,
    alternates: { canonical: "/about/our-story" },
  };
}

export const revalidate = 300;

const milestones = [
  {
    year: "Our Beginnings",
    title: "Gathering Around the Word",
    description: "What began as a faithful group of believers meeting in homes for Sabbath prayer and Bible study grew steadily as hearts were touched by the Gospel message.",
    imageUrl: "https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Gathered believers in earnest study",
  },
  {
    year: "A Growing Family",
    title: "Establishing a Place of Worship",
    description: "Through prayer, sacrificial giving, and God's abundant guidance, our congregation established a permanent spiritual home dedicated to Sabbath worship and community life.",
    imageUrl: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Sanctuary filled with church community",
  },
  {
    year: "Ministry Multiplication",
    title: "Nurturing Families & Youth",
    description: "We launched structured children's Sabbath School, vibrant youth retreats, compassionate welfare ministries, and active evangelistic campaigns across Kigali and beyond.",
    imageUrl: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Fellowship and family ministry",
  },
  {
    year: "Today & Beyond",
    title: "Sharing the Blessed Hope",
    description: "Today, we remain steadfast in our biblical heritage — proclaiming Christ's love, observing the holy Sabbath rest, and preparing hearts with joyful hope for the Second Coming.",
    imageUrl: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Youth and members worshiping together",
  },
];

export default async function OurStoryPage() {
  const { church, churchName } = await getPublicWebsiteSettings();
  const name = churchName || "Seventh-day Adventist Fellowship";

  return (
    <main className="bg-background">
      <PageHero
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "About", href: "/about" },
        ]}
        description="Every community has a story. Discover how God has guided, sustained, and blessed our church family through the years."
        emphasis="grace."
        eyebrow="OUR STORY & HERITAGE"
        title="A journey rooted in"
      />

      {/* ── Story Narrative Section with Picture Feature ── */}
      <section className="page-container py-16 sm:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-secondary">
              GOD’S FAITHFULNESS
            </p>
            <h2 className="font-headline mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-wide text-primary leading-tight">
              From Humble Beginnings to a Thriving Fellowship
            </h2>
            <p className="mt-6 text-base sm:text-lg leading-relaxed text-muted">
              {church.profile.history ||
                `At ${name}, our journey has always been defined by a deep love for Scripture, genuine Christian fellowship, and a desire to serve our neighbors with the compassion of Christ.`}
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted">
              We believe the church is not merely a building, but a living body of believers called together to be salt and light in the world. As we look back on where God has brought us, our hearts overflow with gratitude and renewed dedication.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link className="button button-primary" href="/about/beliefs">
                What We Believe <ArrowRight className="size-4" />
              </Link>
              <Link className="button button-outline" href="/plan-your-visit">
                Visit Us This Sabbath
              </Link>
            </div>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-surface-strong shadow-xl">
            <Image
              alt={church.profile.imageAlt || `${name} community gathering`}
              className="object-cover"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              src={church.profile.imageUrl || "https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=1200&q=80"}
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <p className="text-xs font-bold uppercase tracking-widest text-secondary">
                COMMUNITY OF GRACE
              </p>
              <p className="font-display mt-1 text-xl font-bold">
                “Hitherto hath the Lord helped us.” — 1 Samuel 7:12
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Visual Journey Timeline with Photos (SRS Section 13) ── */}
      <section className="bg-surface-strong/70 py-16 sm:py-24 border-y border-border/80">
        <div className="page-container">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-secondary">
              OUR MILESTONES
            </p>
            <h2 className="font-headline mt-2 text-3xl sm:text-4xl font-bold uppercase tracking-wide text-primary">
              Milestones Along the Way
            </h2>
            <p className="mt-3 text-base text-muted">
              Key chapters in our church journey as God guided our growth and ministry impact.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-2">
            {milestones.map((item, index) => (
              <article
                className="group flex flex-col overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                key={item.title}
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-stone-900">
                  <Image
                    alt={item.imageAlt}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    src={item.imageUrl}
                    unoptimized
                  />
                  <div className="absolute top-4 left-4 rounded-full bg-secondary px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-stone-950 shadow-sm">
                    {item.year}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <h3 className="font-display text-2xl font-bold text-text group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {item.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Photo Gallery: Life in Our Fellowship ── */}
      <section className="page-container py-16 sm:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-secondary">
            COMMUNITY IN ACTION
          </p>
          <h2 className="font-headline mt-2 text-3xl sm:text-4xl font-bold uppercase tracking-wide text-primary">
            Moments We Treasure
          </h2>
          <p className="mt-3 text-base text-muted">
            From Sabbath worship to youth camps and community outreach, see what life together looks like.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface-strong shadow-md">
            <Image
              alt="Choir singing praises during worship"
              className="object-cover transition-transform duration-700 hover:scale-110"
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              src="https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=600&q=80"
              unoptimized
            />
          </div>
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface-strong shadow-md">
            <Image
              alt="Members in warm conversation"
              className="object-cover transition-transform duration-700 hover:scale-110"
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&q=80"
              unoptimized
            />
          </div>
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface-strong shadow-md">
            <Image
              alt="Youth participating in Bible study"
              className="object-cover transition-transform duration-700 hover:scale-110"
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              src="https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=600&q=80"
              unoptimized
            />
          </div>
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface-strong shadow-md">
            <Image
              alt="Children singing in Sabbath school"
              className="object-cover transition-transform duration-700 hover:scale-110"
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=600&q=80"
              unoptimized
            />
          </div>
        </div>

        {/* Invitation Callout */}
        <div className="mt-14 rounded-2xl border border-secondary/40 bg-white p-8 shadow-sm sm:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-xl">
            <h3 className="font-display text-2xl font-bold text-text">
              Be Part of the Next Chapter
            </h3>
            <p className="mt-2 text-sm text-muted">
              Whether you are looking for a spiritual family or visiting for the first time, we would love to welcome you this coming Sabbath.
            </p>
          </div>
          <Link className="button button-primary whitespace-nowrap min-h-12 px-7 font-bold uppercase tracking-wider text-xs" href="/plan-your-visit">
            Plan Your Visit <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
