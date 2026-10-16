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
    heading: "Rooted in Scripture. Resting in the Sabbath. Sharing hope in Jesus.",
    description: "A Bible-centered Christian community that worships on the seventh-day Sabbath and seeks to serve with the compassion of Jesus.",
    imageUrl: "",
    imageAlt: "Church worship congregation",
    visible: true,
    primaryCtaLabel: "Explore our beliefs",
    primaryCtaHref: "/about/beliefs",
    secondaryCtaLabel: "Plan a visit",
    secondaryCtaHref: "/plan-your-visit",
  },
  sections: {
    welcome: {
      visible: true,
      order: 0,
      heading: "A place to worship, learn, and serve",
      description: "Discover a Christ-centered community shaped by Scripture, Sabbath worship, prayer, and practical care for others.",
      imageUrl: "",
      imageAlt: "Church community gathering",
      primaryCtaLabel: "What we believe",
      primaryCtaHref: "/about/beliefs",
    },
    facts: { visible: false, order: 1, heading: "", description: "" },
    services: {
      visible: true,
      order: 2,
      heading: "Gather on the Sabbath",
      description: "The seventh-day Sabbath is a time for worship, rest, Bible study, and fellowship. Ask the local congregation to confirm current meeting details.",
      primaryCtaLabel: "Plan Your Visit",
      primaryCtaHref: "/plan-your-visit",
    },
    about: {
      visible: true,
      order: 3,
      heading: "Faith grounded in Scripture",
      description: "Seventh-day Adventists look to the Bible as the foundation for faith and follow Jesus with hope in His promised return.",
      primaryCtaLabel: "Read our beliefs",
      primaryCtaHref: "/about/beliefs",
    },
    ministries: {
      visible: true,
      order: 4,
      heading: "Grow and serve together",
      description: "Find ways to learn Scripture, support families, encourage young people, worship, and care for neighbors.",
      featuredMinistryIds: [],
    },
    events: {
      visible: false,
      order: 5,
      heading: "Upcoming Events",
      description: "Explore upcoming gatherings, conferences, and community fellowship opportunities.",
      limit: 3,
    },
    sermons: {
      visible: false,
      order: 6,
      heading: "Latest Sermons",
      description: "Watch or listen to life-giving messages and teachings from God's Word.",
      limit: 3,
    },
    announcements: {
      visible: false,
      order: 7,
      heading: "Church Announcements",
      description: "Stay informed with important updates, ministry notices, and community news.",
      limit: 3,
    },
    testimonials: {
      visible: false,
      order: 8,
      heading: "Stories From Our Community",
      description: "Real testimonies of faith, transformation, and God's work in people's lives.",
      limit: 3,
    },
    gallery: {
      visible: false,
      order: 9,
      heading: "Church Life & Moments",
      description: "A glimpse of our vibrant community in worship, fellowship, and service.",
      limit: 6,
    },
    contact: {
      visible: true,
      order: 10,
      heading: "Come learn and worship with us",
      description: "Contact the local congregation for its verified address, service time, and visit information.",
      primaryCtaLabel: "Plan a visit",
      primaryCtaHref: "/plan-your-visit",
      secondaryCtaLabel: "Submit Prayer Request",
      secondaryCtaHref: "/prayer-request",
    },
  },
};

export const defaultChurchInformation: ChurchInformation = {
  contentKey: "church-information",
  profile: {
    history: "A Seventh-day Adventist faith community centered on Scripture, Jesus Christ, Sabbath worship, spiritual growth, fellowship, and service.",
    imageUrl: "https://images.unsplash.com/photo-1548625361-195fe61a55c3?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Church sanctuary and congregation",
    logoUrl: "/logo-c.png",
    logoAlt: "Church Logo",
  },
  contact: {
    city: "",
    country: "",
    address: "",
    phone: "",
    email: "",
    directionsUrl: "",
    mapUrl: "",
  },
  mission: {
    heading: "Our Mission",
    statement: "To make disciples of Jesus Christ who live as His loving witnesses and proclaim the everlasting gospel.",
    description: "We study Scripture, grow in Christ, worship on the seventh-day Sabbath, and serve our neighbors.",
    visible: true,
  },
  vision: {
    heading: "Our Vision",
    statement: "To reflect the character of Jesus and share the hope of His soon return with the world.",
    description: "A welcoming community learning from the Bible and serving with compassion.",
    visible: true,
  },
  coreValues: [
    { title: "Scripture", description: "The Bible is the foundation for faith and life.", order: 0, visible: true },
    { title: "Christ", description: "Jesus is the center of our faith, worship, and hope.", order: 1, visible: true },
    { title: "Sabbath", description: "The seventh day is a time for worship, rest, study, and fellowship.", order: 2, visible: true },
    { title: "Service", description: "We follow Jesus by caring for people and serving our community.", order: 3, visible: true },
  ],
  beliefs: [
    { title: "The Bible", description: "The inspired Word of God and foundation for Christian faith.", order: 0, visible: true },
    { title: "The Triune God", description: "One God revealed as Father, Son, and Holy Spirit.", order: 1, visible: true },
    { title: "Jesus Christ", description: "Lord and Savior, fully God and fully man, crucified and risen.", order: 2, visible: true },
    { title: "Salvation", description: "A free gift of grace received through faith in Christ Jesus.", order: 3, visible: true },
    { title: "The Sabbath", description: "The seventh day is a sacred time for worship, rest, Bible study, and fellowship.", order: 4, visible: true },
    { title: "The Second Coming", description: "The return of Jesus is the blessed hope of the Christian church.", order: 5, visible: true },
  ],
  socialLinks: [],
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
