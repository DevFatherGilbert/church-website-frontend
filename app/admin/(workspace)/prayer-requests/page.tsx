import type { Metadata } from "next";
import { AdminContentPage } from "@/components/admin/admin-content-page";

export const metadata: Metadata = { title: "Prayer requests", robots: { index: false, follow: false } };

export default function AdminPrayerRequestsPage() {
  return <AdminContentPage section="prayer-requests" />;
}
