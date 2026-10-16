import type { MetadataRoute } from "next";
import { getPublicData, type Sermon, type ChurchEvent, type Ministry } from "@/lib/api/church-api";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");

function url(path: string, lastModified?: string | Date | null): MetadataRoute.Sitemap[number] {
  return {
    url: `${siteUrl}${path}`,
    lastModified: lastModified ? new Date(lastModified) : new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static public pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/about/our-story`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/about/mission-vision`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/about/beliefs`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/about/leadership`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/ministries`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/services`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/sermons`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/events`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/announcements`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/resources`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/faqs`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/plan-your-visit`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/prayer-request`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/terms-and-conditions`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/cookie-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  // Dynamic content — fetch in parallel, ignore failures
  const [sermons, events, ministries] = await Promise.all([
    getPublicData<Sermon[]>("/sermons?limit=200").catch(() => null),
    getPublicData<ChurchEvent[]>("/events?limit=200").catch(() => null),
    getPublicData<Ministry[]>("/ministries?limit=200").catch(() => null),
  ]);

  const sermonPages: MetadataRoute.Sitemap = (sermons ?? [])
    .filter((s) => s.slug && (s.status === "published" || !s.status))
    .map((s) => ({
      url: `${siteUrl}/sermons/${encodeURIComponent(s.slug)}`,
      lastModified: s.updatedAt ? new Date(s.updatedAt) : new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  const eventPages: MetadataRoute.Sitemap = (events ?? [])
    .filter((e) => e.status === "published" || !e.status)
    .map((e) => ({
      url: `${siteUrl}/events/${e.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  const ministryPages: MetadataRoute.Sitemap = (ministries ?? [])
    .filter((m) => m.slug && (m.status === "published" || !m.status))
    .map((m) => ({
      url: `${siteUrl}/ministries/${encodeURIComponent(m.slug)}`,
      lastModified: m.updatedAt ? new Date(m.updatedAt) : new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  return [...staticPages, ...sermonPages, ...eventPages, ...ministryPages];
}
