import type { Metadata } from "next";
import { PrayerRequestPage } from "@/components/public-pages/prayer-request-page";
import { getPublicWebsiteSettings } from "@/lib/content/website-settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicWebsiteSettings().catch(() => null);
  const name = settings?.churchName || "Church";
  return {
    title: `Prayer Requests & Intercession | ${name}`,
    description: `Share your prayer needs with the pastoral prayer team at ${name}. Every request is received with love, confidentiality, and earnest faith.`,
    alternates: { canonical: "/prayer-request" },
  };
}

export default function PrayerRequestRoute() {
  return <PrayerRequestPage />;
}
