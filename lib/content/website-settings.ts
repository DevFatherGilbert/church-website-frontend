import { getPublicData } from "@/lib/api/church-api";

export type HomepageSectionKey = "welcome" | "facts" | "services" | "about" | "ministries" | "events" | "announcements" | "sermons" | "testimonials" | "gallery" | "contact";
export type HomepageSection = { visible: boolean; order: number; eyebrow?: string; heading: string; description: string; limit?: number; featuredMinistryIds?: string[]; imageUrl?: string; imageAlt?: string; quote?: string; primaryCtaLabel?: string; primaryCtaHref?: string; secondaryCtaLabel?: string; secondaryCtaHref?: string; visitorGuideHref?: string; worshipFactLabel?: string; ministriesFactLabel?: string; eventsFactLabel?: string; communityFactLabel?: string; communityFactFallback?: string; factLinkLabel?: string; prayerHeading?: string; prayerQuote?: string; prayerAssurance?: string; visitLabel?: string; addressLabel?: string; serviceTimesLabel?: string; phoneLabel?: string; emailLabel?: string; directionsLabel?: string; visitorGuideLabel?: string; socialLinksLabel?: string; mapButtonLabel?: string };
export type HomepageNavigationItem = { label: string; href: string; visible: boolean; order: number };
export type HomepageFooterLink = { label: string; href: string; visible: boolean; order: number };
export type HomepageLinkCard = { id: string; eyebrow: string; title: string; description: string; href: string; cta: string; visible: boolean; order: number };
export type HomepageSettings = {
  contentKey: "homepage";
  hero: { heading: string; description: string; imageUrl: string; imageAlt: string; visible: boolean; primaryCtaLabel: string; primaryCtaHref: string; secondaryCtaLabel: string; secondaryCtaHref: string };
  siteHeader: {
    brandTagline: string;
    serviceSummary: string;
    directionsLabel: string;
    directionsHref: string;
    announcement: { visible: boolean; text: string; ctaLabel: string; href: string };
    primaryCta: { label: string; href: string; visible: boolean };
    navigation: HomepageNavigationItem[];
  };
  siteFooter: {
    tagline: string;
    description: string;
    visitCtaLabel: string;
    visitCtaHref: string;
    prayerCtaLabel: string;
    prayerCtaHref: string;
    contactCtaLabel: string;
    contactCtaHref: string;
    churchColumnTitle: string;
    ministriesColumnTitle: string;
    resourcesColumnTitle: string;
    contactColumnTitle: string;
    serviceTitle: string;
    serviceSummary: string;
    connectLabel: string;
    emptySocialText: string;
    backToTopLabel: string;
    copyrightSuffix: string;
    churchLinks: HomepageFooterLink[];
    ministryLinks: HomepageFooterLink[];
    resourceLinks: HomepageFooterLink[];
    supportLinks: HomepageFooterLink[];
    legalLinks: HomepageFooterLink[];
  };
  audienceCards: HomepageLinkCard[];
  aboutCards: HomepageLinkCard[];
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
    secondaryCtaLabel: "Plan Your Visit",
    secondaryCtaHref: "/plan-your-visit",
  },
  siteHeader: {
    brandTagline: "A community of faith",
    serviceSummary: "Sabbath Worship: Saturdays 9:00 AM – 12:30 PM",
    directionsLabel: "Directions",
    directionsHref: "/contact",
    announcement: {
      visible: true,
      text: "Join us every Sabbath for worship and Bible study.",
      ctaLabel: "Plan Your Visit",
      href: "/plan-your-visit",
    },
    primaryCta: { label: "Plan Your Visit", href: "/plan-your-visit", visible: true },
    navigation: [
      { label: "Home", href: "/", visible: true, order: 0 },
      { label: "About Us", href: "/about", visible: true, order: 1 },
      { label: "Ministries", href: "/ministries", visible: true, order: 2 },
      { label: "Services", href: "/services", visible: true, order: 3 },
      { label: "Sermons", href: "/sermons", visible: true, order: 4 },
      { label: "Events", href: "/events", visible: true, order: 5 },
      { label: "Resources", href: "/resources", visible: true, order: 6 },
      { label: "Contact", href: "/contact", visible: true, order: 7 },
    ],
  },
  siteFooter: {
    tagline: "A Welcoming Community of Faith",
    description: "A Christ-centered church committed to authentic worship, spiritual growth, fellowship, and compassionate community outreach.",
    visitCtaLabel: "Plan Your Visit",
    visitCtaHref: "/plan-your-visit",
    prayerCtaLabel: "Submit Prayer Request",
    prayerCtaHref: "/prayer-request",
    contactCtaLabel: "Contact Us",
    contactCtaHref: "/contact",
    churchColumnTitle: "CHURCH",
    ministriesColumnTitle: "MINISTRIES",
    resourcesColumnTitle: "RESOURCES & SUPPORT",
    contactColumnTitle: "SERVICE & CONTACT",
    serviceTitle: "Sabbath worship",
    serviceSummary: "Saturdays 9:00 AM – 12:30 PM",
    connectLabel: "Connect With Us:",
    emptySocialText: "Social profiles will be added when verified.",
    backToTopLabel: "Back to top",
    copyrightSuffix: "All rights reserved.",
    churchLinks: [
      { label: "About Us", href: "/about", visible: true, order: 0 },
      { label: "Our Story", href: "/about/our-story", visible: true, order: 1 },
      { label: "Mission & Vision", href: "/about/mission-vision", visible: true, order: 2 },
      { label: "Beliefs & Statement of Faith", href: "/about/beliefs", visible: true, order: 3 },
      { label: "Leadership", href: "/about/leadership", visible: true, order: 4 },
    ],
    ministryLinks: [
      { label: "Children's Ministry", href: "/ministries/children", visible: true, order: 0 },
      { label: "Youth Ministry", href: "/ministries/youth", visible: true, order: 1 },
      { label: "Women's Ministry", href: "/ministries/women", visible: true, order: 2 },
      { label: "Men's Ministry", href: "/ministries/men", visible: true, order: 3 },
      { label: "Worship & Choir", href: "/ministries/worship", visible: true, order: 4 },
      { label: "Prayer Ministry", href: "/ministries/prayer", visible: true, order: 5 },
      { label: "Outreach & Service", href: "/ministries/outreach", visible: true, order: 6 },
    ],
    resourceLinks: [
      { label: "Sermons & Media", href: "/sermons", visible: true, order: 0 },
      { label: "Upcoming Events", href: "/events", visible: true, order: 1 },
      { label: "Announcements", href: "/announcements", visible: true, order: 2 },
      { label: "Bible Study Resources", href: "/resources", visible: true, order: 3 },
    ],
    supportLinks: [
      { label: "Contact Us", href: "/contact", visible: true, order: 0 },
      { label: "Prayer Request", href: "/prayer-request", visible: true, order: 1 },
      { label: "Frequently Asked Questions", href: "/faqs", visible: true, order: 2 },
      { label: "Plan Your Visit", href: "/plan-your-visit", visible: true, order: 3 },
    ],
    legalLinks: [
      { label: "Privacy Policy", href: "/privacy-policy", visible: true, order: 0 },
      { label: "Terms & Conditions", href: "/terms-and-conditions", visible: true, order: 1 },
      { label: "Cookie Policy", href: "/cookie-policy", visible: true, order: 2 },
    ],
  },
  audienceCards: [
    { id: "visitor", eyebrow: "New here?", title: "First-Time Visitor", description: "Planning your first Sabbath visit? Service times, location & what to expect.", href: "/plan-your-visit", cta: "Plan Your Visit", visible: true, order: 0 },
    { id: "member", eyebrow: "Connect & grow", title: "Church Ministries", description: "Find your church community: children, youth, choir, health & outreach teams.", href: "/ministries", cta: "Explore Ministries", visible: true, order: 1 },
    { id: "sermons", eyebrow: "God's Word", title: "Watch & Listen", description: "Inspiring biblical teachings, Sabbath sermons, live streams & podcast audio.", href: "/sermons", cta: "Browse Sermons", visible: true, order: 2 },
    { id: "prayer", eyebrow: "Pastoral support", title: "Prayer & Care", description: "Need prayer or pastoral counsel? Our intercessory team prays for every request.", href: "/prayer-request", cta: "Request Prayer", visible: true, order: 3 },
  ],
  aboutCards: [
    { id: "story", eyebrow: "Our story", title: "Our Story & Heritage", description: "Learn how God planted our church and the journey of faith that shapes who we are today.", href: "/about/our-story", cta: "Read our story", visible: true, order: 0 },
    { id: "beliefs", eyebrow: "Beliefs", title: "Statement of Faith", description: "Explore our biblical beliefs regarding God, Scripture, salvation, and the Christian walk.", href: "/about/beliefs", cta: "Explore our beliefs", visible: true, order: 1 },
    { id: "leadership", eyebrow: "Leadership", title: "Church Leadership", description: "Meet the pastoral and ministry leaders devoted to serving our congregation with grace.", href: "/about/leadership", cta: "Meet our team", visible: true, order: 2 },
  ],
  sections: {
    welcome: {
      visible: true,
      order: 0,
      eyebrow: "Welcome to",
      heading: "A place to worship, learn, and serve",
      description: "Discover a Christ-centered community shaped by Scripture, Sabbath worship, prayer, and practical care for others.",
      imageUrl: "",
      imageAlt: "Church community gathering",
      quote: "Come as you are — there’s a place for you.",
      primaryCtaLabel: "What we believe",
      primaryCtaHref: "/about/beliefs",
      secondaryCtaLabel: "Plan Your Visit",
      secondaryCtaHref: "/plan-your-visit",
    },
    facts: { visible: true, order: 1, eyebrow: "More About Us", heading: "Fast Facts", description: "Key pillars of our community life, gathering times, and active ministries serving Kigali and beyond.", worshipFactLabel: "Worship Gatherings", ministriesFactLabel: "Ministries to Connect", eventsFactLabel: "Upcoming Events", communityFactLabel: "Our Community", communityFactFallback: "A place to belong", factLinkLabel: "Learn more" },
    services: {
      visible: true,
      order: 2,
      eyebrow: "Gather With Us",
      heading: "Gather on the Sabbath",
      description: "The seventh-day Sabbath is a time for worship, rest, Bible study, and fellowship. Ask the local congregation to confirm current meeting details.",
      primaryCtaLabel: "Plan Your Visit",
      primaryCtaHref: "/plan-your-visit",
    },
    about: {
      visible: true,
      order: 3,
      eyebrow: "Who We Are",
      heading: "Faith grounded in Scripture",
      description: "Seventh-day Adventists look to the Bible as the foundation for faith and follow Jesus with hope in His promised return.",
      primaryCtaLabel: "Read our beliefs",
      primaryCtaHref: "/about/beliefs",
    },
    ministries: {
      visible: true,
      order: 4,
      eyebrow: "Find Your Place",
      heading: "Grow and serve together",
      description: "Find ways to learn Scripture, support families, encourage young people, worship, and care for neighbors.",
      featuredMinistryIds: [],
      primaryCtaLabel: "Explore all ministries",
      primaryCtaHref: "/ministries",
    },
    events: {
      visible: true,
      order: 5,
      eyebrow: "Community Life",
      heading: "Upcoming Events",
      description: "Explore upcoming gatherings, conferences, and community fellowship opportunities.",
      limit: 3,
      primaryCtaLabel: "View all events calendar",
      primaryCtaHref: "/events",
    },
    sermons: {
      visible: true,
      order: 6,
      eyebrow: "God's Word",
      heading: "Latest Sermons",
      description: "Watch or listen to life-giving messages and teachings from God's Word.",
      limit: 3,
      primaryCtaLabel: "Browse sermon library",
      primaryCtaHref: "/sermons",
    },
    announcements: {
      visible: true,
      order: 7,
      eyebrow: "Church Notices",
      heading: "Church Announcements",
      description: "Stay informed with important updates, ministry notices, and community news.",
      limit: 3,
      primaryCtaLabel: "All announcements",
      primaryCtaHref: "/announcements",
    },
    testimonials: {
      visible: true,
      order: 8,
      eyebrow: "Community Stories",
      heading: "Stories From Our Community",
      description: "Real testimonies of faith, transformation, and God's work in people's lives.",
      limit: 3,
    },
    gallery: {
      visible: true,
      order: 9,
      eyebrow: "Church Life",
      heading: "Church Life & Moments",
      description: "A glimpse of our vibrant community in worship, fellowship, and service.",
      limit: 6,
      primaryCtaLabel: "Find a place to connect",
      primaryCtaHref: "/ministries",
    },
    contact: {
      visible: true,
      order: 10,
      eyebrow: "Connect With Us",
      heading: "Join Us for Sabbath Worship",
      description: "Contact the local congregation for its verified address, service time, and visit information.",
      primaryCtaLabel: "Submit a Prayer Request",
      primaryCtaHref: "/prayer-request",
      secondaryCtaLabel: "Contact Pastoral Care",
      secondaryCtaHref: "/contact",
      prayerHeading: "Need Prayer? We Are Here For You.",
      prayerQuote: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. (Philippians 4:6)",
      prayerAssurance: "Our pastoral prayer team prays over every request received. All submissions are held in strict confidence and handled with heartfelt care.",
      visitLabel: "Visit Our Church",
      addressLabel: "Physical Address",
      serviceTimesLabel: "Service Times",
      phoneLabel: "Church Office Phone",
      emailLabel: "Email Address",
      directionsLabel: "Get Directions",
      visitorGuideLabel: "Visitor Guide",
      visitorGuideHref: "/plan-your-visit",
      socialLinksLabel: "Follow & Connect Online:",
      mapButtonLabel: "Open in Google Maps",
    },
  },
};

