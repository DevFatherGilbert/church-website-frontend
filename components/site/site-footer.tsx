import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ChurchLogo } from "@/components/brand/church-logo";
import { getPublicWebsiteSettings } from "@/lib/content/website-settings";

const churchLinks = [
  { label: "About Us", href: "/about" },
  { label: "Our Story", href: "/about/our-story" },
  { label: "Mission & Vision", href: "/about/mission-vision" },
  { label: "Beliefs & Statement of Faith", href: "/about/beliefs" },
  { label: "Leadership", href: "/about/leadership" },
] as const;

const ministryLinks = [
  { label: "Children's Ministry", href: "/ministries/children" },
  { label: "Youth Ministry", href: "/ministries/youth" },
  { label: "Women's Ministry", href: "/ministries/women" },
  { label: "Men's Ministry", href: "/ministries/men" },
  { label: "Worship & Choir", href: "/ministries/worship" },
  { label: "Prayer Ministry", href: "/ministries/prayer" },
  { label: "Outreach & Service", href: "/ministries/outreach" },
] as const;

const resourceLinks = [
  { label: "Sermons & Media", href: "/sermons" },
  { label: "Upcoming Events", href: "/events" },
  { label: "Announcements", href: "/announcements" },
  { label: "Bible Study Resources", href: "/resources" },
] as const;

const supportLinks = [
  { label: "Contact Us", href: "/contact" },
  { label: "Prayer Request", href: "/prayer-request" },
  { label: "Frequently Asked Questions", href: "/faqs" },
  { label: "Plan Your Visit", href: "/plan-your-visit" },
] as const;

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Cookie Policy", href: "/cookie-policy" },
] as const;

export async function SiteFooter() {
  const { church, churchRecord, churchName } = await getPublicWebsiteSettings();
  const displayChurchName = churchName || "Seventh-day Adventist Fellowship";
  const location = [church.contact.city, church.contact.country].filter(Boolean).join(" · ");
  const socials = church.socialLinks.filter((item) => item.visible);

  return (
    <footer className="relative border-t border-slate-800/80 bg-gradient-to-b from-[#0a1526] via-[#070e1c] to-[#040811] px-5 pb-8 pt-16 text-slate-300">
      <div className="page-container">
        {/* Top Brand Banner & Visit CTA */}
        <div className="grid gap-8 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 sm:p-8 lg:grid-cols-[1.5fr_1fr] lg:items-center">
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
                <span className="block font-display text-2xl font-bold tracking-tight text-white transition-colors group-hover:text-amber-400">
                  {displayChurchName}
                </span>
                <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-amber-400">
                  A Welcoming Community of Faith
                </span>
              </div>
            </Link>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-400 font-normal">
              {churchRecord?.description ||
                "A Christ-centered church committed to authentic worship, spiritual growth, fellowship, and compassionate community outreach."}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Link
              className="button button-secondary text-xs uppercase tracking-wider font-bold"
              href="/plan-your-visit"
            >
              Plan Your Visit <span aria-hidden="true">→</span>
            </Link>
            <Link
              className="button border border-amber-400/50 bg-amber-400/10 text-xs uppercase tracking-wider font-bold text-amber-300 hover:bg-amber-400/20"
              href="/prayer-request"
            >
              Submit Prayer Request
            </Link>
            <Link
              className="button border border-slate-700 bg-transparent text-xs uppercase tracking-wider text-slate-300 hover:border-white hover:bg-white hover:text-slate-950"
              href="/contact"
            >
              Contact Us
            </Link>
          </div>
        </div>

        {/* 4 Multi-Column Organized Navigation (SRS Section 48) */}
        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Church */}
          <div>
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-amber-400" />
              <h2 className="eyebrow text-slate-200">CHURCH</h2>
            </div>
            <ul className="mt-5 space-y-3 text-sm">
              {churchLinks.map((item) => (
                <li key={item.label}>
                  <Link className="text-slate-400 transition-colors hover:text-amber-400" href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Ministries */}
          <div>
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-amber-400" />
              <h2 className="eyebrow text-slate-200">MINISTRIES</h2>
            </div>
            <ul className="mt-5 space-y-3 text-sm">
              {ministryLinks.map((item) => (
                <li key={item.label}>
                  <Link className="text-slate-400 transition-colors hover:text-amber-400" href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Resources & Support */}
          <div>
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-amber-400" />
              <h2 className="eyebrow text-slate-200">RESOURCES & SUPPORT</h2>
            </div>
            <ul className="mt-5 space-y-3 text-sm">
              {resourceLinks.map((item) => (
                <li key={item.label}>
                  <Link className="text-slate-400 transition-colors hover:text-amber-400" href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
              {supportLinks.map((item) => (
                <li key={item.label}>
                  <Link className="text-slate-400 transition-colors hover:text-amber-400" href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Service Times */}
          <div>
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-amber-400" />
              <h2 className="eyebrow text-slate-200">SERVICE & CONTACT</h2>
            </div>
            <div className="mt-5 space-y-4 text-xs leading-relaxed text-slate-400">
              <div className="flex items-start gap-2.5">
                <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-amber-400" />
                <div>
                  <span className="block font-semibold text-white">Sabbath worship</span>
                  <span className="block text-slate-400">Contact the congregation for gathering times.</span>
                </div>
              </div>

              {(church.contact.address || location) && (
                <div className="flex items-start gap-2.5">
                  <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-amber-400" />
                  <span>{[church.contact.address, location].filter(Boolean).join(", ")}</span>
                </div>
              )}

              {church.contact.phone && (
                <div className="flex items-center gap-2.5">
                  <Phone aria-hidden="true" className="size-4 shrink-0 text-amber-400" />
                  <a className="transition-colors hover:text-white" href={`tel:${church.contact.phone}`}>
                    {church.contact.phone}
                  </a>
                </div>
              )}

              {church.contact.email && (
                <div className="flex items-center gap-2.5">
                  <Mail aria-hidden="true" className="size-4 shrink-0 text-amber-400" />
                  <a className="transition-colors hover:text-white" href={`mailto:${church.contact.email}`}>
                    {church.contact.email}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Social Links Row (SRS Section 48 & 55) */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/60 pt-6 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Connect With Us:
            </span>
            {socials.length > 0 ? (
              socials.map((item) => (
                <a
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/80 px-3.5 py-1.5 font-medium text-slate-300 transition-colors hover:border-amber-400/50 hover:text-amber-400"
                  href={item.url}
                  key={`${item.label}-${item.url}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  {item.label} <span aria-hidden="true">↗</span>
                </a>
              ))
            ) : <span className="text-xs text-slate-400">Social profiles will be added when verified.</span>}
          </div>
          <a
            className="inline-flex items-center gap-1 text-slate-400 transition-colors hover:text-amber-400"
            href="#top"
          >
            Back to top <span aria-hidden="true">↑</span>
          </a>
        </div>

        {/* Copyright & Legal Row (SRS Section 48) */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/60 pt-6 text-xs text-slate-500">
          <span>
            © {new Date().getFullYear()} {displayChurchName}. All rights reserved.
          </span>
          <nav className="flex flex-wrap gap-6" aria-label="Legal navigation">
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
