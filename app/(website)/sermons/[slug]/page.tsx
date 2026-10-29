import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Check,
  Clock,
  Download,
  Film,
  Headphones,
  Mic,
  Share2,
  Sparkles,
  Tag,
  User,
  Video,
} from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { getPublicData, type Sermon } from "@/lib/api/church-api";
import { formatSermonDate, parseVideoUrl } from "@/lib/media/video-utils";

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sermon = await getPublicData<Sermon>(`/sermons/${encodeURIComponent(slug)}`, { allowNotFound: true });

  if (!sermon || sermon.status !== "published") {
    return {
      title: "Sermon Not Found | Church",
      description: "The requested sermon is unavailable or has not been published.",
    };
  }

  const title = `${sermon.title} | ${sermon.speaker}`;
  const description =
    sermon.description?.slice(0, 160) ||
    `Listen to “${sermon.title}” preached by ${sermon.speaker} on ${formatSermonDate(sermon.date)}.`;

  return {
    title,
    description,
    alternates: { canonical: `/sermons/${sermon.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      images: sermon.thumbnailUrl ? [{ url: sermon.thumbnailUrl }] : undefined,
    },
  };
}

export default async function SermonDetailPage({ params }: Props) {
  const { slug } = await params;
  const sermon = await getPublicData<Sermon>(`/sermons/${encodeURIComponent(slug)}`, { allowNotFound: true });

  // Restrict drafts and non-existent sermons from visitors
  if (!sermon || sermon.status !== "published") {
    notFound();
  }

  const videoInfo = parseVideoUrl(sermon.videoUrl);
  const speaker = sermon.speakerRef;

  const sermonJsonLd = {
    "@context": "https://schema.org",
    "@type": sermon.videoUrl ? "VideoObject" : "CreativeWork",
    name: sermon.title,
    description: sermon.description || `Sermon preached by ${sermon.speaker} on ${formatSermonDate(sermon.date)}.`,
    thumbnailUrl: sermon.thumbnailUrl ? [sermon.thumbnailUrl] : undefined,
    uploadDate: sermon.date,
    datePublished: sermon.date,
    author: {
      "@type": "Person",
      name: sermon.speaker,
    },
    ...(sermon.videoUrl
      ? {
          contentUrl: sermon.videoUrl,
          embedUrl: videoInfo.embedUrl ?? undefined,
        }
      : {}),
    ...(sermon.audioUrl
      ? {
          audio: {
            "@type": "AudioObject",
            contentUrl: sermon.audioUrl,
          },
        }
      : {}),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sermonJsonLd) }}
      />
      {/* Page Hero Header */}
      <PageHero
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Sermons", href: "/sermons" },
          { label: sermon.title, href: `/sermons/${sermon.slug}` },
        ]}
        description={
          sermon.description
            ? sermon.description.slice(0, 180) + (sermon.description.length > 180 ? "…" : "")
            : `A message preached by ${sermon.speaker} on ${formatSermonDate(sermon.date)}.`
        }
        eyebrow={`${sermon.category.toUpperCase()} · MESSAGE`}
        title={sermon.title}
      />

      {/* Main Section */}
      <section className="page-container section-space">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-primary transition"
            href="/sermons"
          >
            <ArrowLeft className="size-4" />
            Back to All Sermons
          </Link>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1fr_.40fr]">
          {/* Main Content Column */}
          <div className="space-y-10">
            {/* Video Player */}
            {sermon.videoUrl && videoInfo.isValid && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
                  <Film className="size-4 text-purple-600" />
                  <span>Video Recording</span>
                </div>
                <div className="overflow-hidden rounded-2xl border border-border bg-black aspect-video shadow-lg">
                  {videoInfo.provider === "direct" ? (
                    <video
                      className="size-full"
                      controls
                      poster={sermon.thumbnailUrl ?? undefined}
                      preload="metadata"
                      src={sermon.videoUrl}
                    >
                      Video playback not supported
                    </video>
                  ) : (
                    <iframe
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="size-full border-0"
                      src={videoInfo.embedUrl ?? ""}
                      title={sermon.title}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Audio Player Card */}
            {sermon.audioUrl && (
              <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Headphones className="size-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-primary">
                        Audio Message
                      </p>
                      <h3 className="text-base font-bold text-foreground">
                        Listen to the Sermon
                      </h3>
                    </div>
                  </div>

                  {/* Download button if approved */}
                  {sermon.allowDownload && (
                    <a
                      className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-surface shadow-xs transition"
                      download
                      href={sermon.audioUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <Download className="size-4 text-primary" />
                      Download Audio (MP3)
                    </a>
                  )}
                </div>

                <div className="pt-2">
                  <audio
                    className="w-full h-12"
                    controls
                    preload="metadata"
                    src={sermon.audioUrl}
                  >
                    Audio playback is not supported by your browser.
                  </audio>
                </div>
              </div>
            )}

            {/* Thumbnail Display if no video */}
            {!sermon.videoUrl && sermon.thumbnailUrl && (
              <div className="relative aspect-video max-h-96 w-full max-w-2xl overflow-hidden rounded-2xl border border-border shadow-md">
                <Image
                  alt={sermon.title}
                  className="object-cover"
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  src={sermon.thumbnailUrl}
                  unoptimized
                />
              </div>
            )}

            {/* Scripture Callout Card */}
            {sermon.scripture && (
              <div className="rounded-2xl border border-amber-200/60 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/50 p-6 sm:p-8">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-800 dark:text-amber-400 flex items-center gap-2">
                  <BookOpen className="size-4" />
                  Scripture Reading
                </p>
                <h3 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground">
                  {sermon.scripture}
                </h3>
                {sermon.bibleBook && (
                  <p className="mt-1 text-xs text-muted">
                    Book of {sermon.bibleBook}
                  </p>
                )}
              </div>
            )}

            {/* Message Notes & Full Description */}
            <div className="space-y-4">
              <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                <Sparkles className="size-5 text-primary" />
                Teaching Overview & Notes
              </h3>
              {sermon.description ? (
                <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed text-muted whitespace-pre-line">
                  {sermon.description}
                </div>
              ) : (
                <p className="text-sm text-muted">
                  No written study notes were included with this message. Listen to the audio or watch the video above.
                </p>
              )}
            </div>

            {/* Related Sermons */}
            {sermon.relatedSermons && sermon.relatedSermons.length > 0 && (
              <div className="border-t border-border pt-10 space-y-6">
                <h3 className="font-display text-xl font-bold text-foreground">Related Messages</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {sermon.relatedSermons.map((rel) => (
                    <article
                      className="group rounded-2xl border border-border bg-surface p-5 transition hover:shadow-md hover:border-primary/30"
                      key={rel.id}
                    >
                      <span className="text-[11px] font-semibold text-primary uppercase">
                        {rel.category}
                      </span>
                      <h4 className="mt-2 font-display text-sm font-bold text-foreground group-hover:text-primary transition line-clamp-2">
                        <Link href={`/sermons/${encodeURIComponent(rel.slug || rel.id)}`}>
                          {rel.title}
                        </Link>
                      </h4>
                      <p className="mt-1 text-xs text-muted">{rel.speaker}</p>
                      <p className="mt-1 text-[11px] text-muted">{formatSermonDate(rel.date)}</p>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <aside className="space-y-6">
            {/* Speaker Information Card */}
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">
                Preached By
              </p>
              <div className="flex items-center gap-4">
                {speaker?.photoUrl ? (
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-full border border-border">
                    <Image
                      alt={sermon.speaker}
                      className="object-cover"
                      fill
                      sizes="64px"
                      src={speaker.photoUrl}
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="grid size-16 shrink-0 place-items-center rounded-full bg-primary/10 text-primary border border-primary/20">
                    <User className="size-7" />
                  </div>
                )}
                <div>
                  <h4 className="font-display text-base font-bold text-foreground">{sermon.speaker}</h4>
                  <p className="text-xs text-primary font-medium mt-0.5">
                    {speaker?.title || "Preacher / Speaker"}
                  </p>
                </div>
              </div>

              {speaker?.bio && (
                <p className="text-xs leading-relaxed text-muted border-t border-border pt-3">
                  {speaker.bio}
                </p>
              )}

              <div className="pt-2">
                <Link
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover"
                  href={`/sermons`}
                >
                  <span>Explore all sermon teachings</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Message Details Card */}
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-muted mb-4">
                Message Details
              </p>
              <dl className="divide-y divide-border text-xs">
                <div className="py-3 flex justify-between gap-4">
                  <dt className="text-muted font-medium">Date</dt>
                  <dd className="font-semibold text-foreground text-right">
                    {formatSermonDate(sermon.date)}
                  </dd>
                </div>

                <div className="py-3 flex justify-between gap-4">
                  <dt className="text-muted font-medium">Topic / Category</dt>
                  <dd className="font-semibold text-primary text-right">
                    {sermon.category}
                  </dd>
                </div>

                {sermon.scripture && (
                  <div className="py-3 flex justify-between gap-4">
                    <dt className="text-muted font-medium">Scripture</dt>
                    <dd className="font-semibold text-foreground text-right">
                      {sermon.scripture}
                    </dd>
                  </div>
                )}

                {sermon.bibleBook && (
                  <div className="py-3 flex justify-between gap-4">
                    <dt className="text-muted font-medium">Bible Book</dt>
                    <dd className="font-semibold text-foreground text-right">
                      {sermon.bibleBook}
                    </dd>
                  </div>
                )}

                {sermon.series && (
                  <div className="py-3 flex justify-between gap-4">
                    <dt className="text-muted font-medium">Sermon Series</dt>
                    <dd className="font-semibold text-foreground text-right">
                      {sermon.series}
                    </dd>
                  </div>
                )}

                {sermon.service && (
                  <div className="py-3 flex justify-between gap-4">
                    <dt className="text-muted font-medium">Church Service</dt>
                    <dd className="font-semibold text-foreground text-right">
                      {sermon.service}
                    </dd>
                  </div>
                )}

                {sermon.ministry && (
                  <div className="py-3 flex justify-between gap-4">
                    <dt className="text-muted font-medium">Ministry Group</dt>
                    <dd className="font-semibold text-foreground text-right">
                      {sermon.ministry}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