export const defaultChurchInformation: ChurchInformation = {
  contentKey: "church-information",
  profile: {
    history: "A Seventh-day Adventist faith community centered on Scripture, Jesus Christ, Sabbath worship, spiritual growth, fellowship, and service.",
    imageUrl: "",
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

function mergeHomepageSettings(details?: Record<string, unknown> | null): HomepageSettings {
  const safeDetails = asObject(details);
  const sectionValues = asObject(safeDetails.sections);
  const sections = {} as HomepageSettings["sections"];
  for (const key of Object.keys(defaultHomepageSettings.sections) as HomepageSectionKey[]) {
    sections[key] = {
      ...defaultHomepageSettings.sections[key],
      ...asObject(sectionValues[key]),
    } as HomepageSection;
  }
  return {
    ...defaultHomepageSettings,
    ...safeDetails,
    contentKey: "homepage",
    hero: { ...defaultHomepageSettings.hero, ...asObject(safeDetails.hero) } as HomepageSettings["hero"],
    siteHeader: {
      ...defaultHomepageSettings.siteHeader,
      ...asObject(safeDetails.siteHeader),
      announcement: { ...defaultHomepageSettings.siteHeader.announcement, ...asObject(asObject(safeDetails.siteHeader).announcement) },
      primaryCta: { ...defaultHomepageSettings.siteHeader.primaryCta, ...asObject(asObject(safeDetails.siteHeader).primaryCta) },
      navigation: Array.isArray(asObject(safeDetails.siteHeader).navigation)
        ? asObject(safeDetails.siteHeader).navigation as HomepageNavigationItem[]
        : defaultHomepageSettings.siteHeader.navigation,
    } as HomepageSettings["siteHeader"],
    siteFooter: {
      ...defaultHomepageSettings.siteFooter,
      ...asObject(safeDetails.siteFooter),
      churchLinks: Array.isArray(asObject(safeDetails.siteFooter).churchLinks) ? asObject(safeDetails.siteFooter).churchLinks as HomepageFooterLink[] : defaultHomepageSettings.siteFooter.churchLinks,
      ministryLinks: Array.isArray(asObject(safeDetails.siteFooter).ministryLinks) ? asObject(safeDetails.siteFooter).ministryLinks as HomepageFooterLink[] : defaultHomepageSettings.siteFooter.ministryLinks,
      resourceLinks: Array.isArray(asObject(safeDetails.siteFooter).resourceLinks) ? asObject(safeDetails.siteFooter).resourceLinks as HomepageFooterLink[] : defaultHomepageSettings.siteFooter.resourceLinks,
      supportLinks: Array.isArray(asObject(safeDetails.siteFooter).supportLinks) ? asObject(safeDetails.siteFooter).supportLinks as HomepageFooterLink[] : defaultHomepageSettings.siteFooter.supportLinks,
      legalLinks: Array.isArray(asObject(safeDetails.siteFooter).legalLinks) ? asObject(safeDetails.siteFooter).legalLinks as HomepageFooterLink[] : defaultHomepageSettings.siteFooter.legalLinks,
    } as HomepageSettings["siteFooter"],
    audienceCards: Array.isArray(safeDetails.audienceCards) ? safeDetails.audienceCards as HomepageLinkCard[] : defaultHomepageSettings.audienceCards,
    aboutCards: Array.isArray(safeDetails.aboutCards) ? safeDetails.aboutCards as HomepageLinkCard[] : defaultHomepageSettings.aboutCards,
    sections,
  };
}

function mergeChurchInformation(details?: Record<string, unknown> | null): ChurchInformation {
  const safeDetails = asObject(details);
  const legacyContact = {
    city: safeDetails.city,
    country: safeDetails.country,
    address: safeDetails.address,
    phone: safeDetails.publicPhone,
    email: safeDetails.publicEmail,
  };
  return {
    ...defaultChurchInformation,
    ...safeDetails,
    contentKey: "church-information",
    contact: {
      ...defaultChurchInformation.contact,
      ...legacyContact,
      ...asObject(safeDetails.contact),
    } as ChurchInformation["contact"],
    profile: {
      ...defaultChurchInformation.profile,
      ...asObject(safeDetails.profile),
    } as ChurchInformation["profile"],
    mission: {
      ...defaultChurchInformation.mission,
      ...asObject(safeDetails.mission),
    } as ChurchInformation["mission"],
    vision: {
      ...defaultChurchInformation.vision,
      ...asObject(safeDetails.vision),
    } as ChurchInformation["vision"],
    coreValues: Array.isArray(safeDetails.coreValues)
      ? safeDetails.coreValues as ChurchInformation["coreValues"]
      : defaultChurchInformation.coreValues,
    beliefs: Array.isArray(safeDetails.beliefs)
      ? safeDetails.beliefs as ChurchInformation["beliefs"]
      : defaultChurchInformation.beliefs,
    socialLinks: Array.isArray(safeDetails.socialLinks)
      ? safeDetails.socialLinks as ChurchInformation["socialLinks"]
      : defaultChurchInformation.socialLinks,
  };
}

export async function getPublicWebsiteSettings() {
  const result = await getPublicData<{ items: WebsiteSettingRecord[] }>("/content/settings?limit=100").catch(() => null);
  const items = result?.items ?? [];
  const homepage = items.find((item) => item.details?.contentKey === "homepage");
  const church = items.find((item) => item.details?.contentKey === "church-information") ?? items.find((item) => !item.details?.contentKey);
  const mergedChurch = church ? mergeChurchInformation(church.details) : defaultChurchInformation;
  const rawChurchName = church?.title?.trim() || ((church?.details?.profile as Record<string, unknown> | undefined)?.name as string)?.trim();
  const churchName = rawChurchName || "Seventh-day Adventist Fellowship";

  return {
    backendAvailable: result !== null,
    homepage: homepage ? mergeHomepageSettings(homepage.details) : defaultHomepageSettings,
    church: mergedChurch,
    churchRecord: church ?? null,
    homepageRecord: homepage ?? null,
    churchName,
    churchDescription: church?.description?.trim() || "",
  };
}

