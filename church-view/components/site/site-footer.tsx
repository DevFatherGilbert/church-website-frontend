import Link from "next/link";
import { ChurchLogo } from "@/components/brand/church-logo";
import { getPublicWebsiteSettings } from "@/lib/content/website-settings";

const footerLinks = [
  ["Our story", "/about/our-story"],
  ["Ministries", "/ministries"],
  ["Services", "/services"],
  ["Events", "/events"],
  ["Sermons", "/sermons"],
  ["Resources", "/resources"],
  ["Prayer request", "/prayer-request"],
  ["Contact", "/contact"],
] as const;

export async function SiteFooter() {
  const { church, churchRecord, churchName } = await getPublicWebsiteSettings();
  const displayChurchName = churchName || "Church";
  const location = [church.contact.city, church.contact.country].filter(Boolean).join(" · ");
  const socials = church.socialLinks.filter((item) => item.visible);

  return (
    <footer className="relative border-t border-slate-800/80 bg-gradient-to-b from-[#0a1526] to-[#050a14] px-5 pb-8 pt-16 text-slate-300">
      <div className="page-container grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1.4fr]">
        {/* Brand column */}
        <div>
          <Link
            className="group inline-flex items-center gap-3"
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
              <span className="block font-display text-xl font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
                {displayChurchName}
              </span>
              {location && (
                <span className="mt-0.5 block text-[10px] font-bold tracking-[0.2em] text-amber-400 uppercase">
                  {location}
                </span>
              )}
            </div>
          </Link>

          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400 font-normal">
            {churchRecord?.description ||
              "A welcoming faith community committed to worship, spiritual growth, and heartfelt service."}
          </p>
        </div>

        {/* Navigation links */}
        <div>
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-amber-400" />
            <h2 className="eyebrow text-slate-400">EXPLORE</h2>
          </div>
          <nav
            className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3.5 text-sm font-semibold"
            aria-label="Footer navigation"
          >
            {footerLinks.map(([label, href]) => (
              <Link
                className="text-slate-300 transition-colors hover:text-amber-400"
                href={href}
                key={href}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Visit & Connect */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-amber-400" />
            <h2 className="eyebrow text-amber-400">COME AS YOU ARE</h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-300 font-normal">
            {[church.contact.address, location].filter(Boolean).join(", ") ||
              "We would be honored to welcome you this Sunday."}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              className="button button-secondary text-xs uppercase tracking-wider"
              href="/plan-your-visit"
            >
              Plan your visit <span aria-hidden="true">→</span>
            </Link>
            <Link
              className="button button-outline border-slate-700 text-xs uppercase tracking-wider text-slate-200 hover:border-white hover:bg-white hover:text-slate-950"
              href="/contact"
            >
              Contact us
            </Link>
          </div>
        </div>
      </div>

      {/* Social links */}
      {socials.length > 0 && (
        <nav
          aria-label="Social media"
          className="page-container mt-12 flex flex-wrap items-center gap-3 border-t border-slate-800/60 pt-6 text-xs"
        >
          <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
            Follow us:
          </span>
          {socials.map((item) => (
            <a
              className="inline-flex items-center gap-1 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 font-semibold text-slate-300 transition-colors hover:border-amber-400/40 hover:text-amber-400"
              href={item.url}
              key={`${item.label}-${item.url}`}
              rel="noreferrer"
              target="_blank"
            >
              {item.label} <span aria-hidden="true">↗</span>
            </a>
          ))}
        </nav>
      )}

      {/* Copyright row */}
      <div className="page-container mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/60 pt-6 text-xs text-slate-400">
        <span>
          © {new Date().getFullYear()} {displayChurchName}. All rights reserved.
        </span>
        <nav className="flex flex-wrap gap-5" aria-label="Legal">
          <Link className="transition-colors hover:text-white" href="/privacy-policy">
            Privacy Policy
          </Link>
          <Link className="transition-colors hover:text-white" href="/terms-and-conditions">
            Terms of Service
          </Link>
          <Link className="transition-colors hover:text-white" href="/cookie-policy">
            Cookie Policy
          </Link>
        </nav>
        <a
          className="inline-flex items-center gap-1 text-slate-400 transition-colors hover:text-amber-400"
          href="#top"
        >
          Back to top <span aria-hidden="true">↑</span>
        </a>
      </div>
    </footer>
  );
}
