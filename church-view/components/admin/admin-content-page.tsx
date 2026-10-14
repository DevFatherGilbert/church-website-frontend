import { notFound } from "next/navigation";
import type { AdminContentSection } from "@/lib/content/admin-content";
import { AdminRecordManager } from "@/components/admin/management/admin-record-manager";
import { InquiryManager } from "@/components/admin/management/inquiry-manager";
import { MediaLibraryManager } from "@/components/admin/management/media-library-manager";
import { AnnouncementManager } from "@/components/admin/management/announcement-manager";

import { SermonManager } from "@/components/admin/management/sermon-manager";
import { FaqManager } from "@/components/admin/management/faq-manager";

type RecordSection = "events" | "resources" | "leadership" | "settings" | "testimonials";

export function AdminContentPage({ section }: { section: AdminContentSection }) {
  if (section === "sermons") return <SermonManager />;
  if (section === "faqs") return <FaqManager />;
  if (section === "media") return <MediaLibraryManager />;
  if (section === "announcements") return <AnnouncementManager />;
  if (section === "inquiries" || section === "prayer-requests") return <InquiryManager section={section} />;
  if (["events", "resources", "leadership", "settings", "testimonials"].includes(section)) {
    return <AdminRecordManager section={section as RecordSection} />;
  }
  notFound();
}

