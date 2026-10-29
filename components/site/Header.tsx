"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  Clock3,
  Heart,
  Mail,
  MapPin,
  Menu,
  Phone,
  X,
  Compass,
  Megaphone,
} from "lucide-react";
import { ChurchLogo } from "@/components/brand/church-logo";
import { defaultHomepageSettings, type HomepageSettings } from "@/lib/content/website-settings";

const subscribeNever = () => () => {};

function isCurrentPage(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

export type UrgentAnnouncementData = {
  id?: string;
  title: string;
  description?: string | null;
  slug?: string;
  category?: string;
  href?: string;
  ctaLabel?: string;
};

export function HeaderView({
  churchName = "Church",
  logoUrl = "/logo-c.png",
  logoAlt,
  phone,
  email,
  location = "Kigali, Rwanda",
  siteHeader,
  urgentAnnouncement,
}: {
  churchName?: string;
  logoUrl?: string;
  logoAlt?: string;
  phone?: string;
  email?: string;
  location?: string;
  siteHeader: HomepageSettings["siteHeader"];
  urgentAnnouncement?: UrgentAnnouncementData | null;
}) {
  const pathname = usePathname();
  const headerSettings = siteHeader ?? defaultHomepageSettings.siteHeader;
  const configuredNavigation = headerSettings.navigation
    .filter((item) => item.visible)
    .sort((left, right) => left.order - right.order);
  const mounted = useSyncExternalStore(subscribeNever, () => true, () => false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavigationRef = useRef<HTMLDivElement>(null);

  // Active announcement prioritizing database announcement records then site settings announcement
  const activeAnnouncement = urgentAnnouncement
    ? {
        title: urgentAnnouncement.title,
        description: urgentAnnouncement.description,
        href: urgentAnnouncement.href || `/announcements/${urgentAnnouncement.slug}`,
        ctaLabel: urgentAnnouncement.ctaLabel || "Read Notice",
        isUrgent: true,
      }
    : headerSettings.announcement?.visible && headerSettings.announcement.text
      ? {
          title: headerSettings.announcement.text,
          description: null,
          href: headerSettings.announcement.href || "/announcements",
          ctaLabel: headerSettings.announcement.ctaLabel || "Learn More",
          isUrgent: false,
        }
      : null;

  // Sticky scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = mobileNavigationRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
    menuButtonRef.current?.focus();
  }

  const isHeroPage = pathname === "/";
  const navTextColor = scrolled || !isHeroPage ? "text-stone-800" : "text-white/90";
  const navHoverColor = scrolled || !isHeroPage ? "hover:text-primary" : "hover:text-secondary";
  const navActiveColor = scrolled || !isHeroPage ? "text-primary font-bold" : "text-secondary font-bold";

  return (
    <header
      className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/98 shadow-md backdrop-blur-md border-b border-stone-200/90"
          : isHeroPage
            ? "bg-gradient-to-b from-stone-950/85 via-stone-950/45 to-transparent"
            : "bg-white/98 shadow-sm backdrop-blur-md border-b border-stone-200/80"
      }`}
    >
      {/* ── 1. Top Section: Urgent Announcement from Database ── */}
      {activeAnnouncement && bannerVisible && (
        <aside
          aria-label="Urgent church announcement"
          className="relative z-20 flex min-h-10 items-center justify-between border-b border-amber-600/30 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-3.5 py-2 sm:px-6 lg:px-8 text-stone-950 shadow-sm"
          role="region"
        >
          <div className="mx-auto flex flex-1 max-w-7xl items-center justify-center gap-2 sm:gap-3 text-xs">
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-stone-950 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-amber-300 shadow-xs">
              <Megaphone className="size-3 animate-pulse" aria-hidden="true" />
              {activeAnnouncement.isUrgent ? "URGENT" : "ANNOUNCEMENT"}
            </span>

            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-center">
              <span className="font-extrabold tracking-tight text-stone-950 text-xs sm:text-[13px]">
                {activeAnnouncement.title}
              </span>
              {activeAnnouncement.description && (
                <span className="hidden lg:inline text-stone-900/80 text-xs font-medium max-w-md truncate">
                  — {activeAnnouncement.description}
                </span>
              )}
            </div>

            <Link
              className="inline-flex shrink-0 whitespace-nowrap items-center gap-1 rounded-full bg-stone-950/15 hover:bg-stone-950 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-stone-950 hover:text-amber-300 transition-colors shadow-2xs"
              href={activeAnnouncement.href}
            >
              <span>{activeAnnouncement.ctaLabel}</span>
              <ArrowRight className="size-3" aria-hidden="true" />
            </Link>
          </div>

          <button
            aria-label="Dismiss announcement"
            className="flex size-7 shrink-0 items-center justify-center rounded-full text-stone-950/70 transition hover:bg-stone-950/15 hover:text-stone-950 ml-2"
            onClick={() => setBannerVisible(false)}
            type="button"
          >
            <X className="size-3.5" />
          </button>
        </aside>
      )}

      {/* ── 2. Main Navigation Bar with Logo, Nav Links & Re-arranged Actions ── */}
      <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
        {/* Brand / Logo */}
        <Link
          aria-label={`${churchName} home`}
          className="flex items-center gap-3.5 transition-opacity hover:opacity-90 shrink-0"
          href="/"
        >
          <span className="flex size-11 sm:size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-stone-900/10">
            <ChurchLogo
              alt={logoAlt || churchName}
              className="size-10 object-contain sm:size-11"
              priority
              src={logoUrl}
            />
          </span>
          <span className="min-w-0">
            <span
              className={`block max-w-[12rem] sm:max-w-[16rem] font-display text-[0.85rem] sm:text-[0.98rem] font-extrabold uppercase leading-tight tracking-wide ${
                scrolled || !isHeroPage ? "text-primary" : "text-white"
              }`}
            >
              {churchName}
            </span>
            <span
              className={`mt-0.5 block text-[0.58rem] sm:text-[0.62rem] font-bold uppercase tracking-[0.16em] ${
                scrolled || !isHeroPage ? "text-muted" : "text-white/80"
              }`}
            >
              {headerSettings.brandTagline}
            </span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav aria-label="Main navigation" className="hidden items-center gap-0.5 lg:flex xl:gap-1 shrink min-w-0">
          {configuredNavigation.map((link) => {
            const active = isCurrentPage(pathname, link.href);
            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap rounded-lg px-2 lg:px-2.5 xl:px-3 py-2 text-[0.72rem] lg:text-[0.75rem] xl:text-[0.78rem] font-bold uppercase tracking-[0.06em] xl:tracking-[0.08em] transition-colors ${
                  active ? navActiveColor : `${navTextColor} ${navHoverColor}`
                }`}
                href={link.href}
                key={`${link.href}-${link.order}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Primary CTA Button */}
        {headerSettings.primaryCta.visible && (
          <div className="hidden shrink-0 items-center lg:flex">
            <Link
              className="flex shrink-0 whitespace-nowrap min-h-11 items-center gap-2 rounded-full bg-secondary px-5 xl:px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-950 shadow-md transition-all hover:bg-secondary/90 hover:shadow-lg hover:-translate-y-0.5"
              href={headerSettings.primaryCta.href}
            >
              <span className="whitespace-nowrap">{headerSettings.primaryCta.label}</span>
              <ArrowRight className="size-3.5 shrink-0" aria-hidden="true" />
            </Link>
          </div>
        )}

        {/* Mobile Hamburger Button */}
        <button
          aria-controls="mobile-navigation"
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          className="flex min-h-11 items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-white shadow-sm transition hover:bg-primary-hover lg:hidden"
          onClick={() => setMobileMenuOpen((open) => !open)}
          ref={menuButtonRef}
          type="button"
        >
          {mobileMenuOpen ? (
            <X className="size-5" aria-hidden="true" />
          ) : (
            <Menu className="size-5" aria-hidden="true" />
          )}
          <span className="text-xs font-bold uppercase tracking-wider">
            {mobileMenuOpen ? "Close" : "Menu"}
          </span>
        </button>
      </div>

      {/* ── 3. Full-screen Mobile Navigation Drawer ── */}
      {mobileMenuOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[100] bg-stone-950/60 backdrop-blur-sm lg:hidden">
          <button
            aria-label="Close navigation menu"
            className="absolute inset-0 size-full cursor-default"
            onClick={closeMobileMenu}
            type="button"
          />

          <div
            aria-labelledby="mobile-navigation-title"
            aria-modal="true"
            className="absolute inset-y-0 right-0 flex max-h-dvh w-[min(90vw,24rem)] flex-col overflow-y-auto overscroll-contain bg-white px-5 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl"
            id="mobile-navigation"
            ref={mobileNavigationRef}
            role="dialog"
          >
            <h2 className="sr-only" id="mobile-navigation-title">
              Mobile Navigation Menu
            </h2>

            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <Link
                aria-label={`${churchName} home`}
                className="flex items-center gap-3 text-stone-900"
                href="/"
                onClick={closeMobileMenu}
              >
                <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-xs">
                  <ChurchLogo alt={logoAlt || churchName} className="size-8 object-contain" src={logoUrl} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-display text-xs font-extrabold uppercase leading-tight tracking-wide text-primary">
                    {churchName}
                  </span>
                  <span className="block text-[0.6rem] font-bold uppercase tracking-[0.14em] text-muted">
                    {headerSettings.brandTagline}
                  </span>
                </span>
              </Link>
              <button
                aria-label="Close navigation menu"
                className="flex size-10 items-center justify-center rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100"
                onClick={closeMobileMenu}
                ref={closeButtonRef}
                type="button"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            {/* Quick Action Grid */}
            <div className="mt-4 grid grid-cols-2 gap-2 border-b border-stone-200 pb-4">
              {headerSettings.primaryCta.visible && (
                <Link
                  href={headerSettings.primaryCta.href}
                  onClick={closeMobileMenu}
                  className="col-span-2 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-stone-950 shadow-xs whitespace-nowrap"
                >
                  <Compass className="size-4 shrink-0" />
                  <span className="whitespace-nowrap">{headerSettings.primaryCta.label}</span>
                </Link>
              )}
              <Link
                href="/prayer-request"
                onClick={closeMobileMenu}
                className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-stone-100 px-3 py-2 text-center text-xs font-bold uppercase tracking-wider text-primary hover:bg-stone-200"
              >
                <Heart className="size-3.5 text-primary" />
                <span>Prayer</span>
              </Link>
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-stone-200 px-3 py-2 text-center text-xs font-semibold text-stone-700 hover:bg-stone-50"
                >
                  <Phone className="size-3.5 text-primary" />
                  <span>Call Church</span>
                </a>
              )}
              <Link
                href={headerSettings.directionsHref}
                onClick={closeMobileMenu}
                className="col-span-2 flex min-h-11 items-center justify-center gap-2 rounded-xl border border-stone-200 px-3 py-2 text-center text-xs font-semibold text-stone-700 hover:bg-stone-50"
              >
                <MapPin className="size-3.5 text-primary" />
                <span>{headerSettings.directionsLabel}</span>
              </Link>
            </div>

            <nav aria-label="Mobile navigation links" className="mt-4 space-y-1">
              {configuredNavigation.map((link) => {
                const active = isCurrentPage(pathname, link.href);
                return (
                  <Link
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-12 items-center rounded-xl px-4 text-xs font-bold uppercase tracking-wider ${
                      active ? "bg-primary/10 text-primary" : "text-stone-700 hover:bg-stone-50 hover:text-primary"
                    }`}
                    href={link.href}
                    key={`${link.href}-${link.order}`}
                    onClick={closeMobileMenu}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Drawer Footer with Service Times & Contact */}
            <div className="mt-auto border-t border-stone-200 pt-5 space-y-2">
              <div className="rounded-xl bg-stone-50 p-3.5 border border-stone-200/70 text-xs text-stone-600">
                <p className="font-bold text-stone-900 flex items-center gap-1.5">
                  <Clock3 className="size-3.5 text-primary" />
                  {headerSettings.serviceSummary}
                </p>
                {location && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-stone-600">
                    <MapPin className="size-3.5 text-primary" />
                    <span>{location}</span>
                  </p>
                )}
                {email && (
                  <p className="mt-1 flex items-center gap-1.5 text-stone-600">
                    <Mail className="size-3.5 text-primary" />
                    <a className="hover:text-primary transition-colors truncate" href={`mailto:${email}`}>
                      {email}
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
