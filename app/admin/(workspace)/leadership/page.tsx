import type { Metadata } from "next";
import { AdminContentPage } from "@/components/admin/admin-content-page";

export const metadata: Metadata = { title: "Leadership", robots: { index: false, follow: false } };

export default function AdminLeadershipPage() {
  return <AdminContentPage section="leadership" />;
}
