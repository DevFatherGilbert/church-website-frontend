import type { Metadata } from "next";
import { PrayerRequestPage } from "@/components/public-pages/prayer-request-page";

export const metadata: Metadata = {
  title: "Prayer request",
  description: "Share a prayer request with our church prayer team.",
  alternates: { canonical: "/prayer-request" },
};

export default function PrayerRequestRoute() {
  return <PrayerRequestPage />;
}
