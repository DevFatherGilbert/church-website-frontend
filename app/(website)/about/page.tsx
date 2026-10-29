import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, Heart, Shield, Sparkles, Users } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { getPublicWebsiteSettings } from "@/lib/content/website-settings";

export async function generateMetadata(): Promise<Metadata> {
  const { churchName, churchDescription } = await getPublicWebsiteSettings().catch(() => ({
    churchName: "Church",
    churchDescription: "",
  }));
  const name = churchName || "Church";
  const title = `About ${name} | Faith, Heritage & Community`;
  const description =
    churchDescription ||
    "Discover our church history, biblical beliefs, leadership team, and our mission to share Christ's hope.";
  return {
    title,
    description,
    alternates: { canonical: "/about" },
    openGraph: {
      title,
      description,
    },
  };
}

export const revalidate = 300;

const aboutHubCards = [
  {
    title: "Our Story & Heritage",
    eyebrow: "OUR HISTORY",
    description: "Discover how God planted our faith community, our journey through the years, and our continuous heart for people.",
    href: "/about/our-story",
    imageUrl: "https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Church sanctuary with light shining through windows",
    icon: BookOpen,
  },
  {
    title: "Mission & Vision",
    eyebrow: "PURPOSE & DIRECTION",
    description: "Explore the Christ-centered mission, hopeful vision, and core spiritual values that guide everything we do.",
    href: "/about/mission-vision",
    imageUrl: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=900&q=80",
    imageAlt: "People joining hands in prayer and fellowship",
    icon: Sparkles,
  },
  {
    title: "Statement of Faith",
    eyebrow: "BIBLICAL TRUTH",
    description: "Read our doctrinal foundation rooted in the Holy Scriptures, grace in Christ, Sabbath worship, and the Blessed Hope.",
    href: "/about/beliefs",
    imageUrl: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Open Holy Bible on wooden table",
    icon: Shield,
  },
  {
    title: "Pastoral Leadership",
    eyebrow: "SERVANT LEADERS",
    description: "Meet our dedicated pastors, elders, and ministry coordinators committed to shepherding and serving our church family.",
    href: "/about/leadership",
    imageUrl: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Pastoral and community leaders greeting members",
    icon: Users,
  },
];

export default async function AboutPage() {
  const { church, churchRecord, churchName } = await getPublicWebsiteSettings();
  const name = churchName || "Seventh-day Adventist Fellowship";

  return (
    <main className="bg-background">
      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }]}
        eyebrow="WHO WE ARE"
        title="Rooted in Christ,"
        emphasis="united in love."
        description="Get to know our church family, our biblical heritage, and our passion to bring hope and healing to our community."
      />

      {/* ── Visual Intro Section with Kigali Harvest headline style ── */}
      <section className="page-container py-16 sm:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-secondary">
              ABOUT OUR CONGREGATION
            </p>
            <h2 className="font-headline mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-wide text-primary leading-tight">
              A Warm Family of Believers
            </h2>
            <p className="mt-6 text-base sm:text-lg leading-relaxed text-muted">
              {churchRecord?.description ||
                `${name} is a vibrant Christian community where individuals and families come together to encounter God, experience genuine warmth, and grow in grace.`}
            </p>
            {church.profile.history && (
              <p className="mt-4 border-l-4 border-secondary/80 pl-4 text-sm leading-relaxed text-muted font-medium">
                {church.profile.history}
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-4">
              <Link className="button button-primary" href="/about/our-story">
                Read our story <ArrowRight className="size-4" />
              </Link>
              <Link className="button button-outline" href="/plan-your-visit">
                Plan a visit
              </Link>
            </div>
          </div>

          {/* 3-Photo Visual Collage */}
          <div className="grid grid-cols-12 gap-3 sm:gap-4">
            <div className="col-span-7 relative aspect-[4/5] overflow-hidden rounded-2xl bg-surface-strong shadow-md">
              <Image
                alt="Worship community gathered in prayer"
                className="object-cover transition-transform duration-700 hover:scale-105"
                fill
                sizes="(max-width: 1024px) 60vw, 30vw"
                src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=900&q=80"
                unoptimized
              />
            </div>
            <div className="col-span-5 flex flex-col gap-3 sm:gap-4">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface-strong shadow-md">
                <Image
                  alt="Young people in joyful fellowship"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  fill
                  sizes="(max-width: 1024px) 40vw, 20vw"
                  src="https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=600&q=80"
                  unoptimized
                />
              </div>
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface-strong shadow-md">
                <Image
                  alt="Children learning Bible stories"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  fill
                  sizes="(max-width: 1024px) 40vw, 20vw"
                  src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=600&q=80"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Key Exploration Cards with Rich Photos (SRS Sections 13-18) ── */}
      <section className="bg-surface-strong/60 py-16 sm:py-24 border-y border-border/80">
        <div className="page-container">
          <div className="max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-secondary">
              DISCOVER MORE
            </p>
            <h2 className="font-headline mt-2 text-3xl sm:text-4xl font-bold uppercase tracking-wide text-primary">
              Explore Our Faith & Community
            </h2>
            <p className="mt-3 text-base text-muted">
              Choose a section below to learn more about our heritage, what we believe, and the people serving our church.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {aboutHubCards.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-xl"
                  href={item.href}
                  key={item.href}
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone-900">
                    <Image
                      alt={item.imageAlt}
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      src={item.imageUrl}
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/85 via-primary-dark/20 to-transparent" />
                    <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between">
                      <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-950">
                        {item.eyebrow}
                      </span>
                      <div className="flex size-9 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-md transition-colors group-hover:bg-secondary group-hover:text-stone-950">
                        <Icon className="size-4" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-6 sm:p-7">
                    <div>
                      <h3 className="font-display text-2xl font-bold text-text group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="mt-2.5 text-sm leading-relaxed text-muted font-normal">
                        {item.description}
                      </p>
                    </div>
                    <div className="mt-6 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary group-hover:translate-x-1 transition-transform">
                      <span>Explore this section</span>
                      <ArrowUpRight className="size-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Fast Facts & Community Engagement Banner ── */}
      <section className="page-container py-16 sm:py-20">
        <div className="relative overflow-hidden rounded-3xl bg-primary-dark p-8 text-white sm:p-12 lg:p-14">
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
                JOIN OUR CHURCH FAMILY
              </p>
              <h3 className="font-display mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold">
                Experience Sabbath Worship & Warm Fellowship
              </h3>
              <p className="mt-3 text-sm sm:text-base leading-relaxed text-white/80">
                We gather every Sabbath morning for Bible study and uplifting worship. No matter where you are on your spiritual journey, you are always welcome here.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 lg:justify-end">
              <Link className="button button-secondary font-bold uppercase tracking-wider text-xs px-6 py-3" href="/plan-your-visit">
                Plan Your Visit <ArrowRight className="size-4" />
              </Link>
              <Link className="button border-2 border-white/40 bg-white/10 text-white font-bold uppercase tracking-wider text-xs px-6 py-3 hover:bg-white/20" href="/contact">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
