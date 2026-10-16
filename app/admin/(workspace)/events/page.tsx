import type { Metadata } from "next";
import { AdminContentPage } from "@/components/admin/admin-content-page";

export const metadata: Metadata = { title: "Events", robots: { index: false, follow: false } };

export default function AdminEventsPage() {
  return <AdminContentPage section="events" />;
}
