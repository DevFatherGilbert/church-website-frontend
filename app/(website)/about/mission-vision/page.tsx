import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Compass, Heart, Shield, Sparkles, Target, Users } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { defaultChurchInformation, getPublicWebsiteSettings } from "@/lib/content/website-settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicWebsiteSettings().catch(() => null);
  const name = settings?.churchName || "Church";
  return {
    title: `Mission, Vision & Core Values | ${name}`,
    description: `Explore the Christ-centered mission, hopeful vision, and core spiritual values that guide the ministry of ${name}.`,
    alternates: { canonical: "/about/mission-vision" },
  };
}

export const revalidate = 300;

const defaultValues = [
  {
    title: "Faith in Christ",
    description: "Centering our lives on Jesus Christ as Lord and Savior, guided by the infallible authority of God's Holy Word.",
    icon: Sparkles,
  },
  {
    title: "Unconditional Love",
    description: "Welcoming every person with genuine grace, compassion, and respect, reflecting the boundless love of God.",
    icon: Heart,
  },
  {
    title: "Biblical Truth",
    description: "Anchoring our beliefs, preaching, and discipleship in the timeless truths of Scripture and the Sabbath rest.",
    icon: BookOpen,
  },
  {
    title: "Christ-like Service",
    description: "Actively serving our community, caring for the needy, and meeting practical physical and spiritual needs.",
    icon: Compass,
  },
  {
    title: "Loving Fellowship",
    description: "Fostering authentic relationships where families and individuals find belonging, mutual support, and prayer.",
    icon: Users,
  },
  {
    title: "Integrity & Excellence",
    description: "Honoring God in all that we do through transparent stewardship, ethical leadership, and joyful dedication.",
    icon: Shield,
  },
];

