import type { Metadata } from "next";
import { PlanYourVisitPage } from "@/components/public-pages/plan-your-visit-page";
import { getPublicData, type PublicContent } from "@/lib/api/church-api";
import { sortServices, toChurchService } from "@/lib/content/services";
import { getPublicWebsiteSettings } from "@/lib/content/website-settings";

export const metadata: Metadata = {
  title: "Plan Your Visit",
  description: "Find the church’s current published gathering times and location before you visit.",
  alternates: { canonical: "/plan-your-visit" },
};

export default async function PlanYourVisitRoute() {
  const [response, websiteSettings] = await Promise.all([
    getPublicData<{ items: PublicContent[] }>("/content/services?limit=50"),
    getPublicWebsiteSettings(),
  ]);
  return <PlanYourVisitPage services={sortServices((response?.items ?? []).map(toChurchService))} contact={websiteSettings.church.contact} />;
}
