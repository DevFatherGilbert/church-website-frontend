import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, BookOpen, Download, FileText, Sparkles } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { getPublicData, type PublicContent } from "@/lib/api/church-api";
import { getPublicWebsiteSettings } from "@/lib/content/website-settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicWebsiteSettings().catch(() => null);
  const name = settings?.churchName || "Church";
  return {
    title: `Christian Resources & Bible Studies | ${name}`,
    description: `Browse downloadable Bible study materials, Sabbath School lessons, prayer devotionals, and church documents from ${name}.`,
    alternates: { canonical: "/resources" },
  };
}

export const revalidate = 60;

function detailText(details: Record<string, unknown>, key: string) {
  const value = details[key];
  return typeof value === "string" ? value.trim() : "";
}

const fallbackResources = [
  {
    id: "fb-1",
    title: "Sabbath School Bible Study Guide",
    description: "Quarterly interactive Bible lessons designed for personal study and Sabbath group discussions.",
    category: "Bible Study",
    resourceType: "Quarterly Guide",
    url: "https://www.adultbiblestudyguide.org/",
    imageUrl: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "fb-2",
    title: "Daily Morning Devotional & Prayer Guide",
    description: "Start each day with inspired Scripture readings, faith reflections, and targeted prayer prompts for your family.",
    category: "Prayer & Devotion",
    resourceType: "Prayer Guide",
    url: "/prayer-request",
    imageUrl: "https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "fb-3",
    title: "Christian Family & Marriage Handbook",
    description: "Practical biblical counsel on nurturing love, communication, parenting, and Christ-centered harmony in the home.",
    category: "Family Life",
    resourceType: "Handbook",
    url: "/ministries/family-life",
    imageUrl: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "fb-4",
    title: "Youth Leadership & Discipleship Manual",
    description: "Equipping young people to lead with integrity, discover their spiritual gifts, and make an impact in society.",
    category: "Youth Ministry",
    resourceType: "Discipleship Manual",
    url: "/ministries/youth",
    imageUrl: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "fb-5",
    title: "Children’s Sabbath Activity Sheets",
    description: "Colorful, engaging Bible lesson coloring pages and activity sheets for children ages 4 to 12.",
    category: "Children's Ministry",
    resourceType: "Activity Sheets",
    url: "/ministries/children",
    imageUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "fb-6",
    title: "Church Constitution & Fundamental Beliefs",
    description: "Full doctrinal statement, church heritage, and governance guidelines approved by the church leadership.",
    category: "Church Documents",
    resourceType: "Official Document",
    url: "/about/beliefs",
    imageUrl: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=800&q=80",
  },
];

export default async function ResourcesPage() {
  const response = await getPublicData<{ items: PublicContent[] }>("/content/resources?limit=100");
  const published = response?.items ?? [];

  // Map published items or merge with fallback
  const items = published.length
    ? published.map((item, idx) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        category: detailText(item.details, "category") || "Study Resource",
        resourceType: detailText(item.details, "resourceType") || "Document",
        url: detailText(item.details, "url"),
        imageUrl:
          detailText(item.details, "imageUrl") ||
          fallbackResources[idx % fallbackResources.length].imageUrl,
      }))
    : fallbackResources;

  return (
    <main className="bg-background">
      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }]}
        description="Access Bible study guides, quarterly lessons, devotional materials, and official church documents to enrich your spiritual journey."
        emphasis="your faith."
        eyebrow="CHRISTIAN RESOURCES"
        title="Tools to nurture"
      />

      <section aria-label="Published church resources" className="page-container py-16 sm:py-24">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-secondary">
            DIGITAL RESOURCE LIBRARY
          </p>
          <h2 className="font-headline mt-2 text-3xl sm:text-4xl font-bold uppercase tracking-wide text-primary">
            Materials for Spiritual Growth
          </h2>
          <p className="mt-3 text-base text-muted">
            All materials below are free for personal reading, family worship, and Sabbath study.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((resource) => (
            <article
              className="group flex flex-col overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-xl"
              key={resource.id}
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-stone-900">
                <Image
                  alt={resource.title}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  src={resource.imageUrl}
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/85 via-transparent to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-stone-950">
                    {resource.category}
                  </span>
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between p-6 sm:p-7">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                    {resource.resourceType}
                  </span>
                  <h3 className="font-display mt-2 text-xl font-bold tracking-tight text-text group-hover:text-primary transition-colors">
                    {resource.title}
                  </h3>
                  {resource.description && (
                    <p className="mt-3 text-sm leading-relaxed text-muted line-clamp-3">
                      {resource.description}
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-border/60">
                  {resource.url ? (
                    <a
                      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary group-hover:text-primary-hover group-hover:translate-x-1 transition-all"
                      href={resource.url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <span>Access resource</span>
                      <ArrowUpRight aria-hidden="true" className="size-4" />
                    </a>
                  ) : (
                    <span className="text-xs text-muted">Available at church office</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
