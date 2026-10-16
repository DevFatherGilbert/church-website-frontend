import type { Metadata } from "next";
import { AdminContentPage } from "@/components/admin/admin-content-page";

export const metadata: Metadata = { title: "Announcements", robots: { index: false, follow: false } };

export default function AdminAnnouncementsPage() {
  return <AdminContentPage section="announcements" />;
}
