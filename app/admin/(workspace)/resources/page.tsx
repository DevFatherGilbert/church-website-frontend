import type { Metadata } from "next";
import { AdminContentPage } from "@/components/admin/admin-content-page";

export const metadata: Metadata = { title: "Resources", robots: { index: false, follow: false } };

export default function AdminResourcesPage() {
  return <AdminContentPage section="resources" />;
}
