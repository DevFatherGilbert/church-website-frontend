export const adminSections = [
  ["Dashboard", "/admin/dashboard"],
  ["Homepage", "/admin/homepage"],
  ["Service schedule", "/admin/services"],
  ["Sermons", "/admin/sermons"],
  ["Events", "/admin/events"],
  ["Ministries", "/admin/ministries"],
  ["Announcements", "/admin/announcements"],
  ["FAQ Management", "/admin/faqs"],
  ["Resources", "/admin/resources"],
  ["Leadership", "/admin/leadership"],
  ["Testimonials", "/admin/testimonials"],
  ["Media library", "/admin/media"],
  ["Inquiries", "/admin/inquiries"],
  ["Prayer requests", "/admin/prayer-requests"],
  ["Church Information", "/admin/settings"],
] as const;

export type AdminContentSection =
  | "sermons"
  | "events"
  | "ministries"
  | "announcements"
  | "faqs"
  | "resources"
  | "leadership"
  | "testimonials"
  | "media"
  | "inquiries"
  | "prayer-requests"
  | "settings";
