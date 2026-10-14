import type { Metadata } from "next";
import { AdminContentPage } from "@/components/admin/admin-content-page";
export const metadata: Metadata = { title: "FAQ Management", robots: { index: false, follow: false } };
export default function AdminFaqsPage() { return <AdminContentPage section="faqs" />; }
