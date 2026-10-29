import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Heart, Shield, Sparkles, Sun, Users } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { getPublicWebsiteSettings } from "@/lib/content/website-settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicWebsiteSettings().catch(() => null);
  const name = settings?.churchName || "Church";
  return {
    title: `Statement of Faith & Beliefs | ${name}`,
    description: `Discover the core biblical doctrines of ${name} regarding the Holy Scriptures, Jesus Christ, salvation by grace, and Sabbath rest.`,
    alternates: { canonical: "/about/beliefs" },
  };
}

export const revalidate = 300;

const defaultBeliefs = [
  {
    order: 1,
    title: "The Holy Scriptures",
    scripture: "2 Timothy 3:16-17 · 2 Peter 1:20-21",
    description: "The Holy Scriptures, Old and New Testaments, are the written Word of God, given by divine inspiration. They are the infallible revelation of God’s will and the standard of character, test of experience, and authoritative revealer of doctrines.",
    icon: BookOpen,
  },
  {
    order: 2,
    title: "The Trinity (Godhead)",
    scripture: "Genesis 1:26 · Matthew 28:19 · 2 Corinthians 13:14",
    description: "There is one God: Father, Son, and Holy Spirit, a unity of three coeternal Persons. God is immortal, all-powerful, all-knowing, above all, and ever present. He is infinite and beyond human comprehension, yet known through His self-revelation.",
    icon: Shield,
  },
  {
    order: 3,
    title: "Jesus Christ & Redemption",
    scripture: "John 1:1-3, 14 · Hebrews 2:14-18 · Romans 5:8",
    description: "God the eternal Son became incarnate in Jesus Christ. Through Him all things were created, the character of God is revealed, the salvation of humanity is accomplished, and the world is judged. Through His life, death, and resurrection, Christ made atonement for our sins.",
    icon: Heart,
  },
  {
    order: 4,
    title: "Salvation by Grace through Faith",
    scripture: "Ephesians 2:8-10 · Romans 3:21-26 · John 3:16",
    description: "In infinite love and mercy, God made Christ, who knew no sin, to be sin for us, so that in Him we might be made the righteousness of God. Salvation is all of grace through faith in Jesus Christ, and never of human merit or good works.",
    icon: Sparkles,
  },
  {
    order: 5,
    title: "The Seventh-Day Sabbath",
    scripture: "Genesis 2:1-3 · Exodus 20:8-11 · Luke 4:16 · Mark 2:27-28",
    description: "The beneficent Creator, after the six days of Creation, rested on the seventh day and instituted the Sabbath for all people as a memorial of Creation. The fourth commandment of God's unchangeable law requires the observance of this seventh day as the day of rest, worship, and ministry.",
    icon: Clock,
  },
  {
    order: 6,
    title: "The Second Coming of Christ",
    scripture: "Titus 2:13 · Hebrews 9:28 · Revelation 1:7 · 1 Thessalonians 4:16-17",
    description: "The second coming of Christ is the blessed hope of the church, the grand climax of the Gospel. The Saviour’s coming will be literal, personal, visible, and worldwide. When He returns, the righteous dead will be resurrected, and together with the righteous living will be glorified.",
    icon: Sun,
  },
  {
    order: 7,
    title: "Christian Living & Loving Stewardship",
    scripture: "Romans 12:1-2 · 1 Corinthians 10:31 · Galatians 5:22-23",
    description: "We are called to be a godly people who think, feel, and act in harmony with biblical principles. For the Spirit to recreate in us the character of our Lord, we involve ourselves only in those things that produce Christlike purity, health, and joy in our lives.",
    icon: Users,
  },
];

