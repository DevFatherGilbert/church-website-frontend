import type { Metadata } from "next";
import { AdminContentPage } from "@/components/admin/admin-content-page";

export const metadata: Metadata = { title: "Sermons", robots: { index: false, follow: false } };

export default function AdminSermonsPage() {
  return <AdminContentPage section="sermons" />;
}