export default async function MissionVisionPage() {
  const { church, churchName } = await getPublicWebsiteSettings();
  const name = churchName || "Seventh-day Adventist Fellowship";

  const mission = church.mission.statement
    ? church.mission
    : defaultChurchInformation.mission;

  const vision = church.vision.statement
    ? church.vision
    : defaultChurchInformation.vision;

  const coreValues = church.coreValues.length > 0
    ? church.coreValues.filter((v) => v.visible)
    : defaultValues;

  return (
    <main className="bg-background">
      <PageHero
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "About", href: "/about" },
        ]}
        description="Our mission and vision define why we exist and where God is leading us as a church family."
        emphasis="calling."
        eyebrow="PURPOSE & DIRECTION"
        title="Our mission, vision &"
      />

      {/* ── Scripture Anchor Banner ── */}
      <section className="bg-primary-dark text-white py-10 px-5 border-b border-secondary/30">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-display text-xl sm:text-2xl font-medium italic text-amber-200">
            “Where there is no vision, the people perish; but he that keepeth the law, happy is he.”
          </p>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-secondary">
            — Proverbs 29:18
          </p>
        </div>
      </section>

      {/* ── Mission & Vision Cards with Rich Photography ── */}
      <section className="page-container py-16 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Mission Card */}
          <article className="group flex flex-col overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-md transition-all hover:shadow-xl">
            <div className="relative aspect-[16/10] overflow-hidden bg-stone-900">
              <Image
                alt="Worship gathering serving the community"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=900&q=80"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/90 via-primary-dark/30 to-transparent" />
              <div className="absolute bottom-5 left-6 right-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-stone-950">
                  <Target className="size-3.5" />
                  OUR MISSION
                </span>
                <h2 className="font-headline mt-2 text-2xl sm:text-3xl font-bold uppercase text-white tracking-wide">
                  What We Are Called to Do
                </h2>
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-between p-7 sm:p-9">
              <div>
                <p className="font-display text-xl sm:text-2xl font-bold text-primary leading-snug">
                  “{mission.statement}”
                </p>
                {mission.description && (
                  <p className="mt-4 text-base leading-relaxed text-muted">
                    {mission.description}
                  </p>
                )}
                <div className="mt-6 space-y-3 rounded-2xl bg-surface-strong/70 p-4 text-sm text-text">
                  <div className="flex items-center gap-2.5">
                    <span className="size-2 rounded-full bg-secondary" />
                    <strong>Proclaim the Everlasting Gospel</strong> to all people.
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="size-2 rounded-full bg-secondary" />
                    <strong>Nurture Disciples</strong> through Bible teaching and prayer.
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="size-2 rounded-full bg-secondary" />
                    <strong>Serve the Community</strong> with practical love and compassion.
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-border/60 pt-6">
                <Link className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary hover:text-primary-hover" href="/ministries">
                  Explore our active ministries <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </article>

          {/* Vision Card */}
          <article className="group flex flex-col overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-md transition-all hover:shadow-xl">
            <div className="relative aspect-[16/10] overflow-hidden bg-stone-900">
              <Image
                alt="Community worshiping with joyful hope"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=900&q=80"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/90 via-primary-dark/30 to-transparent" />
              <div className="absolute bottom-5 left-6 right-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-stone-950">
                  <Sparkles className="size-3.5" />
                  OUR VISION
                </span>
                <h2 className="font-headline mt-2 text-2xl sm:text-3xl font-bold uppercase text-white tracking-wide">
                  Where God is Leading Us
                </h2>
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-between p-7 sm:p-9">
              <div>
                <p className="font-display text-xl sm:text-2xl font-bold text-primary leading-snug">
                  “{vision.statement}”
                </p>
                {vision.description && (
                  <p className="mt-4 text-base leading-relaxed text-muted">
                    {vision.description}
                  </p>
                )}
                <div className="mt-6 space-y-3 rounded-2xl bg-surface-strong/70 p-4 text-sm text-text">
                  <div className="flex items-center gap-2.5">
                    <span className="size-2 rounded-full bg-secondary" />
                    <strong>Transformed Lives:</strong> Helping people experience lasting freedom and peace in Christ.
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="size-2 rounded-full bg-secondary" />
                    <strong>Strengthened Families:</strong> Equipping parents, children, and marriages.
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="size-2 rounded-full bg-secondary" />
                    <strong>Community Impact:</strong> Being a visible beacon of hope across our city.
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-border/60 pt-6">
                <Link className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary hover:text-primary-hover" href="/about/our-story">
                  Read about our journey <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* ── Core Values Section (SRS Section 16) ── */}
      <section className="bg-surface-strong/60 py-16 sm:py-24 border-y border-border/80">
        <div className="page-container">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-secondary">
              WHAT WE CHERISH
            </p>
            <h2 className="font-headline mt-2 text-3xl sm:text-4xl font-bold uppercase tracking-wide text-primary">
              Our Core Spiritual Values
            </h2>
            <p className="mt-3 text-base text-muted">
              These shared biblical values shape our culture, decisions, and daily walk with God.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coreValues.map((value, idx) => {
              const icons = [Sparkles, Heart, BookOpen, Compass, Users, Shield];
              const IconComp = icons[idx % icons.length];
              return (
                <div
                  className="group rounded-2xl border border-primary/10 bg-white p-7 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
                  key={value.title}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <IconComp className="size-5" />
                    </div>
                    <span className="text-xs font-bold text-muted uppercase">0{idx + 1}</span>
                  </div>
                  <h3 className="font-display mt-5 text-xl font-bold text-text group-hover:text-primary transition-colors">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Callout Banner ── */}
      <section className="page-container py-16 sm:py-20">
        <div className="rounded-3xl bg-gradient-to-r from-primary-dark via-[#1a3359] to-primary p-8 text-white sm:p-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-xl">
          <div className="max-w-xl">
            <h3 className="font-display text-2xl sm:text-3xl font-bold">
              Want to see our faith in action?
            </h3>
            <p className="mt-2 text-sm sm:text-base text-white/80">
              Join us for Sabbath worship or discover a ministry where your spiritual gifts can make a difference.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link className="button button-secondary text-xs uppercase tracking-wider font-bold px-6 py-3" href="/services">
              Service Times
            </Link>
            <Link className="button border-2 border-white/40 bg-white/10 text-white text-xs uppercase tracking-wider font-bold px-6 py-3 hover:bg-white/20" href="/ministries">
              Explore Ministries
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
