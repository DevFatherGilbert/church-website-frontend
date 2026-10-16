import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { AnnouncementList } from "@/components/public-pages/announcement-list";
import { getPublicData, type PublicContent } from "@/lib/api/church-api";

export const metadata: Metadata = {
  title: "Announcements",
  description: "Church announcements, community news, ministry updates and notices from the church.",
  alternates: { canonical: "/announcements" },
};

export const revalidate = 60;

export default async function AnnouncementsPage() {
  const response = await getPublicData<{ items: PublicContent[] }>("/content/announcements?limit=50");
  return <main>
    <PageHero eyebrow="NEWS & ANNOUNCEMENTS" title="The latest from" emphasis="our community." description="Church announcements, community news, ministry updates and special notices—all in one place." breadcrumbs={[{ label: "Home", href: "/" }]} />
    <section className="page-container section-space"><AnnouncementList items={response?.items ?? []} /></section>
  </main>;
}
