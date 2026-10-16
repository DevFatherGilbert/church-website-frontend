import type { Metadata } from "next";
import { WebsiteSettingsManager } from "@/components/admin/management/website-settings-manager";

export const metadata: Metadata = { title: "Settings", robots: { index: false, follow: false } };

export default function AdminSettingsPage() {
  return <WebsiteSettingsManager mode="church-information" />;
}
