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
  hero: {
    heading: "Welcome to Our Church",
    description: "A welcoming community committed to faith, worship, fellowship, service and sharing the message of Christ.",
    imageUrl: "",
    imageAlt: "Church worship congregation",
    visible: true,
    primaryCtaLabel: "Plan Your Visit",
    primaryCtaHref: "/plan-your-visit",
    secondaryCtaLabel: "Watch Sermons",
    secondaryCtaHref: "/sermons",
  },
  sections: {
    welcome: {
      visible: true,
      order: 0,
      heading: "We Are a Community of Faith",
      description: "A community committed to worship, spiritual growth, fellowship, service and sharing the message of Christ with individuals, families and the wider community.",
      imageUrl: "",
      imageAlt: "Church community gathering",
      primaryCtaLabel: "Our Story",
      primaryCtaHref: "/about/our-story",
    },
    facts: { visible: true, order: 1, heading: "At a glance", description: "" },
    services: {
      visible: true,
      order: 2,
      heading: "Worship With Us",
      description: "Join us this week for inspiring worship, biblical preaching, and fellowship.",
      primaryCtaLabel: "Plan Your Visit",
      primaryCtaHref: "/plan-your-visit",
    },
    about: {
      visible: true,
      order: 3,
      heading: "About Our Church",
      description: "Rooted in scripture and committed to Christ, we seek to transform lives and strengthen families.",
      primaryCtaLabel: "Learn more about us",
      primaryCtaHref: "/about",
    },
    ministries: {
      visible: true,
      order: 4,
      heading: "Featured Ministries",
      description: "Discover a place to connect, grow, and serve alongside people in every season of life.",
      featuredMinistryIds: [],
    },
    events: {
      visible: true,
      order: 5,
      heading: "Upcoming Events",
      description: "Explore upcoming gatherings, conferences, and community fellowship opportunities.",
      limit: 3,
    },
    sermons: {
      visible: true,
      order: 6,
      heading: "Latest Sermons",
      description: "Watch or listen to life-giving messages and teachings from God's Word.",
      limit: 3,
    },
    announcements: {
      visible: true,
      order: 7,
      heading: "Church Announcements",
      description: "Stay informed with important updates, ministry notices, and community news.",
      limit: 3,
    },
    testimonials: {
      visible: true,
      order: 8,
      heading: "Stories From Our Community",
      description: "Real testimonies of faith, transformation, and God's work in people's lives.",
      limit: 3,
    },
    gallery: {
      visible: true,
      order: 9,
      heading: "Church Life & Moments",
      description: "A glimpse of our vibrant community in worship, fellowship, and service.",
      limit: 6,
    },
    contact: {
      visible: true,
      order: 10,
      heading: "Visit & Connect",
      description: "Whether you have questions, need prayer, or are planning your first visit, we are here for you.",
      primaryCtaLabel: "Plan Your Visit",
      primaryCtaHref: "/plan-your-visit",
      secondaryCtaLabel: "Submit Prayer Request",
      secondaryCtaHref: "/prayer-request",
    },
  },
};

export const defaultChurchInformation: ChurchInformation = {
  contentKey: "church-information",
  profile: {
    history: "A community committed to worship, spiritual growth, fellowship, service and sharing the message of Christ with individuals, families and the wider community.",
    imageUrl: "https://images.unsplash.com/photo-1548625361-195fe61a55c3?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Church sanctuary and congregation",
    logoUrl: "/logo-c.png",
    logoAlt: "Church Logo",
  },
  contact: {
    city: "Kigali",
    country: "Rwanda",
    address: "KG 11 Ave, Remera, Kigali",
    phone: "+250 788 123 456",
    email: "info@church.org",
    directionsUrl: "https://maps.google.com",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15949.998492067746!2d30.058!3d-1.95!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca4258ed8e797%3A0xf52b8d0016912345!2sKigali!5e0!3m2!1sen!2srw!4v1600000000000!5m2!1sen!2srw",
  },
  mission: {
    heading: "Our Mission",
    statement: "To proclaim the Gospel, nurture spiritual growth, build a Christ-centered community, and serve people with love and compassion.",
    description: "Empowered by faith, we strive to touch every life with the love and grace of Jesus Christ.",
    visible: true,
  },
  vision: {
    heading: "Our Vision",
    statement: "To be a Christ-centered community that transforms lives, strengthens families and positively impacts the community.",
    description: "Creating an environment where individuals and families flourish in their relationship with God.",
    visible: true,
  },
  coreValues: [
    { title: "Faith", description: "Firmly grounded in God's eternal Word.", order: 0, visible: true },
    { title: "Love", description: "Extending unconditional grace and warmth to everyone.", order: 1, visible: true },
    { title: "Integrity", description: "Walking in truth, honesty, and accountability.", order: 2, visible: true },
    { title: "Service", description: "Humbly serving our church family and wider community.", order: 3, visible: true },
    { title: "Compassion", description: "Caring deeply for the broken, hurting, and vulnerable.", order: 4, visible: true },
    { title: "Fellowship", description: "Building meaningful, supportive relationships in Christ.", order: 5, visible: true },
  ],
  beliefs: [
    { title: "The Bible", description: "The inspired, infallible, and supreme Word of God.", order: 0, visible: true },
    { title: "The Triune God", description: "One God revealed as Father, Son, and Holy Spirit.", order: 1, visible: true },
    { title: "Jesus Christ", description: "Lord and Savior, fully God and fully man, crucified and risen.", order: 2, visible: true },
    { title: "Salvation", description: "A free gift of grace received through faith in Christ Jesus.", order: 3, visible: true },
  ],
  socialLinks: [
    { label: "Facebook", url: "https://facebook.com", visible: true },
    { label: "Instagram", url: "https://instagram.com", visible: true },
    { label: "YouTube", url: "https://youtube.com", visible: true },
    { label: "WhatsApp", url: "https://whatsapp.com", visible: true },
  ],
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
  const result = await getPublicData<{ items: WebsiteSettingRecord[] }>("/content/settings?limit=100").catch(() => null);
  const items = result?.items ?? [];
  const homepage = items.find((item) => item.details?.contentKey === "homepage");
  const church = items.find((item) => item.details?.contentKey === "church-information") ?? items.find((item) => !item.details?.contentKey);
  return {
    backendAvailable: result !== null,
    homepage: homepage ? mergeHomepageSettings(homepage.details) : defaultHomepageSettings,
    church: church ? mergeChurchInformation(church.details) : defaultChurchInformation,
    churchRecord: church ?? null,
    homepageRecord: homepage ?? null,
    churchName: church?.title ?? "",
    churchDescription: church?.description ?? "",
  };
}
