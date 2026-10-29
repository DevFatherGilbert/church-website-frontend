import type { MetadataRoute } from "next";
import {
  getPublicData,
  type Sermon,
  type ChurchEvent,
  type Ministry,
  type PublicContent,
} from "@/lib/api/church-api";
import { absoluteUrl } from "@/lib/site-url";

/**
 * Revalidate sitemap periodically (hourly) so newly published
 * sermons, events, ministries, or announcements are automatically discovered.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapMap = new Map<string, MetadataRoute.Sitemap[number]>();

  function addEntry(
    path: string,
    lastModified?: string | Date | null,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly",
    priority: number = 0.7,
  ) {
    const url = absoluteUrl(path);
    if (!sitemapMap.has(url)) {
      sitemapMap.set(url, {
        url,
        lastModified: lastModified ? new Date(lastModified) : new Date(),
        changeFrequency,
        priority,
      });
    }
  }

  // 1. Core static public routes (preserves all original 19 static routes + 7 static ministry pages = 26 total)
  const staticRoutes: {
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }[] = [
    { path: "/", changeFrequency: "daily", priority: 1.0 },
    // About section
    { path: "/about", changeFrequency: "monthly", priority: 0.8 },
    { path: "/about/our-story", changeFrequency: "monthly", priority: 0.7 },
    { path: "/about/mission-vision", changeFrequency: "monthly", priority: 0.7 },
    { path: "/about/beliefs", changeFrequency: "monthly", priority: 0.7 },
    { path: "/about/leadership", changeFrequency: "monthly", priority: 0.7 },
    // Ministries
    { path: "/ministries", changeFrequency: "weekly", priority: 0.8 },
    { path: "/ministries/children", changeFrequency: "monthly", priority: 0.7 },
    { path: "/ministries/youth", changeFrequency: "monthly", priority: 0.7 },
    { path: "/ministries/women", changeFrequency: "monthly", priority: 0.7 },
    { path: "/ministries/men", changeFrequency: "monthly", priority: 0.7 },
    { path: "/ministries/worship", changeFrequency: "monthly", priority: 0.7 },
    { path: "/ministries/prayer", changeFrequency: "monthly", priority: 0.7 },
    { path: "/ministries/outreach", changeFrequency: "monthly", priority: 0.7 },
    // Services, Media & Engagement
    { path: "/services", changeFrequency: "weekly", priority: 0.8 },
    { path: "/sermons", changeFrequency: "daily", priority: 0.9 },
    { path: "/events", changeFrequency: "daily", priority: 0.9 },
    { path: "/announcements", changeFrequency: "daily", priority: 0.8 },
    { path: "/resources", changeFrequency: "weekly", priority: 0.7 },
    { path: "/faqs", changeFrequency: "monthly", priority: 0.6 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
    { path: "/plan-your-visit", changeFrequency: "monthly", priority: 0.8 },
    { path: "/prayer-request", changeFrequency: "monthly", priority: 0.6 },
    // Legal & Policy
    { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/terms-and-conditions", changeFrequency: "yearly", priority: 0.3 },
    { path: "/cookie-policy", changeFrequency: "yearly", priority: 0.3 },
  ];

  for (const route of staticRoutes) {
    addEntry(route.path, new Date(), route.changeFrequency, route.priority);
  }

  // 2. Dynamic content — fetched in parallel with graceful fallback
  const [sermons, events, ministries, announcements] = await Promise.all([
    getPublicData<Sermon[]>("/sermons?limit=200").catch(() => null),
    getPublicData<ChurchEvent[]>("/events?limit=200").catch(() => null),
    getPublicData<Ministry[]>("/ministries?limit=200").catch(() => null),
    getPublicData<{ items: PublicContent[] }>("/content/announcements?limit=200").catch(() => null),
  ]);

  // Dynamic sermons
  if (Array.isArray(sermons)) {
    for (const sermon of sermons) {
      if (sermon?.slug && (sermon.status === "published" || !sermon.status)) {
        addEntry(
          `/sermons/${encodeURIComponent(sermon.slug)}`,
          sermon.updatedAt || sermon.date,
          "monthly",
          0.7,
        );
      }
    }
  }

  // Dynamic events
  if (Array.isArray(events)) {
    for (const event of events) {
      if (event?.id && (event.status === "published" || !event.status)) {
        addEntry(
          `/events/${encodeURIComponent(event.id)}`,
          event.date,
          "weekly",
          0.7,
        );
      }
    }
  }

  // Dynamic ministries
  if (Array.isArray(ministries)) {
    for (const ministry of ministries) {
      if (ministry?.slug && (ministry.status === "published" || !ministry.status)) {
        addEntry(
          `/ministries/${encodeURIComponent(ministry.slug)}`,
          ministry.updatedAt,
          "monthly",
          0.7,
        );
      }
    }
  }

  // Dynamic announcements
  const announcementItems = announcements?.items;
  if (Array.isArray(announcementItems)) {
    for (const item of announcementItems) {
      if (item?.slug) {
        addEntry(
          `/announcements/${encodeURIComponent(item.slug)}`,
          item.publishedAt,
          "daily",
          0.8,
        );
      }
    }
  }

  return Array.from(sitemapMap.values());
}