export default async function BeliefsPage() {
  const { church, churchName } = await getPublicWebsiteSettings();
  const name = churchName || "Seventh-day Adventist Fellowship";

  const beliefsList = church.beliefs.length > 0
    ? church.beliefs.filter((b) => b.visible).sort((a, b) => a.order - b.order)
    : defaultBeliefs;

  return (
    <main className="bg-background">
      <PageHero
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "About", href: "/about" },
        ]}
        description="Explore the foundational biblical truths that shape our faith, worship, and daily Christian walk."
        emphasis="Word."
        eyebrow="STATEMENT OF FAITH"
        title="Anchored in God’s"
      />

      {/* ── Intro Scripture Section ── */}
      <section className="page-container py-16 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-secondary">
              OUR SPIRITUAL FOUNDATION
            </p>
            <h2 className="font-headline mt-3 text-3xl sm:text-4xl font-bold uppercase tracking-wide text-primary leading-tight">
              Truth Grounded in Holy Scripture
            </h2>
            <p className="mt-5 text-base sm:text-lg leading-relaxed text-muted">
              At {name}, we accept the Bible as our only creed and hold fundamental beliefs that are rooted entirely in the teachings of Scripture.
            </p>
            <p className="mt-3 text-base leading-relaxed text-muted">
              These shared beliefs describe the church&apos;s understanding and expression of the Bible&apos;s teaching regarding God&apos;s love, salvation through Jesus Christ, the joy of the Sabbath rest, and our blessed hope in His soon return.
            </p>
          </div>

          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-surface-strong shadow-lg">
            <Image
              alt="Open Bible on altar during worship"
              className="object-cover"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              src="https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=900&q=80"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/85 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-6 right-6 text-white">
              <p className="text-xs font-bold uppercase tracking-widest text-secondary">
                THE LIVING WORD
              </p>
              <p className="font-display mt-1 text-lg font-bold">
                “Thy word is a lamp unto my feet, and a light unto my path.” — Psalm 119:105
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Beliefs Cards Grid (SRS Section 17) ── */}
      <section className="bg-surface-strong/70 py-16 sm:py-24 border-y border-border/80">
        <div className="page-container">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-secondary">
              FUNDAMENTAL PILLARS
            </p>
            <h2 className="font-headline mt-2 text-3xl sm:text-4xl font-bold uppercase tracking-wide text-primary">
              Core Biblical Teachings
            </h2>
            <p className="mt-3 text-base text-muted">
              The foundational pillars that guide our faith and practice.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {beliefsList.map((belief, idx) => {
              const icons = [BookOpen, Shield, Heart, Sparkles, Clock, Sun, Users];
              const IconComp = icons[idx % icons.length];
              const scripture = "scripture" in belief ? (belief as { scripture?: string }).scripture : undefined;

              return (
                <article
                  className="group flex flex-col justify-between rounded-2xl border border-primary/10 bg-white p-7 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg sm:p-8"
                  key={belief.title}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <IconComp className="size-5" />
                      </div>
                      <span className="rounded-full bg-secondary/30 px-3 py-1 text-[11px] font-bold text-amber-950 uppercase tracking-wider">
                        Pillar 0{idx + 1}
                      </span>
                    </div>

                    <h3 className="font-display mt-5 text-2xl font-bold text-text group-hover:text-primary transition-colors">
                      {belief.title}
                    </h3>

                    {scripture && (
                      <p className="mt-1 text-xs font-semibold text-primary">
                        📖 {scripture}
                      </p>
                    )}

                    <p className="mt-3 text-sm leading-relaxed text-muted">
                      {belief.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Questions & Pastoral Guidance Banner ── */}
      <section className="page-container py-16 sm:py-20">
        <div className="rounded-3xl bg-primary-dark p-8 text-white sm:p-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-xl">
          <div className="max-w-xl">
            <h3 className="font-display text-2xl sm:text-3xl font-bold">
              Have Questions About What We Believe?
            </h3>
            <p className="mt-2 text-sm sm:text-base text-white/80">
              Our pastors and Bible study leaders are always glad to study Scripture together, pray with you, and answer any doctrinal questions.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link className="button button-secondary text-xs uppercase tracking-wider font-bold px-6 py-3" href="/contact">
              Ask a Pastor <ArrowRight className="size-4" />
            </Link>
            <Link className="button border-2 border-white/40 bg-white/10 text-white text-xs uppercase tracking-wider font-bold px-6 py-3 hover:bg-white/20" href="/resources">
              Bible Study Guides
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
