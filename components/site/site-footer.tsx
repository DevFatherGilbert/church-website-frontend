import Link from "next/link";
import { Clock, LogIn, Mail, MapPin, Phone } from "lucide-react";
import { ChurchLogo } from "@/components/brand/church-logo";
import { defaultHomepageSettings, getPublicWebsiteSettings } from "@/lib/content/website-settings";

export async function SiteFooter() {
  const { church, churchRecord, churchName, homepage } = await getPublicWebsiteSettings();
  const footer = homepage.siteFooter ?? defaultHomepageSettings.siteFooter;
  const displayChurchName = churchName || "Seventh-day Adventist Fellowship";
  const location = [church.contact.city, church.contact.country].filter(Boolean).join(" · ");
  const socials = church.socialLinks.filter((item) => item.visible);
  const visibleLinks = (links: typeof footer.churchLinks) => links.filter((item) => item.visible).sort((left, right) => left.order - right.order);
  const churchLinks = visibleLinks(footer.churchLinks);
  const ministryLinks = visibleLinks(footer.ministryLinks);
  const resourceLinks = visibleLinks(footer.resourceLinks);
  const supportLinks = visibleLinks(footer.supportLinks);
  const legalLinks = visibleLinks(footer.legalLinks);

  return (
    <footer className="relative border-t border-white/10 bg-gradient-to-b from-primary-dark via-[hsl(218_100%_10%)] to-[hsl(218_100%_7%)] px-5 pb-8 pt-16 text-slate-300">
      <div className="page-container">
        {/* Top Brand Banner & Visit CTA */}
        <div className="grid gap-8 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 lg:grid-cols-[1.5fr_1fr] lg:items-center backdrop-blur-xs">
          <div>
            <Link
              className="group inline-flex items-center gap-3.5"
              href="/"
              aria-label={`${displayChurchName} home`}
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-white p-1.5 shadow-md transition-transform group-hover:scale-105">
                <ChurchLogo
                  alt={church.profile.logoAlt || displayChurchName}
                  className="size-full object-contain"
                  src={church.profile.logoUrl || "/logo-c.png"}
                />
              </div>
              <div>
                <span className="block font-display text-2xl font-bold tracking-tight text-white transition-colors group-hover:text-secondary">
                  {displayChurchName}
                </span>
                <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
                  {footer.tagline}
                </span>
              </div>
            </Link>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-400 font-normal">
              {footer.description || churchRecord?.description || ""}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Link
              className="button button-secondary text-xs uppercase tracking-wider font-bold"
              href={footer.visitCtaHref}
            >
              {footer.visitCtaLabel} <span aria-hidden="true">→</span>
            </Link>
            <Link
              className="button border border-secondary/50 bg-secondary/10 text-xs uppercase tracking-wider font-bold text-secondary hover:bg-secondary/20"
              href={footer.prayerCtaHref}
            >
              {footer.prayerCtaLabel}
            </Link>
            <Link
              className="button border border-white/20 bg-transparent text-xs uppercase tracking-wider text-slate-300 hover:border-white hover:bg-white hover:text-slate-950"
              href={footer.contactCtaHref}
            >
              {footer.contactCtaLabel}
            </Link>
          </div>
        </div>

        {/* 4 Multi-Column Organized Navigation (SRS Section 48) */}
        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Church */}
          <div>
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-secondary" />
              <h2 className="eyebrow text-slate-200">{footer.churchColumnTitle}</h2>
            </div>
            <ul className="mt-5 space-y-3 text-sm">
              {churchLinks.map((item) => (
                <li key={item.label}>
                  <Link className="text-slate-400 transition-colors hover:text-secondary" href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Ministries */}
          <div>
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-secondary" />
              <h2 className="eyebrow text-slate-200">{footer.ministriesColumnTitle}</h2>
            </div>
            <ul className="mt-5 space-y-3 text-sm">
              {ministryLinks.map((item) => (
                <li key={item.label}>
                  <Link className="text-slate-400 transition-colors hover:text-secondary" href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Resources & Support */}
          <div>
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-secondary" />
              <h2 className="eyebrow text-slate-200">{footer.resourcesColumnTitle}</h2>
            </div>
            <ul className="mt-5 space-y-3 text-sm">
              {resourceLinks.map((item) => (
                <li key={item.label}>
                  <Link className="text-slate-400 transition-colors hover:text-secondary" href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
              {supportLinks.map((item) => (
                <li key={item.label}>
                  <Link className="text-slate-400 transition-colors hover:text-secondary" href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link className="inline-flex items-center gap-1.5 font-semibold text-secondary hover:underline" href="/admin/login">
                  <LogIn className="size-3.5" aria-hidden="true" />
                  <span>Staff Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Service Times */}
          <div>
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-secondary" />
              <h2 className="eyebrow text-slate-200">{footer.contactColumnTitle}</h2>
            </div>
            <div className="mt-5 space-y-4 text-xs leading-relaxed text-slate-400">
              <div className="flex items-start gap-2.5">
                <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-secondary" />
                <div>
                  <span className="block font-semibold text-white">{footer.serviceTitle}</span>
                  <span className="block text-slate-400">{footer.serviceSummary}</span>
                </div>
              </div>

              {(church.contact.address || location) && (
                <div className="flex items-start gap-2.5">
                  <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-secondary" />
                  <span>{[church.contact.address, location].filter(Boolean).join(", ")}</span>
                </div>
              )}

              {church.contact.phone && (
                <div className="flex items-center gap-2.5">
                  <Phone aria-hidden="true" className="size-4 shrink-0 text-secondary" />
                  <a className="transition-colors hover:text-white" href={`tel:${church.contact.phone}`}>
                    {church.contact.phone}
                  </a>
                </div>
              )}

              {church.contact.email && (
                <div className="flex items-center gap-2.5">
                  <Mail aria-hidden="true" className="size-4 shrink-0 text-secondary" />
                  <a className="transition-colors hover:text-white" href={`mailto:${church.contact.email}`}>
                    {church.contact.email}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Social Links Row (SRS Section 48 & 55) */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {footer.connectLabel}
            </span>
            {socials.length > 0 ? (
              socials.map((item) => (
                <a
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 font-medium text-slate-300 transition-colors hover:border-secondary/60 hover:text-secondary"
                  href={item.url}
                  key={`${item.label}-${item.url}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  {item.label} <span aria-hidden="true">↗</span>
                </a>
              ))
            ) : <span className="text-xs text-slate-400">{footer.emptySocialText}</span>}
          </div>
          <a
            className="inline-flex items-center gap-1 text-slate-400 transition-colors hover:text-secondary"
            href="#top"
          >
            {footer.backToTopLabel} <span aria-hidden="true">↑</span>
          </a>
        </div>

        {/* Copyright & Legal Row (SRS Section 48) */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-slate-500">
          <span>
            © {new Date().getFullYear()} {displayChurchName}. {footer.copyrightSuffix}
          </span>
          <nav className="flex flex-wrap items-center gap-6" aria-label="Legal navigation">
            <Link className="inline-flex items-center gap-1.5 font-semibold text-slate-400 transition-colors hover:text-secondary" href="/admin/login">
              <LogIn className="size-3.5" aria-hidden="true" />
              <span>Staff Login</span>
            </Link>
            {legalLinks.map((item) => (
              <Link className="transition-colors hover:text-slate-300" href={item.href} key={item.label}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
