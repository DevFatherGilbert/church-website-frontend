import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Clock3,
  Heart,
  Mail,
  MapPin,
  Phone,
  Play,
  Quote,
  Sparkles,
  Users,
  Volume2,
} from "lucide-react";
import { FlipCard } from "@/components/ui/flip-card";
import {
  getPublicData,
  type ChurchEvent,
  type Ministry,
  type PublicContent,
  type Sermon,
} from "@/lib/api/church-api";
import {
  getPublicWebsiteSettings,
  defaultChurchInformation,
  defaultHomepageSettings,
  type HomepageSection,
  type HomepageSectionKey,
} from "@/lib/content/website-settings";
import {
  formatServiceDate,
  formatServiceTime,
  sortServices,
  toChurchService,
  type ChurchService,
} from "@/lib/content/services";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicWebsiteSettings().catch(() => null);
  const churchName = settings?.churchName || "Faith Community Church";
  const title = `${churchName} | Faith, Worship & Community`;
  const description =
    settings?.churchDescription ||
    settings?.church?.profile?.history?.slice(0, 160) ||
    "A welcoming community committed to faith, worship, fellowship, service and sharing the message of Christ.";

  const heroImage = settings?.homepage?.hero?.imageUrl || settings?.church?.profile?.imageUrl;

  return {
    title,
    description,
    alternates: { canonical: "/" },
    openGraph: {
      title,
      description,
      type: "website",
      images: heroImage ? [{ url: heroImage, alt: churchName }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

type Testimonial = PublicContent;
type Leader = PublicContent;
type GalleryImage = { src: string; alt: string; label: string; href: string };

const heroFallback = "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=2200&q=85";
const container = "mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10";

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function SectionHeading({
  eyebrow,
  title,
  description,
  light = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  light?: boolean;
}) {
  return (
    <header className="max-w-2xl">
      <p className={`eyebrow ${light ? "text-secondary" : "text-primary"}`}>{eyebrow}</p>
      <h2 className={`section-heading mt-3 font-bold ${light ? "text-white" : "text-text"}`}>
        {title}
      </h2>
      {description && (
        <p className={`mt-4 max-w-xl text-base leading-7 sm:text-lg ${light ? "text-white/75" : "text-muted"}`}>
          {description}
        </p>
      )}
    </header>
  );
}

function LinkArrow({ children, href }: { children: string; href: string }) {
  return (
    <Link className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary-hover" href={href}>
      {children}<ArrowUpRight aria-hidden="true" className="size-4" />
    </Link>
  );
}

/* ── Fallback datasets matching SRS Section 12, 19, 27, 30, 34 ── */
const defaultServices: ChurchService[] = [
  {
    id: "svc-1",
    title: "Sunday Worship",
    scheduleType: "weekly",
    dayOfWeek: 0,
    serviceDate: null,
    startTime: "09:00",
    endTime: "10:15",
    location: "Main Sanctuary",
    serviceType: "Worship service",
    description: "An inspiring morning worship service with heartfelt praise, prayer, and life-changing biblical preaching.",
    targetAudience: "All are welcome",
    instructions: "Children's Sunday school available during service.",
    active: true,
    displayOrder: 1,
    publicationStatus: "published",
  },
  {
    id: "svc-2",
    title: "Main Worship Service",
    scheduleType: "weekly",
    dayOfWeek: 0,
    serviceDate: null,
    startTime: "10:30",
    endTime: "12:15",
    location: "Main Sanctuary & Livestream",
    serviceType: "Worship service",
    description: "Our main celebratory gathering with uplifting worship, choir ministrations, and an empowering message.",
    targetAudience: "Families & visitors",
    instructions: "First-time guests are invited to the Welcome Lounge afterwards.",
    active: true,
    displayOrder: 2,
    publicationStatus: "published",
  },
  {
    id: "svc-3",
    title: "Midweek Bible Study & Prayer",
    scheduleType: "weekly",
    dayOfWeek: 3,
    serviceDate: null,
    startTime: "18:00",
    endTime: "19:30",
    location: "Fellowship Hall",
    serviceType: "Bible study",
    description: "In-depth verse-by-verse scripture study, fellowship discussions, and targeted congregational prayer.",
    targetAudience: "Adults, youth & young adults",
    instructions: "Study materials provided at the entrance.",
    active: true,
    displayOrder: 3,
    publicationStatus: "published",
  },
];

const defaultMinistries: Ministry[] = [
  {
    id: "min-children",
    name: "Children's Ministry",
    slug: "children",
    description: "Nurturing faith in young hearts through joyful Bible lessons, Sunday school, songs, and fun activities in a safe environment.",
    targetAudience: "Ages 2–12",
    meetingSchedule: "Sundays at 9:00 AM & 10:30 AM",
    imageUrl: "https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?auto=format&fit=crop&w=800&q=80",
    status: "published",
  },
  {
    id: "min-youth",
    name: "Youth Ministry",
    slug: "youth",
    description: "Empowering teenagers to live boldly for Christ through energetic fellowship, youth camps, discipleship, and community outreach.",
    targetAudience: "Ages 13–18",
    meetingSchedule: "Saturdays at 4:00 PM",
    imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80",
    status: "published",
  },
  {
    id: "min-women",
    name: "Women's Ministry",
    slug: "women",
    description: "Encouraging and uplifting women through monthly prayer circles, Bible studies, annual conferences, and heartfelt sisterhood.",
    targetAudience: "All women",
    meetingSchedule: "Bi-weekly Saturdays at 9:00 AM",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
    status: "published",
  },
  {
    id: "min-men",
    name: "Men's Ministry",
    slug: "men",
    description: "Equipping men of God to lead with integrity, faith, and purpose in their families, workplaces, and community.",
    targetAudience: "All men",
    meetingSchedule: "Monthly Men's Breakfast & Prayer",
    imageUrl: "https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?auto=format&fit=crop&w=800&q=80",
    status: "published",
  },
  {
    id: "min-worship",
    name: "Worship Ministry",
    slug: "worship",
    description: "Leading the church family in vibrant, spirit-filled worship and praise through choir, band, and creative arts.",
    targetAudience: "Vocalists & musicians",
    meetingSchedule: "Rehearsals Thursdays at 6:30 PM",
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
    status: "published",
  },
  {
    id: "min-outreach",
    name: "Outreach & Compassion",
    slug: "outreach",
    description: "Extending the love and hands of Jesus Christ to our city through food distribution, hospital visits, and community support.",
    targetAudience: "All church volunteers",
    meetingSchedule: "Monthly Community Service",
    imageUrl: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=800&q=80",
    status: "published",
  },
];

const defaultEvents: ChurchEvent[] = [
  {
    id: "evt-1",
    name: "Annual Worship Conference",
    date: "2026-10-20",
    time: "09:00 AM",
    endTime: "04:00 PM",
    location: "Main Church Auditorium",
    description: "Join pastors, worship leaders, and believers for an uplifting day of deep praise, spiritual renewal, and biblical ministry.",
    flyerUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80",
    organizer: "Worship Ministry",
    speaker: "Pastor John Doe",
    registrationRequired: true,
    status: "published",
  },
  {
    id: "evt-2",
    name: "Community Outreach & Family Day",
    date: "2026-10-28",
    time: "10:00 AM",
    endTime: "02:00 PM",
    location: "Church Grounds & Park",
    description: "A fun-filled day of games, free medical screenings, food hampers, and sharing the love of Christ with our neighbors.",
    flyerUrl: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1000&q=80",
    organizer: "Outreach Ministry",
    registrationRequired: false,
    status: "published",
  },
  {
    id: "evt-3",
    name: "Night of Prayer & Revival",
    date: "2026-11-06",
    time: "07:00 PM",
    endTime: "10:00 PM",
    location: "Main Sanctuary",
    description: "An evening dedicated to fervent prayer, intercession for families and our nation, and encountering God's transforming presence.",
    flyerUrl: "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1000&q=80",
    organizer: "Prayer Ministry",
    registrationRequired: false,
    status: "published",
  },
];

const defaultSermons: Sermon[] = [
  {
    id: "sermon-1",
    title: "Walking in Faith",
    slug: "walking-in-faith",
    speaker: "Pastor John Doe",
    date: "15 September 2026",
    scripture: "Hebrews 11:1",
    category: "Faith",
    series: "Unshakable Faith",
    description: "A powerful message on learning to trust God's promises completely, even when facing uncertain seasons in life.",
    thumbnailUrl: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=800&q=80",
    audioUrl: "https://example.com/audio/walking-in-faith.mp3",
    videoUrl: "https://youtube.com",
    status: "published",
  },
  {
    id: "sermon-2",
    title: "The Power of Compassion",
    slug: "the-power-of-compassion",
    speaker: "Pastor Sarah Doe",
    date: "08 September 2026",
    scripture: "Colossians 3:12-14",
    category: "Love & Service",
    series: "Love in Action",
    description: "Discover how Christ calls us to clothe ourselves with compassion, kindness, humility, and patience every single day.",
    thumbnailUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
    audioUrl: "https://example.com/audio/power-of-compassion.mp3",
    videoUrl: "https://youtube.com",
    status: "published",
  },
  {
    id: "sermon-3",
    title: "Anchored in Prayer",
    slug: "anchored-in-prayer",
    speaker: "Pastor John Doe",
    date: "01 September 2026",
    scripture: "Philippians 4:6-7",
    category: "Prayer",
    series: "Devoted Life",
    description: "How to experience the supernatural peace of God that guards our hearts and minds through continuous, thankful prayer.",
    thumbnailUrl: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&w=800&q=80",
    audioUrl: "https://example.com/audio/anchored-in-prayer.mp3",
    videoUrl: "https://youtube.com",
    status: "published",
  },
];

const defaultAnnouncements: PublicContent[] = [
  {
    id: "ann-1",
    title: "Sunday Service Schedule & Welcome Lounge",
    slug: "sunday-service-schedule-welcome-lounge",
    description: "All first-time visitors are warmly invited to join our pastoral team for refreshments in the Welcome Lounge immediately following both morning services.",
    details: { category: "Church Life", publishedAt: "2026-10-12" },
    publishedAt: "2026-10-12",
  },
  {
    id: "ann-2",
    title: "Midweek Bible Study Series Commencing This Wednesday",
    slug: "midweek-bible-study-series",
    description: "We begin an exciting 6-week teaching journey through the Book of Romans. Free study guides and childcare provided.",
    details: { category: "Bible Study", publishedAt: "2026-10-10" },
    publishedAt: "2026-10-10",
  },
  {
    id: "ann-3",
    title: "New Volunteer Opportunities in Children's & Media Ministries",
    slug: "volunteer-opportunities",
    description: "Looking to serve? Orientation and training for new volunteers in the AV production team and Sunday school will take place this Saturday morning.",
    details: { category: "Ministry", publishedAt: "2026-10-08" },
    publishedAt: "2026-10-08",
  },
];

export default async function HomeView() {
  const [
    websiteSettings,
    eventResponse,
    sermonResponse,
    announcementResponse,
    serviceResponse,
    ministryResponse,
    testimonialResponse,
    leaderResponse,
  ] = await Promise.all([
    getPublicWebsiteSettings().catch(() => null),
    getPublicData<ChurchEvent[]>("/events").catch(() => null),
    getPublicData<Sermon[]>("/sermons").catch(() => null),
    getPublicData<{ items: PublicContent[] }>("/content/announcements?limit=100").catch(() => null),
    getPublicData<{ items: PublicContent[]; pagination?: { total: number } }>("/content/services?limit=100").catch(() => null),
    getPublicData<Ministry[]>("/ministries").catch(() => null),
    getPublicData<{ items: Testimonial[] }>("/content/testimonials?limit=12").catch(() => null),
    getPublicData<{ items: Leader[] }>("/content/leaders?limit=100").catch(() => null),
  ]);

  const homepage = websiteSettings?.homepage ?? defaultHomepageSettings;
  const church = websiteSettings?.church ?? defaultChurchInformation;
  const churchName = websiteSettings?.churchName || "Faith Community Church";
  const churchDescription = websiteSettings?.churchDescription || "";
  const events = eventResponse ?? [];
  const sermons = sermonResponse ?? [];
  const announcements = announcementResponse;
  const services = serviceResponse;
  const ministries = ministryResponse ?? [];
  const testimonials = testimonialResponse;
  const leaders = leaderResponse;

  const sections = (Object.keys(homepage.sections) as HomepageSectionKey[])
    .map((key) => [key, homepage.sections[key]] as [HomepageSectionKey, HomepageSection])
    .filter(([, section]) => section.visible)
    .sort((a, b) => a[1].order - b[1].order);

  const firstSectionKey = sections[0]?.[0];
  const heroWaveFill = firstSectionKey === "about"
    ? "hsl(var(--brand-primary-dark))"
    : firstSectionKey && ["services", "events", "sermons", "gallery"].includes(firstSectionKey)
      ? "hsl(var(--surface-alt))"
      : "hsl(var(--background))";

  /* Ministries: use DB records or fallback to SRS defaults */
  const publishedMinistries = (ministries && ministries.length > 0) ? ministries : defaultMinistries;
  const ministrySelection = homepage.sections.ministries.featuredMinistryIds ?? [];
  const chosenMinistries = ministrySelection.length
    ? publishedMinistries.filter((item) => ministrySelection.includes(item.id))
    : publishedMinistries.slice(0, 6);

  /* Sermons: use DB records or fallback to SRS defaults */
  const loadedSermons = (sermons ?? []).filter((item) => item.status === "published" || !item.status);
  const allPublicSermons = loadedSermons.length > 0 ? loadedSermons : defaultSermons;
  const publicSermons = allPublicSermons.slice(0, homepage.sections.sermons.limit ?? 3);

  /* Events: use DB records or fallback to SRS defaults */
  const loadedEvents = (events ?? [])
    .filter((item) => item.status === "published" || !item.status)
    .filter((item) => Date.parse(item.date) >= new Date(new Date().toDateString()).getTime());
  const allPublicEvents = loadedEvents.length > 0 ? loadedEvents : defaultEvents;
  const publicEvents = allPublicEvents.slice(0, homepage.sections.events.limit ?? 3);

  /* Services: use DB records or fallback to SRS Section 12 defaults */
  const loadedServices = sortServices((services?.items ?? []).map(toChurchService));
  const publicServices = loadedServices.length > 0 ? loadedServices : defaultServices;

  /* Announcements: use DB records or fallback to SRS defaults */
  const loadedAnnouncements = announcements?.items ?? [];
  const allPublicAnnouncements = loadedAnnouncements.length > 0 ? loadedAnnouncements : defaultAnnouncements;
  const publicAnnouncements = allPublicAnnouncements.slice(0, homepage.sections.announcements.limit ?? 3);

  /* Testimonials */
  const publicTestimonials = (testimonials?.items ?? [])
    .filter((item) => item.details?.consentApproved === true)
    .slice(0, homepage.sections.testimonials.limit ?? 3);

  /* Gallery items */
  const galleryImages: GalleryImage[] = [];
  const seenImages = new Set<string>();
  function addGalleryImage(src: unknown, alt: string, label: string, href: string) {
    if (typeof src !== "string" || !src.trim() || seenImages.has(src)) return;
    seenImages.add(src);
    galleryImages.push({ src, alt, label, href });
  }
  addGalleryImage(homepage.sections.welcome.imageUrl || church.profile.imageUrl, "Church community", "Welcome", "/about/our-story");
  for (const ministry of publishedMinistries) {
    addGalleryImage(ministry.imageUrl, `${ministry.name} ministry`, ministry.name, `/ministries/${ministry.slug}`);
  }
  for (const event of allPublicEvents) {
    addGalleryImage(event.flyerUrl, `${event.name} event`, event.name, `/events/${event.id}`);
  }
  for (const sermon of allPublicSermons) {
    addGalleryImage(sermon.thumbnailUrl, `${sermon.title} sermon`, sermon.title, `/sermons/${sermon.slug}`);
  }
  for (const leader of leaders?.items ?? []) {
    addGalleryImage(leader.details.imageUrl, `${leader.title} portrait`, leader.title, "/about/leadership");
  }
  const gallery = galleryImages.slice(0, homepage.sections.gallery.limit ?? 6);

  const location = [church.contact.city, church.contact.country].filter(Boolean).join(", ");
  const fastFacts = [
    { label: "Worship Gatherings", value: String(publicServices.length), href: "/services" },
    { label: "Ministries to Connect", value: String(publishedMinistries.length), href: "/ministries" },
    { label: "Upcoming Events", value: String(allPublicEvents.length), href: "/events" },
    { label: "Our Community", value: location || "Kigali, Rwanda", href: "/contact" },
  ];

  const hero = homepage.hero;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const churchJsonLd = {
    "@context": "https://schema.org",
    "@type": "Church",
    name: churchName,
    description: churchDescription || church.profile.history || "A welcoming community of faith, worship, and fellowship.",
    ...(siteUrl ? { url: siteUrl } : {}),
    ...(church.profile.imageUrl || hero.imageUrl
      ? { image: church.profile.imageUrl || hero.imageUrl }
      : {}),
    ...(church.contact.address || church.contact.city
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: church.contact.address,
            addressLocality: church.contact.city,
            addressCountry: church.contact.country,
          },
        }
      : {}),
    ...(church.contact.phone ? { telephone: church.contact.phone } : {}),
    ...(church.contact.email ? { email: church.contact.email } : {}),
  };

  return (
    <main className="overflow-hidden bg-background text-text">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(churchJsonLd) }}
      />
      {/* ── 2. HERO SECTION (SRS Section 9 #2 & Section 11) ───────────────── */}
      {hero.visible && (
        <section className="relative isolate flex min-h-[640px] items-center overflow-hidden bg-primary-dark text-white sm:min-h-[720px] lg:min-h-[780px]">
          <Image
            alt={hero.imageAlt || `${churchName} worship gathering`}
            className="object-cover"
            fill
            priority
            sizes="100vw"
            src={hero.imageUrl || heroFallback}
          />
          <div aria-hidden="true" className="home-hero-overlay absolute inset-0" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-primary-dark/80 via-primary-dark/30 to-primary-dark/40" />

          {/* Faith Symbols */}
          <Image aria-hidden="true" alt="" className="scripture-emblem" height={268} src="/bible-cutout.png" width={375} />
          <div aria-hidden="true" className="faith-symbol-orbit">
            <div className="faith-symbol-path">
              <svg className="faith-symbol" fill="none" viewBox="0 0 80 96">
                <circle className="faith-symbol-halo" cx="40" cy="48" r="36" />
                <path d="M34 14h12v21h19v12H46v35H34V47H15V35h19V14Z" fill="#ffe7a3" stroke="#fff9e8" strokeLinejoin="round" strokeWidth="2" />
                <path d="M40 20v57M20 41h40" opacity=".5" stroke="#fffdf5" strokeLinecap="round" strokeWidth="2" />
              </svg>
            </div>
          </div>

          <div className={`${container} relative z-10 pb-24 pt-36 sm:pb-32 sm:pt-44 lg:pt-48`}>
            <div className="max-w-3xl">
              <p className="eyebrow flex items-center gap-3 text-secondary">
                <span aria-hidden="true" className="h-px w-10 bg-secondary" />
                {churchName || "A Community of Faith"}
              </p>

              {/* Proposed Headline from SRS Section 11 */}
              <h1 className="mt-6 whitespace-pre-line font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
                {hero.heading || `Welcome to\n${churchName}`}
              </h1>

              {/* Proposed Supporting Message from SRS Section 11 */}
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/90 sm:text-lg sm:leading-8">
                {hero.description || churchDescription || "A welcoming community committed to faith, worship, fellowship, service and sharing the message of Christ."}
              </p>

              {/* Primary CTA: Plan Your Visit & Secondary CTA: Watch Sermons (SRS Section 11) */}
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  className="button button-secondary min-h-13 px-7 text-sm font-bold uppercase tracking-wider"
                  href={hero.primaryCtaHref || "/plan-your-visit"}
                >
                  {hero.primaryCtaLabel || "Plan Your Visit"}<ArrowRight aria-hidden="true" className="size-4" />
                </Link>

                <Link
                  className="button min-h-13 border-2 border-white/60 bg-white/10 px-6 text-sm font-bold uppercase tracking-wider text-white backdrop-blur-sm transition hover:bg-white/20"
                  href={hero.secondaryCtaHref || "/sermons"}
                >
                  <Play aria-hidden="true" className="size-4 fill-white text-white" />
                  {hero.secondaryCtaLabel || "Watch Sermons"}
                </Link>
              </div>

              {/* Quick service times preview in hero */}
              <div className="mt-10 flex flex-wrap items-center gap-6 border-t border-white/20 pt-6 text-xs text-white/80">
                <span className="flex items-center gap-2">
                  <Clock3 aria-hidden="true" className="size-4 text-secondary" />
                  <span>Sunday Services: <strong>9:00 AM & 10:30 AM</strong></span>
                </span>
                <span className="flex items-center gap-2">
                  <MapPin aria-hidden="true" className="size-4 text-secondary" />
                  <span>{[church.contact.address, location].filter(Boolean).join(", ") || "Main Sanctuary"}</span>
                </span>
              </div>
            </div>

            <a
              aria-label="Explore the homepage"
              className="absolute bottom-8 right-10 hidden items-center gap-3 text-xs font-semibold uppercase tracking-[.16em] text-white/75 transition-colors hover:text-white lg:inline-flex"
              href="#welcome"
            >
              Explore <ArrowDown aria-hidden="true" className="size-4" />
            </a>
          </div>

          <div aria-hidden="true" className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-secondary via-secondary/60 to-transparent" />
          <div aria-hidden="true" className="hero-return-divider absolute bottom-0 left-0 z-[5] h-40 w-full overflow-hidden leading-none sm:h-44 lg:h-52">
            <svg className="absolute inset-0 block h-full w-full" preserveAspectRatio="none" viewBox="0 0 1440 240" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 145C145 184 294 186 453 153C628 117 765 94 920 119C1104 149 1266 191 1440 136V240H0V145Z" fill={heroWaveFill} />
            </svg>
          </div>
        </section>
      )}

      {/* ── SECTIONS (SRS Section 9 items 3 to 13) ────────────────────────── */}
      {sections.map(([key, config]) => {
        /* ── 3. WELCOME MESSAGE (SRS Section 9 #3 & Section 13) ─────────────── */
        if (key === "welcome") {
          return (
            <section className="py-20 sm:py-28" id={key} key={key}>
              <div className={`${container} grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-20`}>
                <div className="relative">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-stone-200 shadow-xl">
                    <Image
                      alt={config.imageAlt || "Church community gathering"}
                      className="object-cover transition-transform duration-700 hover:scale-105"
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      src={config.imageUrl || church.profile.imageUrl || "https://images.unsplash.com/photo-1548625361-195fe61a55c3?auto=format&fit=crop&w=1200&q=80"}
                      unoptimized
                    />
                  </div>
                  <div className="absolute -bottom-5 right-4 hidden rounded-xl bg-secondary px-6 py-4 shadow-lg sm:block">
                    <p className="font-display text-lg font-bold text-stone-950 italic">
                      “Come as you are — there’s a place for you.”
                    </p>
                  </div>
                </div>

                <div className="lg:py-4">
                  <SectionHeading
                    eyebrow="Welcome to Our Church"
                    title={config.heading || "We Are a Community of Faith"}
                    description={
                      config.description ||
                      `${churchName} is a community committed to worship, spiritual growth, fellowship, service and sharing the message of Christ with individuals, families and the wider community.`
                    }
                  />

                  {(churchDescription || church.profile.history) && (
                    <div className="mt-6 space-y-4 text-base leading-7 text-muted">
                      {churchDescription && <p>{churchDescription}</p>}
                      {church.profile.history && <p>{church.profile.history}</p>}
                    </div>
                  )}

                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <Link className="button button-primary min-h-12 px-6" href={config.primaryCtaHref || "/about/our-story"}>
                      {config.primaryCtaLabel || "Our Story & Heart"}<ArrowRight aria-hidden="true" className="size-4" />
                    </Link>
                    <Link className="button button-outline min-h-12 px-6" href="/plan-your-visit">
                      Plan Your Visit
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          );
        }

        /* ── FACTS / AT A GLANCE ─────────────────────────────────────────── */
        if (key === "facts") {
          return (
            <section className="border-y border-border/70 bg-surface py-10" id={key} key={key}>
              <div className={container}>
                <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {fastFacts.map((fact) => (
                    <div className="border-l-2 border-secondary pl-4" key={fact.label}>
                      <dt className="text-xs font-semibold uppercase tracking-[.14em] text-muted">{fact.label}</dt>
                      <dd className="mt-1.5 font-display text-2xl font-bold leading-tight text-text">
                        <Link className="hover:text-primary transition-colors" href={fact.href}>{fact.value}</Link>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>
          );
        }

        /* ── 4. SERVICE SCHEDULE & 5. PRIMARY CTA (SRS Section 9 #4, #5 & Section 12) ── */
        if (key === "services") {
          return (
            <section className="bg-surface-strong py-20 sm:py-24" id={key} key={key}>
              <div className={container}>
                <div className="flex flex-wrap items-end justify-between gap-6">
                  <SectionHeading
                    eyebrow="Gather With Us"
                    title={config.heading || "Regular Church Services"}
                    description={config.description || "We would love to have you join us for worship, teaching, and genuine fellowship this week."}
                  />
                  <LinkArrow href="/services">See all service details</LinkArrow>
                </div>

                <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {publicServices.map((service) => (
                    <FlipCard
                      key={service.id}
                      height="320px"
                      front={
                        <article className="flex h-full flex-col justify-between rounded-xl border border-stone-200/80 bg-white p-7 shadow-sm">
                          <div>
                            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                              <Clock3 aria-hidden="true" className="size-6" />
                            </div>
                            <span className="mt-4 inline-block rounded-full bg-secondary/30 px-3 py-1 text-xs font-bold text-amber-950 uppercase tracking-wider">
                              {service.serviceType || "Worship Gathering"}
                            </span>
                            <h3 className="mt-3 font-display text-2xl font-bold text-text">{service.title}</h3>
                            <p className="mt-2 text-sm font-bold text-primary">
                              {formatServiceDate(service)} <span aria-hidden="true">&middot;</span> {formatServiceTime(service)}
                            </p>
                          </div>

                          <div className="border-t border-stone-100 pt-4">
                            {service.location && (
                              <p className="flex items-center gap-2 text-xs font-medium text-muted">
                                <MapPin aria-hidden="true" className="size-4 shrink-0 text-primary" />
                                {service.location}
                              </p>
                            )}
                            <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-primary">
                              Hover / tap for details &rarr;
                            </p>
                          </div>
                        </article>
                      }
                      back={
                        <div className="flex h-full flex-col justify-between rounded-xl bg-primary-dark p-7 text-white shadow-xl">
                          <div>
                            <span className="eyebrow text-secondary uppercase text-[10px] tracking-widest">
                              {formatServiceDate(service)} &middot; {formatServiceTime(service)}
                            </span>
                            <h3 className="mt-2 font-display text-xl font-bold text-white">{service.title}</h3>
                            {service.description && (
                              <p className="mt-3 text-xs leading-relaxed text-white/80 line-clamp-4">
                                {service.description}
                              </p>
                            )}
                            {service.instructions && (
                              <p className="mt-2 text-[11px] italic text-amber-300">
                                {service.instructions}
                              </p>
                            )}
                          </div>

                          <div className="border-t border-white/20 pt-4">
                            <Link
                              className="inline-flex items-center gap-2 rounded bg-secondary px-4 py-2 text-xs font-bold uppercase tracking-wider text-stone-950 hover:bg-secondary/90 transition"
                              href="/plan-your-visit"
                            >
                              Plan Your Visit <ArrowUpRight className="size-3.5" />
                            </Link>
                          </div>
                        </div>
                      }
                    />
                  ))}
                </div>

                {/* Service Primary CTA Bar */}
                <div className="mt-12 flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-secondary/40 bg-white p-6 shadow-sm sm:p-8">
                  <div className="max-w-xl">
                    <h3 className="font-display text-xl font-bold text-text">First time visiting our church?</h3>
                    <p className="mt-1 text-sm text-muted">
                      Find out where to park, what to expect during worship, and how our children’s ministry cares for your family.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Link className="button button-primary min-h-11 px-6 font-bold" href="/plan-your-visit">
                      Plan Your Visit <ArrowRight aria-hidden="true" className="size-4" />
                    </Link>
                    {church.contact.directionsUrl && (
                      <a
                        className="button button-outline min-h-11 px-5"
                        href={church.contact.directionsUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <MapPin aria-hidden="true" className="size-4 text-primary" />
                        Get Directions
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </section>
          );
        }

        /* ── 6. ABOUT THE CHURCH (SRS Section 9 #6 & Sections 13-18) ───────── */
        if (key === "about") {
          const values = church.coreValues.length > 0
            ? church.coreValues.filter((value) => value.visible).sort((a, b) => a.order - b.order).slice(0, 4)
            : defaultChurchInformation.coreValues.slice(0, 4);

          return (
            <section className="bg-primary-dark py-20 text-white sm:py-24" id={key} key={key}>
              <div className={`${container} space-y-16`}>
                <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
                  <div>
                    <SectionHeading
                      eyebrow="Who We Are"
                      title={config.heading || "About Our Church"}
                      description={config.description || "Rooted in biblical truth, passionate about authentic worship, and dedicated to transforming lives in our community."}
                      light
                    />

                    {/* Mission & Vision from SRS Sections 14 & 15 */}
                    <div className="mt-10 space-y-6">
                      <div className="border-l-4 border-secondary pl-5">
                        <p className="eyebrow text-secondary uppercase tracking-wider text-xs font-bold">
                          {church.mission.heading || "Our Mission"}
                        </p>
                        <p className="mt-2 font-display text-xl leading-snug font-semibold text-white sm:text-2xl">
                          {church.mission.statement || defaultChurchInformation.mission.statement}
                        </p>
                      </div>

                      <div className="border-l-4 border-amber-400/60 pl-5">
                        <p className="eyebrow text-secondary uppercase tracking-wider text-xs font-bold">
                          {church.vision.heading || "Our Vision"}
                        </p>
                        <p className="mt-2 font-display text-xl leading-snug font-semibold text-white sm:text-2xl">
                          {church.vision.statement || defaultChurchInformation.vision.statement}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Core Values (SRS Section 16) */}
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <Sparkles aria-hidden="true" className="size-5 text-secondary" />
                      <h3 className="eyebrow text-secondary uppercase tracking-wider text-xs font-bold">Our Core Values</h3>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {values.map((value) => (
                        <article className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm" key={value.title}>
                          <p className="text-sm font-bold uppercase tracking-wider text-secondary">{value.title}</p>
                          <p className="mt-2 text-xs leading-relaxed text-white/75">{value.description}</p>
                        </article>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sub-pages navigation cards (Beliefs, Leadership, Story) */}
                <div className="grid gap-5 border-t border-white/15 pt-12 sm:grid-cols-3">
                  <Link
                    className="group rounded-xl border border-white/15 bg-white/5 p-6 transition-colors hover:border-secondary hover:bg-white/10"
                    href="/about/our-story"
                  >
                    <BookOpen aria-hidden="true" className="size-6 text-secondary" />
                    <h4 className="mt-4 font-display text-lg font-bold text-white group-hover:text-secondary">Our Story & Heritage</h4>
                    <p className="mt-2 text-xs leading-relaxed text-white/70">
                      Learn how God planted our church and the journey of faith that shapes who we are today.
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-secondary">
                      Read our story &rarr;
                    </span>
                  </Link>

                  <Link
                    className="group rounded-xl border border-white/15 bg-white/5 p-6 transition-colors hover:border-secondary hover:bg-white/10"
                    href="/about/beliefs"
                  >
                    <Heart aria-hidden="true" className="size-6 text-secondary" />
                    <h4 className="mt-4 font-display text-lg font-bold text-white group-hover:text-secondary">Statement of Faith</h4>
                    <p className="mt-2 text-xs leading-relaxed text-white/70">
                      Explore our biblical beliefs regarding God, Scripture, salvation, and the Christian walk.
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-secondary">
                      Explore our beliefs &rarr;
                    </span>
                  </Link>

                  <Link
                    className="group rounded-xl border border-white/15 bg-white/5 p-6 transition-colors hover:border-secondary hover:bg-white/10"
                    href="/about/leadership"
                  >
                    <Users aria-hidden="true" className="size-6 text-secondary" />
                    <h4 className="mt-4 font-display text-lg font-bold text-white group-hover:text-secondary">Church Leadership</h4>
                    <p className="mt-2 text-xs leading-relaxed text-white/70">
                      Meet the pastoral and ministry leaders devoted to serving our congregation with grace.
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-secondary">
                      Meet our team &rarr;
                    </span>
                  </Link>
                </div>
              </div>
            </section>
          );
        }

        /* ── 7. MINISTRIES (SRS Section 9 #7 & Sections 19-25) ──────────────── */
        if (key === "ministries") {
          return (
            <section className="py-20 sm:py-24" id={key} key={key}>
              <div className={container}>
                <div className="flex flex-wrap items-end justify-between gap-6">
                  <SectionHeading
                    eyebrow="Find Your Place"
                    title={config.heading || "Church Ministries"}
                    description={config.description || "Every individual has unique gifts. Discover a ministry where you can grow, belong, and make a meaningful difference."}
                  />
                  <LinkArrow href="/ministries">Explore all ministries</LinkArrow>
                </div>

                <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {chosenMinistries.map((ministry) => (
                    <FlipCard
                      key={ministry.id}
                      height="380px"
                      front={
                        <div className="flex h-full flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
                          <div className="relative aspect-[16/10] overflow-hidden bg-stone-200">
                            {ministry.imageUrl ? (
                              <Image
                                alt={`${ministry.name} ministry`}
                                className="object-cover transition-transform duration-500 hover:scale-105"
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                src={ministry.imageUrl}
                                unoptimized
                              />
                            ) : (
                              <div aria-hidden="true" className="grid h-full place-items-center bg-secondary/20 font-display text-4xl text-primary font-bold">
                                {ministry.name.slice(0, 1)}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-1 flex-col justify-between p-6">
                            <div>
                              <p className="eyebrow text-primary text-[10px] uppercase font-bold tracking-wider">Ministry</p>
                              <h3 className="mt-1 font-display text-2xl font-bold">{ministry.name}</h3>
                              <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-muted">{ministry.description}</p>
                            </div>
                            <span className="text-xs font-semibold text-primary">Hover or tap to learn more &rarr;</span>
                          </div>
                        </div>
                      }
                      back={
                        <div className="flex h-full flex-col justify-between rounded-xl bg-primary-dark p-7 text-white shadow-xl">
                          <div>
                            <p className="eyebrow text-secondary uppercase text-[10px] tracking-wider">Ministry Details</p>
                            <h3 className="mt-2 font-display text-2xl font-bold text-white">{ministry.name}</h3>
                            <p className="mt-4 text-xs leading-relaxed text-white/80 line-clamp-5">{ministry.description}</p>
                            {ministry.meetingSchedule && (
                              <p className="mt-4 text-xs font-semibold text-secondary">
                                Schedule: {ministry.meetingSchedule}
                              </p>
                            )}
                          </div>
                          <Link
                            className="mt-6 inline-flex items-center gap-2 rounded bg-secondary px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-950 hover:bg-secondary/90"
                            href={`/ministries/${ministry.slug}`}
                          >
                            Explore Ministry <ArrowUpRight className="size-4" />
                          </Link>
                        </div>
                      }
                    />
                  ))}
                </div>
              </div>
            </section>
          );
        }

        /* ── 8. UPCOMING EVENTS (SRS Section 9 #8 & Sections 27-28) ─────────── */
        if (key === "events") {
          return (
            <section className="bg-surface-strong py-20 sm:py-24" id={key} key={key}>
              <div className={container}>
                <div className="flex flex-wrap items-end justify-between gap-6">
                  <SectionHeading
                    eyebrow="Community Life"
                    title={config.heading || "Upcoming Church Events"}
                    description={config.description || "Stay connected with upcoming conferences, worship gatherings, prayer vigils, and outreach activities."}
                  />
                  <LinkArrow href="/events">View all events calendar</LinkArrow>
                </div>

                <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {publicEvents.map((event) => (
                    <FlipCard
                      key={event.id}
                      height="380px"
                      front={
                        <article className="flex h-full flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
                          {event.flyerUrl && (
                            <div className="relative aspect-[16/10] shrink-0 bg-stone-200">
                              <Image
                                alt={`${event.name} event flyer`}
                                className="object-cover"
                                fill
                                sizes="(max-width: 768px) 100vw, 33vw"
                                src={event.flyerUrl}
                                unoptimized
                              />
                            </div>
                          )}
                          <div className="flex flex-1 flex-col justify-between p-6">
                            <div>
                              <p className="eyebrow flex items-center gap-1.5 text-primary text-xs font-bold">
                                <CalendarDays aria-hidden="true" className="size-4" />
                                {event.date}{event.time ? ` · ${event.time}` : ""}
                              </p>
                              <h3 className="mt-2 font-display text-2xl font-bold">{event.name}</h3>
                              {event.location && (
                                <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                                  <MapPin aria-hidden="true" className="size-3.5 text-primary shrink-0" />
                                  {event.location}
                                </p>
                              )}
                            </div>
                            <span className="text-xs font-semibold text-primary">Hover or tap for info &rarr;</span>
                          </div>
                        </article>
                      }
                      back={
                        <div className="flex h-full flex-col justify-between rounded-xl bg-primary-dark p-7 text-white shadow-xl">
                          <div>
                            <p className="eyebrow flex items-center gap-1.5 text-secondary text-xs">
                              <CalendarDays className="size-4" />
                              {event.date}{event.time ? ` · ${event.time}` : ""}
                            </p>
                            <h3 className="mt-2 font-display text-2xl font-bold text-white">{event.name}</h3>
                            {event.location && (
                              <p className="mt-2 flex items-center gap-1.5 text-xs text-white/70">
                                <MapPin className="size-3.5 shrink-0 text-secondary" />
                                {event.location}
                              </p>
                            )}
                            {event.description && (
                              <p className="mt-3 text-xs leading-relaxed text-white/80 line-clamp-4">
                                {event.description}
                              </p>
                            )}
                          </div>
                          <Link
                            className="mt-6 inline-flex items-center gap-2 rounded bg-secondary px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-950 hover:bg-secondary/90"
                            href={`/events/${event.id}`}
                          >
                            Event Details <ArrowUpRight className="size-4" />
                          </Link>
                        </div>
                      }
                    />
                  ))}
                </div>
              </div>
            </section>
          );
        }

        /* ── 9. LATEST SERMONS (SRS Section 9 #9 & Sections 30-33) ──────────── */
        if (key === "sermons") {
          return (
            <section className="py-20 sm:py-24" id={key} key={key}>
              <div className={container}>
                <div className="flex flex-wrap items-end justify-between gap-6">
                  <SectionHeading
                    eyebrow="God's Word"
                    title={config.heading || "Latest Sermons & Teachings"}
                    description={config.description || "Listen or watch inspiring messages from our Sunday services and teaching series wherever you are."}
                  />
                  <LinkArrow href="/sermons">Browse sermon library</LinkArrow>
                </div>

                <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {publicSermons.map((sermon) => (
                    <article className="group flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md" key={sermon.id}>
                      <div className="relative aspect-video shrink-0 overflow-hidden bg-stone-900">
                        {sermon.thumbnailUrl ? (
                          <Image
                            alt={`${sermon.title} sermon`}
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            src={sermon.thumbnailUrl}
                            unoptimized
                          />
                        ) : (
                          <div className="grid h-full place-items-center bg-primary-dark text-secondary">
                            <Play className="size-10 fill-secondary" />
                          </div>
                        )}
                        <span className="absolute bottom-3 left-3 rounded bg-stone-950/80 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-sm">
                          {sermon.category || "Message"}
                        </span>
                      </div>

                      <div className="flex flex-1 flex-col justify-between p-6">
                        <div>
                          <p className="text-xs font-semibold text-primary">{sermon.date}</p>
                          <h3 className="mt-1 font-display text-xl font-bold group-hover:text-primary transition-colors">
                            <Link href={`/sermons/${sermon.slug}`}>{sermon.title}</Link>
                          </h3>
                          <p className="mt-1 text-xs font-medium text-stone-600">
                            {sermon.speakerRef?.name || sermon.speaker}
                            {sermon.scripture ? ` · ${sermon.scripture}` : ""}
                          </p>
                          {sermon.description && (
                            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">
                              {sermon.description}
                            </p>
                          )}
                        </div>

                        <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-4">
                          <div className="flex items-center gap-3">
                            {sermon.audioUrl && (
                              <a
                                aria-label={`Listen to ${sermon.title}`}
                                className="inline-flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary transition hover:bg-primary hover:text-white"
                                href={sermon.audioUrl}
                                rel="noreferrer"
                                target="_blank"
                              >
                                <Volume2 className="size-4" />
                              </a>
                            )}
                            {sermon.videoUrl && (
                              <a
                                aria-label={`Watch ${sermon.title}`}
                                className="inline-flex size-8 items-center justify-center rounded-full bg-secondary/40 text-amber-950 transition hover:bg-secondary"
                                href={sermon.videoUrl}
                                rel="noreferrer"
                                target="_blank"
                              >
                                <Play className="size-4 fill-amber-950" />
                              </a>
                            )}
                          </div>
                          <Link
                            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover"
                            href={`/sermons/${sermon.slug}`}
                          >
                            Full Sermon <ArrowUpRight className="size-3.5" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        /* ── 10. LATEST ANNOUNCEMENTS (SRS Section 9 #10 & Section 34) ──────── */
        if (key === "announcements") {
          return (
            <section className="bg-surface-strong py-20 sm:py-24" id={key} key={key}>
              <div className={container}>
                <div className="flex flex-wrap items-end justify-between gap-6">
                  <SectionHeading
                    eyebrow="Church Notices"
                    title={config.heading || "Latest Announcements"}
                    description={config.description || "Important news, upcoming schedule changes, and ministry updates for our church congregation."}
                  />
                  <LinkArrow href="/announcements">All announcements</LinkArrow>
                </div>

                <div className="mt-10 divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white shadow-sm">
                  {publicAnnouncements.map((item) => (
                    <article className="grid gap-4 p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8" key={item.id}>
                      <div>
                        <span className="inline-block rounded-full bg-amber-100 px-3 py-0.5 text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                          {text(item.details.category).replaceAll("_", " ") || "Church Update"}
                        </span>
                        <h3 className="mt-2 font-display text-2xl font-bold">
                          <Link className="hover:text-primary transition-colors" href={`/announcements/${item.slug}`}>
                            {item.title}
                          </Link>
                        </h3>
                        {item.description && (
                          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <Link
                        aria-label={`Read ${item.title}`}
                        className="inline-flex size-11 items-center justify-center rounded-full border border-stone-300 text-stone-700 transition hover:bg-stone-100 hover:text-primary"
                        href={`/announcements/${item.slug}`}
                      >
                        <ArrowUpRight aria-hidden="true" className="size-5" />
                      </Link>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        /* ── TESTIMONIALS (SRS Section 45) ───────────────────────────────── */
        if (key === "testimonials") {
          if (!publicTestimonials.length) return null;
          return (
            <section className="py-20 sm:py-24" id={key} key={key}>
              <div className={container}>
                <SectionHeading
                  eyebrow="Community Stories"
                  title={config.heading || "Faith Lived & Shared"}
                  description={config.description || "Real testimonies of God's love and restoration from members of our faith family."}
                />
                <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {publicTestimonials.map((item) => (
                    <figure className="flex h-full flex-col justify-between rounded-xl border border-stone-200 bg-white p-7 shadow-sm" key={item.id}>
                      <div>
                        <Quote aria-hidden="true" className="size-8 text-secondary" />
                        <blockquote className="mt-4 font-display text-lg leading-relaxed text-stone-800">
                          “{item.description}”
                        </blockquote>
                      </div>
                      <figcaption className="mt-6 flex items-center gap-3 border-t border-stone-100 pt-4">
                        {typeof item.details.imageUrl === "string" && (
                          <Image alt="" className="size-11 rounded-full object-cover" height={44} src={item.details.imageUrl} unoptimized width={44} />
                        )}
                        <div>
                          <span className="block text-sm font-bold text-stone-900">{item.title}</span>
                          {typeof item.details.role === "string" && (
                            <span className="block text-xs text-muted">{item.details.role}</span>
                          )}
                        </div>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        /* ── GALLERY (Church Life) ───────────────────────────────────────── */
        if (key === "gallery") {
          if (!gallery.length) return null;
          return (
            <section className="bg-surface-strong py-20 sm:py-24" id={key} key={key}>
              <div className={container}>
                <div className="flex flex-wrap items-end justify-between gap-6">
                  <SectionHeading
                    eyebrow="Church Life"
                    title={config.heading || "Moments We Share"}
                    description={config.description || "A glimpse into worship, fellowship, outreach, and life together in our church family."}
                  />
                  <LinkArrow href="/ministries">Find a place to connect</LinkArrow>
                </div>
                <div className="mt-12 grid auto-rows-[180px] grid-cols-2 gap-4 sm:auto-rows-[220px] sm:grid-cols-3 lg:grid-cols-4">
                  {gallery.map((item, index) => (
                    <Link
                      className={`group relative overflow-hidden rounded-xl bg-stone-300 shadow-sm ${index === 0 ? "col-span-2 row-span-2" : ""}`}
                      href={item.href}
                      key={item.src}
                    >
                      <Image
                        alt={item.alt}
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        fill
                        sizes={index === 0 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
                        src={item.src}
                        unoptimized
                      />
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/85 via-stone-950/40 to-transparent px-4 pb-4 pt-12 text-sm font-bold text-white">
                        {item.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        /* ── 11. PRAYER / CONTACT CTA & 12. CHURCH LOCATION & 13. SOCIAL LINKS (SRS Section 9 #11, #12, #13 & Sections 36, 41, 42, 55) ── */
        if (key === "contact") {
          return (
            <section className="py-20 sm:py-24" id={key} key={key}>
              <div className={`${container} space-y-12`}>
                {/* 11. Dedicated Prayer Request CTA Banner (SRS Section 36 & 44) */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-dark via-[#1e2f47] to-primary p-8 text-white shadow-xl sm:p-12 lg:p-16">
                  <div className="relative z-10 max-w-2xl">
                    <p className="eyebrow text-secondary uppercase tracking-widest text-xs font-bold">
                      Pastoral Care & Intercession
                    </p>
                    <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                      Need Prayer? We Are Here For You.
                    </h2>
                    <p className="mt-4 text-base leading-relaxed text-white/85 sm:text-lg">
                      “Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.” (Philippians 4:6)
                    </p>
                    <p className="mt-2 text-sm text-white/70">
                      Our pastoral prayer team prays over every request received. All submissions are held in strict confidence and handled with heartfelt care.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-4">
                      <Link
                        className="button button-secondary min-h-12 px-6 font-bold uppercase tracking-wider text-xs"
                        href="/prayer-request"
                      >
                        Submit a Prayer Request <ArrowRight aria-hidden="true" className="size-4" />
                      </Link>
                      <Link
                        className="button border-2 border-white/40 bg-white/10 min-h-12 px-6 font-bold uppercase tracking-wider text-xs text-white hover:bg-white/20"
                        href="/contact"
                      >
                        Contact Pastoral Care
                      </Link>
                    </div>
                  </div>
                </div>

                {/* 12. Church Location, Interactive Map & Directions (SRS Section 41, 42) */}
                <div className="grid overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-lg lg:grid-cols-[1.1fr_1fr]">
                  {/* Left Info Column */}
                  <div className="p-8 sm:p-12 lg:p-14">
                    <p className="eyebrow text-primary uppercase tracking-widest text-xs font-bold">Visit Our Church</p>
                    <h3 className="mt-3 font-display text-3xl font-bold text-text sm:text-4xl">
                      Join Us This Sunday
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted">
                      We warmly invite you, your family, and friends to experience God&apos;s love and community in our worship services.
                    </p>

                    <div className="mt-8 space-y-5 text-sm">
                      <div className="flex items-start gap-3.5">
                        <MapPin aria-hidden="true" className="mt-1 size-5 shrink-0 text-primary" />
                        <div>
                          <strong className="block text-stone-900">Physical Address</strong>
                          <span className="text-muted">{[church.contact.address, location].filter(Boolean).join(", ") || "Main Church Auditorium"}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3.5">
                        <Clock3 aria-hidden="true" className="mt-1 size-5 shrink-0 text-primary" />
                        <div>
                          <strong className="block text-stone-900">Service Times</strong>
                          <span className="text-muted">Sundays: 9:00 AM (Worship) & 10:30 AM (Main Service)</span>
                          <span className="block text-muted">Wednesdays: 6:00 PM (Bible Study & Prayer)</span>
                        </div>
                      </div>

                      {church.contact.phone && (
                        <div className="flex items-center gap-3.5">
                          <Phone aria-hidden="true" className="size-5 shrink-0 text-primary" />
                          <div>
                            <strong className="block text-stone-900">Church Office Phone</strong>
                            <a className="text-primary hover:underline" href={`tel:${church.contact.phone}`}>{church.contact.phone}</a>
                          </div>
                        </div>
                      )}

                      {church.contact.email && (
                        <div className="flex items-center gap-3.5">
                          <Mail aria-hidden="true" className="size-5 shrink-0 text-primary" />
                          <div>
                            <strong className="block text-stone-900">Email Address</strong>
                            <a className="text-primary hover:underline" href={`mailto:${church.contact.email}`}>{church.contact.email}</a>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-stone-100 pt-6">
                      {church.contact.directionsUrl && (
                        <a
                          className="button button-primary min-h-11 px-5 text-xs font-bold uppercase tracking-wider"
                          href={church.contact.directionsUrl}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <MapPin aria-hidden="true" className="size-4" />
                          Get Directions <ArrowUpRight className="size-3.5" />
                        </a>
                      )}
                      <Link className="button button-outline min-h-11 px-5 text-xs font-bold uppercase tracking-wider" href="/plan-your-visit">
                        Visitor Guide
                      </Link>
                    </div>

                    {/* 13. Social Media Links (SRS Section 55) */}
                    <div className="mt-8 border-t border-stone-100 pt-6">
                      <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">Follow & Connect Online:</p>
                      <div className="flex flex-wrap items-center gap-2">
                        {church.socialLinks.filter((s) => s.visible).length > 0 ? (
                          church.socialLinks.filter((s) => s.visible).map((item) => (
                            <a
                              className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-stone-50 px-3.5 py-1.5 text-xs font-semibold text-stone-700 transition hover:border-primary hover:bg-primary/5 hover:text-primary"
                              href={item.url}
                              key={`${item.label}-${item.url}`}
                              rel="noreferrer"
                              target="_blank"
                            >
                              {item.label} <ArrowUpRight className="size-3" />
                            </a>
                          ))
                        ) : (
                          <>
                            <a className="rounded-full border border-stone-300 px-3.5 py-1 text-xs font-semibold text-stone-700 hover:border-primary hover:text-primary" href="https://facebook.com" rel="noreferrer" target="_blank">Facebook ↗</a>
                            <a className="rounded-full border border-stone-300 px-3.5 py-1 text-xs font-semibold text-stone-700 hover:border-primary hover:text-primary" href="https://instagram.com" rel="noreferrer" target="_blank">Instagram ↗</a>
                            <a className="rounded-full border border-stone-300 px-3.5 py-1 text-xs font-semibold text-stone-700 hover:border-primary hover:text-primary" href="https://youtube.com" rel="noreferrer" target="_blank">YouTube ↗</a>
                            <a className="rounded-full border border-stone-300 px-3.5 py-1 text-xs font-semibold text-stone-700 hover:border-primary hover:text-primary" href="https://whatsapp.com" rel="noreferrer" target="_blank">WhatsApp ↗</a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Map Column */}
                  <div className="relative min-h-[360px] bg-stone-200 lg:min-h-full">
                    {church.contact.mapUrl ? (
                      <iframe
                        className="size-full border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        src={church.contact.mapUrl}
                        title={`Location map of ${churchName}`}
                      />
                    ) : (
                      <div className="flex size-full flex-col items-center justify-center bg-stone-100 p-8 text-center">
                        <MapPin className="size-12 text-primary" />
                        <h4 className="mt-4 font-display text-xl font-bold text-stone-900">{churchName}</h4>
                        <p className="mt-1 text-sm text-muted">{[church.contact.address, location].filter(Boolean).join(", ")}</p>
                        {church.contact.directionsUrl && (
                          <a
                            className="button button-primary mt-6 min-h-10 px-5 text-xs font-bold uppercase tracking-wider"
                            href={church.contact.directionsUrl}
                            rel="noreferrer"
                            target="_blank"
                          >
                            Open in Google Maps <ArrowUpRight className="size-3.5" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          );
        }

        return null;
      })}
    </main>
  );
}
