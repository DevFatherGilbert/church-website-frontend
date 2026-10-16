import type { Metadata } from "next";
import { AdminContentPage } from "@/components/admin/admin-content-page";

export const metadata: Metadata = { title: "Inquiries", robots: { index: false, follow: false } };

export default function AdminInquiriesPage() {
  return <AdminContentPage section="inquiries" />;
}
