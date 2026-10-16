import type { Metadata } from "next";
import { AdminContentPage } from "@/components/admin/admin-content-page";

export const metadata: Metadata = { title: "Media library", robots: { index: false, follow: false } };

export default function AdminMediaPage() {
  return <AdminContentPage section="media" />;
}
