import type { ReactNode } from "react";
import { connection } from "next/server";
import { SiteFooter } from "./site-footer";
import { HeaderView } from "./Header";
import { getPublicWebsiteSettings } from "@/lib/content/website-settings";
import { getPublicData, type PublicContent } from "@/lib/api/church-api";

export async function SiteChrome({ children }: { children: ReactNode }) {
  await connection();
  const [{ church, homepage }, announcementsData] = await Promise.all([
    getPublicWebsiteSettings(),
    getPublicData<{ items: PublicContent[] }>("/content/announcements?limit=5").catch(() => null),
  ]);

  const dbAnnouncements = announcementsData?.items ?? [];
  const urgentAnnouncement =
    dbAnnouncements.find(
      (item) =>
        item.details.category === "NOTICES" ||
        item.title.toLowerCase().includes("urgent") ||
        (item.description && item.description.toLowerCase().includes("urgent")),
    ) ??
    dbAnnouncements[0] ??
    null;

  return (
    <div id="top">
      {/* Skip to main content link for keyboard accessibility (SRS Section 70) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-amber-400 focus:px-4 focus:py-2.5 focus:text-xs focus:font-extrabold focus:uppercase focus:tracking-wider focus:text-stone-950 focus:shadow-2xl focus:outline-none focus:ring-2 focus:ring-stone-950"
      >
        Skip to main content
      </a>
      <HeaderView
        phone={church.contact.phone}
        email={church.contact.email}
        location={[church.contact.city, church.contact.country].filter(Boolean).join(", ") || "Kigali, Rwanda"}
        siteHeader={homepage.siteHeader}
        urgentAnnouncement={
          urgentAnnouncement
            ? {
                id: urgentAnnouncement.id,
                title: urgentAnnouncement.title,
                description: urgentAnnouncement.description,
                slug: urgentAnnouncement.slug,
                category: String(urgentAnnouncement.details.category || "NOTICES"),
                href: `/announcements/${urgentAnnouncement.slug}`,
              }
            : null
        }
      />
      {/* Main content — hero page handles its own top padding; inner pages need the offset */}
      <div id="main-content">{children}</div>
      <SiteFooter />
    </div>
  );
}
