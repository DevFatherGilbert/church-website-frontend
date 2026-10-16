export const announcementCategories = [
  { value: "CHURCH_NEWS", label: "Church News" },
  { value: "WORSHIP_SERVICES", label: "Worship & Services" },
  { value: "EVENTS", label: "Events" },
  { value: "MINISTRIES", label: "Ministries" },
  { value: "COMMUNITY_OUTREACH", label: "Community & Outreach" },
  { value: "YOUTH_CHILDREN", label: "Youth & Children" },
  { value: "NOTICES", label: "Announcements & Notices" },
  { value: "OTHER", label: "Other" },
] as const;

export type AnnouncementCategory = (typeof announcementCategories)[number]["value"];
export type AnnouncementStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "PUBLISHED"
  | "UNPUBLISHED"
  | "EXPIRED"
  | "ARCHIVED";

export type Announcement = {
  id: string;
  title: string;
  slug: string;
  description: string;
  published: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  details: {
    category: AnnouncementCategory;
    imageUrl: string;
    publicationDate: string;
    expiryDate: string | null;
    status: AnnouncementStatus;
  };
};

export const announcementStatuses: { value: AnnouncementStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "PUBLISHED", label: "Published" },
  { value: "EXPIRED", label: "Expired" },
  { value: "UNPUBLISHED", label: "Unpublished" },
  { value: "ARCHIVED", label: "Archived" },
];

export function announcementCategoryLabel(category: string) {
  return announcementCategories.find((option) => option.value === category)?.label ?? "Other";
}
