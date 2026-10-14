import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  MapPin,
  Quote,
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
} from "@/lib/content/services";

export const metadata: Metadata = {
  title: "Welcome",
  description: "Discover church life, worship, community, and ways to connect.",
  alternates: { canonical: "/" },
};

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
      <h2 className={`section-heading mt-4 font-bold ${light ? "text-white" : "text-text"}`}>
        {title}
      </h2>
      {description && <p className={`mt-4 max-w-xl text-base leading-7 sm:text-lg ${light ? "text-white/75" : "text-muted"}`}>{description}</p>}
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
  const churchName = websiteSettings?.churchName ?? "";
  const churchDescription = websiteSettings?.churchDescription ?? "";
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
  const publishedMinistries = ministries ?? [];
  const ministrySelection = homepage.sections.ministries.featuredMinistryIds ?? [];
  const chosenMinistries = ministrySelection.length
    ? publishedMinistries.filter((item) => ministrySelection.includes(item.id))
    : publishedMinistries.slice(0, 6);
  const allPublicSermons = (sermons ?? []).filter((item) => item.status === "published" || !item.status);
  const publicSermons = allPublicSermons.slice(0, homepage.sections.sermons.limit ?? 3);
  const allPublicEvents = (events ?? [])
    .filter((item) => item.status === "published" || !item.status)
    .filter((item) => Date.parse(item.date) >= new Date(new Date().toDateString()).getTime());
  const publicEvents = allPublicEvents.slice(0, homepage.sections.events.limit ?? 3);
  const publicServices = sortServices((services?.items ?? []).map(toChurchService));
  const allPublicAnnouncements = announcements?.items ?? [];
  const publicAnnouncements = allPublicAnnouncements.slice(0, homepage.sections.announcements.limit ?? 3);
  const publicTestimonials = (testimonials?.items ?? [])
    .filter((item) => item.details?.consentApproved === true)
    .slice(0, homepage.sections.testimonials.limit ?? 3);

  const galleryImages: GalleryImage[] = [];
  const seenImages = new Set<string>();
  function addGalleryImage(src: unknown, alt: string, label: string, href: string) {
    if (typeof src !== "string" || !src.trim() || seenImages.has(src)) return;
    seenImages.add(src);
    galleryImages.push({ src, alt, label, href });
  }
  addGalleryImage(homepage.sections.welcome.imageUrl, homepage.sections.welcome.imageAlt || "Church community", "Welcome", "/about/our-story");
  addGalleryImage(church.profile.imageUrl, church.profile.imageAlt || "Church community", "Our story", "/about/our-story");
  for (const ministry of publishedMinistries) {
    addGalleryImage(ministry.imageUrl, `${ministry.name} ministry`, ministry.name, `/ministries/${ministry.slug}`);
  }
  for (const event of allPublicEvents) {
    addGalleryImage(event.flyerUrl, `${event.name} event`, event.name, `/events/${event.id}`);
  }
  for (const announcement of allPublicAnnouncements) {
    addGalleryImage(announcement.details.imageUrl, `${announcement.title} announcement`, announcement.title, `/announcements/${announcement.slug}`);
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
    ...(services?.pagination?.total || publicServices.length
      ? [{ label: "Published gatherings", value: String(services?.pagination?.total ?? publicServices.length), href: "/services" }]
      : []),
    ...(publishedMinistries.length
      ? [{ label: "Ways to connect", value: String(publishedMinistries.length), href: "/ministries" }]
      : []),
    ...(allPublicEvents.length
      ? [{ label: "Upcoming events", value: String(allPublicEvents.length), href: "/events" }]
      : []),
    ...(location
      ? [{ label: "Our community", value: location, href: "/contact" }]
      : []),
  ];

  const hero = homepage.hero;

  return (
    <main className="overflow-hidden bg-background text-text">
      {hero.visible && (
        <section className="relative isolate flex min-h-[640px] items-center overflow-hidden bg-primary-dark text-white sm:min-h-[700px]">
          <Image
            alt={hero.imageAlt || ""}
            className="object-cover"
            fill
            priority
            sizes="100vw"
            src={hero.imageUrl || heroFallback}
            unoptimized
          />
          <div aria-hidden="true" className="home-hero-overlay absolute inset-0" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-primary-dark/50 via-transparent to-primary-dark/10" />
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
                {churchName || "A community of faith"}
              </p>
              <h1 className="mt-6 whitespace-pre-line font-display text-5xl font-bold leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl">
                {hero.heading || "A place to belong,\na faith to grow."}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
                {hero.description || churchDescription || "Come as you are. Find a welcoming community, grow in faith, and discover ways to serve."}
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                {hero.primaryCtaLabel && (
                  <Link className="button button-secondary min-h-13 px-6" href={hero.primaryCtaHref || "/plan-your-visit"}>
                    {hero.primaryCtaLabel}<ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                )}
                {hero.secondaryCtaLabel && (
                  <Link className="button min-h-13 border-white/55 text-white hover:bg-white/10" href={hero.secondaryCtaHref || "/sermons"}>
                    {hero.secondaryCtaLabel}
                  </Link>
                )}
              </div>
            </div>
            <a aria-label="Explore the homepage" className="absolute bottom-8 right-10 hidden items-center gap-3 text-xs font-semibold uppercase tracking-[.16em] text-white/75 transition-colors hover:text-white lg:inline-flex" href="#welcome">
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

      {sections.map(([key, config]) => {
        if (key === "welcome") {
          return (
            <section className="py-20 sm:py-28" id={key} key={key}>
              <div className={`${container} grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-20`}>
                <div className="relative">
                  {config.imageUrl && (
                    <div className="relative aspect-[4/3] overflow-hidden bg-stone-200">
                      <Image alt={config.imageAlt || "Church community"} className="object-cover" fill sizes="(max-width: 1024px) 100vw, 50vw" src={config.imageUrl} unoptimized />
                    </div>
                  )}
                  {!config.imageUrl && church.profile.imageUrl && (
                    <div className="relative aspect-[4/3] overflow-hidden bg-stone-200">
                      <Image alt={church.profile.imageAlt || "Church community"} className="object-cover" fill sizes="(max-width: 1024px) 100vw, 50vw" src={church.profile.imageUrl} unoptimized />
                    </div>
                  )}
                  <div className="absolute -bottom-5 right-0 hidden bg-secondary px-6 py-5 sm:block">
                    <p className="font-display text-2xl italic">
                      {church.coreValues.filter((value) => value.visible).sort((a, b) => a.order - b.order).slice(0, 3).map((value) => value.title).join(" Â· ") || "Youâ€™re welcome here."}
                    </p>
                  </div>
                </div>
                <div className="lg:py-8">
                  <SectionHeading eyebrow="A warm welcome" title={config.heading || "Room to grow. A community to grow with."} description={config.description} />
                  {(churchDescription || church.profile.history) && (
                    <div className="mt-6 space-y-4 text-base leading-7 text-muted">
                      {churchDescription && <p>{churchDescription}</p>}
                      {church.profile.history && <p>{church.profile.history}</p>}
                    </div>
                  )}
                  {config.primaryCtaLabel && <div className="mt-6"><LinkArrow href={config.primaryCtaHref || "/about/our-story"}>{config.primaryCtaLabel}</LinkArrow></div>}
                </div>
              </div>
            </section>
          );
        }

        if (key === "services") {
          return (
            <section className="bg-surface-strong py-20 sm:py-24" id={key} key={key}>
              <div className={container}>
                <div className="flex flex-wrap items-end justify-between gap-6">
                  <SectionHeading eyebrow="Gather with us" title={config.heading || "There\u2019s a seat for you."} description={config.description} />
                  <LinkArrow href="/services">See all gatherings</LinkArrow>
                </div>
                <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {publicServices.length ? publicServices.slice(0, 6).map((service) => (
                    <FlipCard
                      key={service.id}
                      height="min(280px, 100vw)"
                      front={
                        <article className="flex h-full flex-col bg-surface p-6 sm:p-8">
                          <div className="flex size-10 items-center justify-center rounded-full bg-secondary/20 text-primary"><Clock3 aria-hidden="true" className="size-5" /></div>
                          <h3 className="mt-5 font-display text-2xl">{service.title}</h3>
                          <p className="mt-2 text-sm font-semibold text-primary">{formatServiceDate(service)} <span aria-hidden="true">&middot;</span> {formatServiceTime(service)}</p>
                          {service.location && <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-muted"><MapPin aria-hidden="true" className="mt-1 size-4 shrink-0" />{service.location}</p>}
                        </article>
                      }
                      back={
                        <div className="flex h-full flex-col justify-center bg-primary-dark p-6 sm:p-8">
                          <p className="eyebrow text-secondary">Gathering</p>
                          <h3 className="mt-3 font-display text-xl text-white">{service.title}</h3>
                          <p className="mt-2 text-sm font-semibold text-secondary">{formatServiceDate(service)} &middot; {formatServiceTime(service)}</p>
                          {service.location && <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-white/70"><MapPin aria-hidden="true" className="mt-1 size-4 shrink-0" />{service.location}</p>}
                          {service.description && <p className="mt-4 text-sm leading-6 text-white/60">{service.description}</p>}
                          <Link className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:underline" href="/plan-your-visit">Plan your visit <ArrowUpRight className="size-4" /></Link>
                        </div>
                      }
                    />
                  )) : <p className="bg-surface-strong p-7 text-sm leading-6 text-muted sm:col-span-2 lg:col-span-3">Gathering details will appear here when they are published by the church.</p>}
                </div>

                <div className="mt-8 flex flex-wrap gap-5">
                  <Link className="inline-flex min-h-11 items-center gap-2 button button-primary px-5" href="/plan-your-visit">Plan your visit<ArrowRight aria-hidden="true" className="size-4" /></Link>
                  {location && <span className="inline-flex min-h-11 items-center gap-2 text-sm text-muted"><MapPin aria-hidden="true" className="size-4 text-primary" />{location}</span>}
                </div>
              </div>
            </section>
          );
        }

        if (key === "facts") {
          if (!fastFacts.length) return null;
          return (
            <section className="border-b border-border py-8 sm:py-10" id={key} key={key}>
              <div className={container}>
                {config.description && <p className="mb-5 text-sm leading-6 text-muted">{config.description}</p>}
                <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {fastFacts.map((fact) => (
                    <div className="border-l border-secondary pl-4" key={fact.label}>
                      <dt className="text-xs font-semibold uppercase tracking-[.14em] text-muted">{fact.label}</dt>
                      <dd className="mt-2 font-display text-2xl leading-tight text-text">
                        <Link className="hover:text-primary" href={fact.href}>{fact.value}</Link>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>
          );
        }

        if (key === "about") {
          const values = church.coreValues.filter((value) => value.visible).sort((a, b) => a.order - b.order).slice(0, 3);
          return (
            <section className="bg-primary-dark py-20 text-white sm:py-24" id={key} key={key}>
              <div className={`${container} grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-20`}>
                <div>
                  <SectionHeading eyebrow="What guides us" title={config.heading || "Faith that finds its way into everyday life."} description={config.description} light />
                  {church.mission.visible && church.mission.statement && (
                    <div className="mt-9 border-l-2 border-secondary pl-5">
                      <p className="eyebrow text-secondary">{church.mission.heading || "Our mission"}</p>
                      <p className="mt-3 font-display text-xl leading-8 text-white sm:text-2xl">{church.mission.statement}</p>
                      {church.mission.description && <p className="mt-3 text-sm leading-6 text-white/70">{church.mission.description}</p>}
                    </div>
                  )}
                  {config.primaryCtaLabel && <div className="mt-6"><Link className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-secondary hover:text-secondary" href={config.primaryCtaHref || "/about/our-story"}>{config.primaryCtaLabel}<ArrowUpRight aria-hidden="true" className="size-4" /></Link></div>}
                </div>
                <div className="grid content-center gap-px bg-primary/70 sm:grid-cols-2">
                  {church.vision.visible && church.vision.statement && (
                    <article className="bg-primary-dark p-7 sm:col-span-2 sm:p-9">
                      <p className="eyebrow text-secondary">{church.vision.heading || "Our vision"}</p>
                      <p className="mt-3 max-w-2xl font-display text-2xl leading-9 sm:text-3xl">{church.vision.statement}</p>
                      {church.vision.description && <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">{church.vision.description}</p>}
                    </article>
                  )}
                  {values.map((value) => (
                    <article className="bg-primary-dark p-7" key={`${value.order}-${value.title}`}>
                      <p className="text-xs font-semibold uppercase tracking-[.15em] text-secondary">{value.title}</p>
                      <p className="mt-3 text-sm leading-6 text-white/70">{value.description}</p>
                    </article>
                  ))}
                  {(!church.vision.statement || !church.vision.visible) && values.length === 0 && church.profile.history && (
                    <article className="bg-primary-dark p-7 sm:col-span-2 sm:p-9">
                      <p className="eyebrow text-secondary">Our story</p>
                      <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">{church.profile.history}</p>
                    </article>
                  )}
                </div>
              </div>
            </section>
          );
        }

        if (key === "ministries") {
          return (
            <section className="py-20 sm:py-24" id={key} key={key}>
              <div className={container}>
                <div className="flex flex-wrap items-end justify-between gap-6">
                  <SectionHeading eyebrow="Find your people" title={config.heading || "Thereâ€™s a place to connect."} description={config.description} />
                  <LinkArrow href="/ministries">Explore all ministries</LinkArrow>
                </div>
                <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {chosenMinistries.length ? chosenMinistries.map((ministry) => (
                    <FlipCard
                      key={ministry.id}
                      height="min(380px, 100vw)"
                      front={
                        <div className="flex h-full flex-col bg-white">
                          <div className="relative aspect-[4/3] overflow-hidden bg-stone-200">
                            {ministry.imageUrl ? <Image alt={`${ministry.name} ministry`} className="object-cover" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" src={ministry.imageUrl} unoptimized /> : <div aria-hidden="true" className="grid h-full place-items-center bg-secondary/15 font-display text-4xl text-primary">{ministry.name.slice(0, 1)}</div>}
                          </div>
                          <div className="border-b border-stone-300 py-5 px-4">
                            <div className="flex items-start justify-between gap-4">
                              <div><p className="eyebrow text-primary">Ministry</p><h3 className="mt-2 font-display text-2xl">{ministry.name}</h3></div>
                              <ArrowUpRight aria-hidden="true" className="mt-1 size-5 text-primary" />
                            </div>
                            <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted">{ministry.description}</p>
                          </div>
                        </div>
                      }
                      back={
                        <div className="flex h-full flex-col justify-between bg-primary-dark p-6 sm:p-8">
                          <div>
                            <p className="eyebrow text-secondary">Ministry</p>
                            <h3 className="mt-3 font-display text-2xl text-white">{ministry.name}</h3>
                            <p className="mt-4 text-sm leading-7 text-white/70">{ministry.description}</p>
                          </div>
                          <Link className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:underline" href={`/ministries/${ministry.slug}`}>Explore ministry <ArrowUpRight className="size-4" /></Link>
                        </div>
                      }
                    />
                  )) : <p className="text-sm leading-6 text-muted sm:col-span-2 lg:col-span-3">Published ministry information will appear here as the church adds it.</p>}
                </div>
              </div>
            </section>
          );
        }

        if (key === "events") {
          return (
            <section className="bg-surface-strong py-20 sm:py-24" id={key} key={key}>
              <div className={container}>
                <div className="flex flex-wrap items-end justify-between gap-6">
                  <SectionHeading eyebrow="Life together" title={config.heading || "Coming up in our community."} description={config.description} />
                  <LinkArrow href="/events">View all events</LinkArrow>
                </div>
                {publicEvents.length ? (
                  <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {publicEvents.map((event) => (
                      <FlipCard
                        key={event.id}
                        height="min(380px, 100vw)"
                        front={
                          <article className="flex h-full flex-col bg-white">
                            {event.flyerUrl && <div className="relative aspect-[16/10] shrink-0 bg-stone-200"><Image alt={`${event.name} event`} className="object-cover" fill sizes="(max-width: 768px) 100vw, 33vw" src={event.flyerUrl} unoptimized /></div>}
                            <div className="flex flex-1 flex-col p-6">
                              <p className="eyebrow flex items-center gap-2 text-primary"><CalendarDays aria-hidden="true" className="size-4" />{event.date}{event.time ? ` · ${event.time}` : ""}</p>
                              <h3 className="mt-3 font-display text-2xl">{event.name}</h3>
                              {event.location && <p className="mt-2 text-sm text-muted">{event.location}</p>}
                            </div>
                          </article>
                        }
                        back={
                          <div className="flex h-full flex-col justify-between bg-primary-dark p-6 sm:p-8">
                            <div>
                              <p className="eyebrow flex items-center gap-2 text-secondary"><CalendarDays className="size-4" />{event.date}{event.time ? ` · ${event.time}` : ""}</p>
                              <h3 className="mt-3 font-display text-2xl text-white">{event.name}</h3>
                              {event.location && <p className="mt-3 flex items-start gap-2 text-sm text-white/60"><MapPin className="mt-1 size-4 shrink-0" />{event.location}</p>}
                              {event.description && <p className="mt-4 line-clamp-5 text-sm leading-7 text-white/70">{event.description}</p>}
                            </div>
                            <Link className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:underline" href={`/events/${event.id}`}>View details <ArrowUpRight className="size-4" /></Link>
                          </div>
                        }
                      />
                    ))}
                  </div>
                ) : <p className="mt-9 border-y border-stone-300 py-6 text-sm text-muted">Upcoming events will appear here when they are published.</p>}
              </div>
            </section>
          );
        }

        if (key === "announcements") {
          return (
            <section className="py-20 sm:py-24" id={key} key={key}>
              <div className={container}>
                <div className="flex flex-wrap items-end justify-between gap-6">
                  <SectionHeading eyebrow="Church news" title={config.heading || "A few things to know."} description={config.description} />
                  <LinkArrow href="/announcements">All announcements</LinkArrow>
                </div>
                {publicAnnouncements.length ? (
                  <div className="mt-9 divide-y divide-stone-300 border-y border-stone-300">
                    {publicAnnouncements.map((item) => (
                      <article className="grid gap-4 py-6 sm:grid-cols-[1fr_auto] sm:items-center" key={item.id}>
                        <div>
                          <p className="eyebrow text-primary">{text(item.details.category).replaceAll("_", " ") || "Announcement"}</p>
                          <h3 className="mt-2 font-display text-2xl"><Link className="hover:text-primary" href={`/announcements/${item.slug}`}>{item.title}</Link></h3>
                          {item.description && <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{item.description}</p>}
                        </div>
                        <Link aria-label={`Read ${item.title}`} className="inline-flex size-11 items-center justify-center rounded-full border border-stone-300 text-amber-900 transition-colors hover:bg-amber-100" href={`/announcements/${item.slug}`}><ArrowUpRight aria-hidden="true" className="size-5" /></Link>
                      </article>
                    ))}
                  </div>
                ) : <p className="mt-9 border-y border-stone-300 py-6 text-sm text-muted">Church announcements will appear here when they are published.</p>}
              </div>
            </section>
          );
        }

        if (key === "sermons") {
          return (
            <section className="bg-surface-strong py-20 sm:py-24" id={key} key={key}>
              <div className={container}>
                <div className="flex flex-wrap items-end justify-between gap-6">
                  <SectionHeading eyebrow="Listen and grow" title={config.heading || "Take the message with you."} description={config.description} />
                  <LinkArrow href="/sermons">Browse the sermon library</LinkArrow>
                </div>
                {publicSermons.length ? (
                  <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {publicSermons.map((sermon) => (
                      <FlipCard
                        key={sermon.id}
                        height="min(380px, 100vw)"
                        front={
                          <article className="flex h-full flex-col bg-white">
                            {sermon.thumbnailUrl && <div className="relative aspect-video shrink-0 overflow-hidden bg-stone-200"><Image alt={`${sermon.title} sermon`} className="object-cover" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" src={sermon.thumbnailUrl} unoptimized /></div>}
                            <div className="flex flex-1 flex-col p-6">
                              <p className="eyebrow text-primary">{sermon.category}{sermon.date ? ` · ${sermon.date}` : ""}</p>
                              <h3 className="mt-3 font-display text-2xl">{sermon.title}</h3>
                              <p className="mt-2 text-sm text-muted">{sermon.speakerRef?.name || sermon.speaker}</p>
                            </div>
                          </article>
                        }
                        back={
                          <div className="flex h-full flex-col justify-between bg-primary-dark p-6 sm:p-8">
                            <div>
                              <p className="eyebrow text-secondary">{sermon.category}</p>
                              <h3 className="mt-3 font-display text-xl text-white">{sermon.title}</h3>
                              <p className="mt-2 text-sm text-white/60">{sermon.speakerRef?.name || sermon.speaker}{sermon.scripture ? ` · ${sermon.scripture}` : ""}</p>
                              {sermon.date && <p className="mt-2 text-xs text-white/50">{sermon.date}</p>}
                            </div>
                            <div className="mt-6 flex flex-wrap gap-4">
                              {sermon.audioUrl && <a className="inline-flex items-center gap-1 text-sm font-semibold text-secondary hover:underline" href={sermon.audioUrl} rel="noreferrer" target="_blank">Listen <ArrowUpRight className="size-4" /></a>}
                              {sermon.videoUrl && <a className="inline-flex items-center gap-1 text-sm font-semibold text-secondary hover:underline" href={sermon.videoUrl} rel="noreferrer" target="_blank">Watch <ArrowUpRight className="size-4" /></a>}
                              <Link className="inline-flex items-center gap-1 text-sm font-semibold text-white/60 hover:text-white" href={`/sermons/${sermon.slug}`}>Full sermon <ArrowUpRight className="size-4" /></Link>
                            </div>
                          </div>
                        }
                      />
                    ))}
                  </div>
                ) : <p className="mt-9 border-y border-stone-300 py-6 text-sm text-muted">Published messages will appear here when they are available.</p>}

              </div>
            </section>
          );
        }

        if (key === "testimonials") {
          if (!publicTestimonials.length) return null;
          return (
            <section className="py-20 sm:py-24" id={key} key={key}>
              <div className={container}>
                <SectionHeading eyebrow="Stories from our community" title={config.heading || "Faith lived, shared, and growing."} description={config.description} />
                <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {publicTestimonials.map((item) => (
                    <figure className="flex h-full flex-col border-t-2 border-amber-400 bg-white p-6 sm:p-8" key={item.id}>
                      <Quote aria-hidden="true" className="size-7 text-amber-700" />
                      <blockquote className="mt-5 flex-1 font-display text-xl leading-8 text-stone-800">{item.description}</blockquote>
                      <figcaption className="mt-7 flex items-center gap-3 border-t border-stone-200 pt-5">
                        {typeof item.details.imageUrl === "string" && <Image alt="" className="size-11 rounded-full object-cover" height={44} src={item.details.imageUrl} unoptimized width={44} />}
                        <span><span className="block text-sm font-semibold">{item.title}</span>{typeof item.details.role === "string" && <span className="mt-1 block text-xs text-muted">{item.details.role}</span>}</span>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        if (key === "gallery") {
          if (!gallery.length) return null;
          return (
            <section className="bg-surface-strong py-20 sm:py-24" id={key} key={key}>
              <div className={container}>
                <div className="flex flex-wrap items-end justify-between gap-6">
                  <SectionHeading eyebrow="A glimpse of church life" title={config.heading || "Moments we share."} description={config.description} />
                  <LinkArrow href="/ministries">Find a place to belong</LinkArrow>
                </div>
                <div className="mt-10 grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[220px] sm:grid-cols-3 lg:grid-cols-4">
                  {gallery.map((item, index) => (
                    <Link className={`group relative overflow-hidden bg-border ${index === 0 ? "col-span-2 row-span-2" : ""}`} href={item.href} key={item.src}>
                      <Image alt={item.alt} className="object-cover transition-transform duration-500 group-hover:scale-105" fill sizes={index === 0 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"} src={item.src} unoptimized />
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/80 to-transparent px-4 pb-4 pt-12 text-sm font-semibold text-white">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        if (key === "contact") {
          return (
            <section className="py-20 sm:py-24" id={key} key={key}>
              <div className={`${container} grid overflow-hidden bg-amber-400 lg:grid-cols-[1fr_.8fr]`}>
                <div className="p-7 sm:p-10 lg:p-14">
                  <p className="eyebrow text-amber-950">Your next step</p>
                  <h2 className="mt-4 max-w-xl font-display text-4xl font-bold leading-tight text-text sm:text-5xl">{config.heading || "Come see what community can feel like."}</h2>
                  {config.description && <p className="mt-4 max-w-xl leading-7 text-stone-800">{config.description}</p>}
                  <div className="mt-7 flex flex-wrap gap-3">
                    {config.primaryCtaLabel && <Link className="inline-flex min-h-12 items-center gap-2 bg-stone-950 px-5 text-sm font-semibold text-white hover:bg-stone-800" href={config.primaryCtaHref || "/contact"}>{config.primaryCtaLabel}<ArrowRight aria-hidden="true" className="size-4" /></Link>}
                    {config.secondaryCtaLabel && <Link className="inline-flex min-h-12 items-center border border-stone-950/40 px-5 text-sm font-semibold text-text hover:bg-amber-300" href={config.secondaryCtaHref || "/prayer-request"}>{config.secondaryCtaLabel}</Link>}
                  </div>
                </div>
                <div className="flex flex-col justify-center gap-6 bg-amber-300/70 p-7 sm:p-10 lg:p-12">
                  {(church.contact.address || location) && <p className="flex items-start gap-3 text-sm leading-6 text-stone-800"><MapPin aria-hidden="true" className="mt-1 size-5 shrink-0" /><span>{[church.contact.address, location].filter(Boolean).join(", ")}</span></p>}
                  {church.contact.email && <a className="flex items-center gap-3 break-all text-sm font-semibold text-stone-900 underline decoration-stone-500 underline-offset-4" href={`mailto:${church.contact.email}`}>{church.contact.email}</a>}
                  {church.contact.phone && <a className="flex items-center gap-3 text-sm font-semibold text-stone-900 underline decoration-stone-500 underline-offset-4" href={`tel:${church.contact.phone}`}>{church.contact.phone}</a>}
                  {church.contact.directionsUrl && <a className="inline-flex min-h-11 w-fit items-center gap-2 border-b border-stone-950 pb-1 text-sm font-semibold text-text" href={church.contact.directionsUrl} rel="noreferrer" target="_blank">Get directions<ArrowUpRight aria-hidden="true" className="size-4" /></a>}
                  {!church.contact.address && !location && !church.contact.email && !church.contact.phone && !church.contact.directionsUrl && !church.contact.mapUrl && <p className="text-sm leading-6 text-stone-700">We would be glad to help you plan a visit or answer a question.</p>}
                  {church.contact.mapUrl && <iframe className="h-44 w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={church.contact.mapUrl} title={`Map showing ${church.contact.address || location}`} />}
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
