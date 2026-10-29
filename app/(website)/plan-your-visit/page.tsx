import type { Metadata } from "next";
import { PlanYourVisitPage } from "@/components/public-pages/plan-your-visit-page";
import { getPublicData, type PublicContent } from "@/lib/api/church-api";
import { sortServices, toChurchService } from "@/lib/content/services";
import { getPublicWebsiteSettings } from "@/lib/content/website-settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicWebsiteSettings().catch(() => null);
  const name = settings?.churchName || "Church";
  return {
    title: `Plan Your Visit | ${name}`,
    description: `Experience Sabbath worship and warm fellowship at ${name}. Find gathering times, what to expect, and parking instructions.`,
    alternates: { canonical: "/plan-your-visit" },
  };
}

export default async function PlanYourVisitRoute() {
  const [response, websiteSettings] = await Promise.all([
    getPublicData<{ items: PublicContent[] }>("/content/services?limit=50"),
    getPublicWebsiteSettings(),
  ]);
  return <PlanYourVisitPage services={sortServices((response?.items ?? []).map(toChurchService))} contact={websiteSettings.church.contact} />;
}
