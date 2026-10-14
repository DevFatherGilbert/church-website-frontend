import type { Metadata } from "next";
import { AdminContentPage } from "@/components/admin/admin-content-page";

export const metadata: Metadata = {
  title: "Community stories",
  robots: { index: false, follow: false },
};

export default function TestimonialsManagementPage() {
  return <AdminContentPage section="testimonials" />;
}
