import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Sparkles } from "lucide-react";
import { getPublicData, type PublicContent } from "@/lib/api/church-api";
import { announcementCategoryLabel } from "@/lib/content/announcements";
import { PageHero } from "../site/page-hero";

export async function AnnouncementDetailPage({ slug }: { slug: string }) {
  const item = await getPublicData<PublicContent>(`/content/announcements/${encodeURIComponent(slug)}`, { allowNotFound: true });
  if (!item) notFound();
  const title = item.title;

  return (
    <main>
      <PageHero
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Announcements", href: "/announcements" },
          { label: title, href: `/announcements/${slug}` },
        ]}
        description={item.description ?? ""}
        eyebrow="CHURCH ANNOUNCEMENT"
        title={title}
      />

      <article className="reading-container section-space">
        <div className="mb-8">
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-primary transition"
            href="/announcements"
          >
            <ArrowLeft className="size-4" />
            Back to All Announcements
          </Link>
        </div>

        {typeof item.details.imageUrl === "string" && item.details.imageUrl && (
          <div className="relative mb-8 aspect-[16/9] max-h-[32rem] overflow-hidden rounded-2xl border border-border shadow-md">
            <Image
              alt={title}
              className="object-cover"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 75vw"
              src={item.details.imageUrl}
              unoptimized
            />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
            <Sparkles className="size-3.5" />
            Church Community
          </span>
          {typeof item.details.category === "string" && (
            <span className="inline-flex min-h-7 items-center rounded-full border border-border bg-surface px-3 text-xs font-semibold text-foreground">
              {announcementCategoryLabel(item.details.category)}
            </span>
          )}
          {typeof item.details.publicationDate === "string" && (
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <Calendar className="size-3.5" />
              <time dateTime={item.details.publicationDate}>
                {new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "Africa/Kigali" }).format(
                  new Date(item.details.publicationDate)
                )}
              </time>
            </div>
          )}
        </div>

        <h1 className="mt-5 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>

        {item.description && (
          <div className="mt-6 whitespace-pre-line text-base leading-relaxed text-muted">
            {item.description}
          </div>
        )}

        <div className="mt-10 border-t border-border pt-8">
          <Link
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-md transition hover:bg-primary-hover active:scale-[0.98]"
            href="/announcements"
          >
            <ArrowLeft className="size-4" />
            Back to Announcements
          </Link>
        </div>
      </article>
    </main>
  );
}

