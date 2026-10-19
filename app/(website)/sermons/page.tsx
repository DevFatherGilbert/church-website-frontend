import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Headphones, Video, BookOpen } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { SermonLibrary } from "@/components/site/sermon-library";
import { getPublicData, type Sermon } from "@/lib/api/church-api";

export const metadata: Metadata = {
  title: "Sermons & Christian Teaching | Church Messages",
  description:
    "Listen to and watch biblical sermons, explore teaching by Scripture and topics, and download audio messages for your spiritual journey.",
  alternates: { canonical: "/sermons" },
  openGraph: {
    title: "Sermons & Bible Teaching",
    description:
      "Explore gospel-centered sermons, audio recordings, video messages, and Scripture study notes.",
  },
};

export const revalidate = 60;

const FEATURE_PHOTOS = [
  {
    src: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&q=80",
    alt: "Open Bible study",
    label: "Scripture-Centered",
    Icon: BookOpen,
  },
  {
    src: "https://images.unsplash.com/photo-1519817914152-22d216bb9170?w=800&q=80",
    alt: "Man preaching at pulpit",
    label: "Inspiring Preaching",
    Icon: Headphones,
  },
  {
    src: "https://images.unsplash.com/photo-1543718122-e9b4a91bc1e9?w=800&q=80",
    alt: "Worship congregation gathered",
    label: "Video & Audio",
    Icon: Video,
  },
];

export default async function SermonsPage() {
  const sermons = await getPublicData<Sermon[]>("/sermons");

  return (
    <main>
      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }]}
        description="Listen to biblical teaching, watch video messages, and explore the Word of God categorized by topic, Scripture passage, and speaker."
        emphasis="way ahead."
        eyebrow="SERMONS & TEACHINGS"
        title="Words for the"
      />

      {/* Visual Feature Strip */}
      <section className="bg-surface-strong border-y border-border">
        <div className="page-container py-10">
          <div className="grid gap-4 sm:grid-cols-3">
            {FEATURE_PHOTOS.map(({ src, alt, label, Icon }) => (
              <div
                key={label}
                className="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-primary-dark"
              >
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-80"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                  <div className="grid size-8 place-items-center rounded-lg bg-white/15 backdrop-blur-sm">
                    <Icon className="size-4" />
                  </div>
                  <span className="text-sm font-bold">{label}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-muted">
            {[
              "🎙️ Preached by trained pastors",
              "📖 Rooted in Scripture",
              "🎧 Audio available for download",
              "📺 Video recordings online",
              "🔍 Searchable by topic & speaker",
            ].map((item) => (
              <span key={item} className="flex items-center gap-1.5 font-medium">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Sermon Library */}
      <section className="page-container section-space">
        <SermonLibrary sermons={sermons ?? []} />
      </section>

      {/* Bottom CTA */}
      {(sermons?.length ?? 0) > 0 && (
        <section className="border-t border-border bg-surface">
          <div className="page-container py-14 text-center">
            <p className="eyebrow text-primary">LISTEN. LEARN. GROW.</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-text sm:text-4xl">
              Want more biblical resources?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted">
              Explore our full digital resource library — study guides, devotionals, and discipleship materials for your faith journey.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link className="button button-primary" href="/resources">
                Browse Resources →
              </Link>
              <Link className="button button-outline" href="/plan-your-visit">
                Join Us This Sabbath
              </Link>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
