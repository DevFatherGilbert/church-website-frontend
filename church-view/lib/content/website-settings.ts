import { getPublicData } from "@/lib/api/church-api";

export type HomepageSectionKey = "welcome" | "facts" | "services" | "about" | "ministries" | "events" | "announcements" | "sermons" | "testimonials" | "gallery" | "contact";
export type HomepageSection = { visible: boolean; order: number; heading: string; description: string; limit?: number; featuredMinistryIds?: string[]; imageUrl?: string; imageAlt?: string; primaryCtaLabel?: string; primaryCtaHref?: string; secondaryCtaLabel?: string; secondaryCtaHref?: string };
export type HomepageSettings = {
  contentKey: "homepage";
  hero: { heading: string; description: string; imageUrl: string; imageAlt: string; visible: boolean; primaryCtaLabel: string; primaryCtaHref: string; secondaryCtaLabel: string; secondaryCtaHref: string };
  sections: Record<HomepageSectionKey, HomepageSection>;
};
export type ChurchInformation = {
  contentKey: "church-information";
  profile: { history: string; imageUrl: string; imageAlt: string; logoUrl: string; logoAlt: string };
  contact: { city: string; country: string; address: string; phone: string; email: string; directionsUrl: string; mapUrl: string };
  mission: { heading: string; statement: string; description: string; visible: boolean };
  vision: { heading: string; statement: string; description: string; visible: boolean };
  coreValues: { title: string; description: string; order: number; visible: boolean }[];
  beliefs: { title: string; description: string; order: number; visible: boolean }[];
  socialLinks: { label: string; url: string; visible: boolean }[];
};
export type WebsiteSettingRecord = { id: string; type: string; title: string; slug: string; description?: string | null; details: Record<string, unknown>; published: boolean; updatedAt?: string };

export const defaultHomepageSettings: HomepageSettings = {
  contentKey: "homepage",
  hero: { heading: "", description: "", imageUrl: "", imageAlt: "", visible: true, primaryCtaLabel: "Plan Your Visit", primaryCtaHref: "/plan-your-visit", secondaryCtaLabel: "Watch Sermons", secondaryCtaHref: "/sermons" },
  sections: {
    welcome: { visible: true, order: 0, heading: "", description: "", imageUrl: "", imageAlt: "", primaryCtaLabel: "", primaryCtaHref: "" },
    facts: { visible: true, order: 1, heading: "At a glance", description: "" },
    services: { visible: true, order: 2, heading: "Service schedule", description: "" },
    about: { visible: true, order: 3, heading: "About the church", description: "", primaryCtaLabel: "Learn more about us", primaryCtaHref: "/about" },
    ministries: { visible: true, order: 4, heading: "Featured ministries", description: "", featuredMinistryIds: [] },
    events: { visible: true, order: 5, heading: "Upcoming events", description: "", limit: 3 },
    announcements: { visible: true, order: 6, heading: "Latest announcements", description: "", limit: 3 },
    sermons: { visible: true, order: 7, heading: "Latest sermons", description: "", limit: 3 },
    testimonials: { visible: true, order: 8, heading: "Stories from our community", description: "", limit: 3 },
    gallery: { visible: true, order: 9, heading: "Moments we share", description: "", limit: 6 },
    contact: { visible: true, order: 10, heading: "Plan your visit", description: "", primaryCtaLabel: "Contact us", primaryCtaHref: "/contact", secondaryCtaLabel: "Prayer request", secondaryCtaHref: "/prayer-request" },
  },
};
export const defaultChurchInformation: ChurchInformation = {
  contentKey: "church-information", profile: { history: "", imageUrl: "", imageAlt: "", logoUrl: "", logoAlt: "" },
  contact: { city: "", country: "", address: "", phone: "", email: "", directionsUrl: "", mapUrl: "" },
  mission: { heading: "", statement: "", description: "", visible: true }, vision: { heading: "", statement: "", description: "", visible: true },
  coreValues: [], beliefs: [], socialLinks: [],
};

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function mergeHomepageSettings(details: Record<string, unknown>): HomepageSettings {
  const sectionValues = asObject(details.sections);
  const sections = {} as HomepageSettings["sections"];
  for (const key of Object.keys(defaultHomepageSettings.sections) as HomepageSectionKey[]) {
    sections[key] = {
      ...defaultHomepageSettings.sections[key],
      ...asObject(sectionValues[key]),
    } as HomepageSection;
  }
  return {
    ...defaultHomepageSettings,
    ...details,
    contentKey: "homepage",
    hero: { ...defaultHomepageSettings.hero, ...asObject(details.hero) } as HomepageSettings["hero"],
    sections,
  };
}

function mergeChurchInformation(details: Record<string, unknown>): ChurchInformation {
  const legacyContact = {
    city: details.city,
    country: details.country,
    address: details.address,
    phone: details.publicPhone,
    email: details.publicEmail,
  };
  return {
    ...defaultChurchInformation,
    ...details,
    contentKey: "church-information",
    contact: {
      ...defaultChurchInformation.contact,
      ...legacyContact,
      ...asObject(details.contact),
    } as ChurchInformation["contact"],
    profile: {
      ...defaultChurchInformation.profile,
      ...asObject(details.profile),
    } as ChurchInformation["profile"],
    mission: {
      ...defaultChurchInformation.mission,
      ...asObject(details.mission),
    } as ChurchInformation["mission"],
    vision: {
      ...defaultChurchInformation.vision,
      ...asObject(details.vision),
    } as ChurchInformation["vision"],
    coreValues: Array.isArray(details.coreValues)
      ? details.coreValues as ChurchInformation["coreValues"]
      : defaultChurchInformation.coreValues,
    beliefs: Array.isArray(details.beliefs)
      ? details.beliefs as ChurchInformation["beliefs"]
      : defaultChurchInformation.beliefs,
    socialLinks: Array.isArray(details.socialLinks)
      ? details.socialLinks as ChurchInformation["socialLinks"]
      : defaultChurchInformation.socialLinks,
  };
}

export async function getPublicWebsiteSettings() {
  const result = await getPublicData<{ items: WebsiteSettingRecord[] }>("/content/settings?limit=100").catch((error: unknown) => {
    if (process.env.NODE_ENV === "production") throw error;
    return null;
  });
  const items = result?.items ?? [];
  const homepage = items.find((item) => item.details?.contentKey === "homepage");
  const church = items.find((item) => item.details?.contentKey === "church-information") ?? items.find((item) => !item.details?.contentKey);
  return {
    homepage: homepage ? mergeHomepageSettings(homepage.details) : defaultHomepageSettings,
    church: church ? mergeChurchInformation(church.details) : defaultChurchInformation,
    churchRecord: church ?? null,
    homepageRecord: homepage ?? null,
    churchName: church?.title ?? "",
    churchDescription: church?.description ?? "",
  };
}
