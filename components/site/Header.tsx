"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Clock, LogIn, Menu, Phone, X } from "lucide-react";
import { ChurchLogo } from "@/components/brand/church-logo";

const navigationLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Ministries", href: "/ministries" },
  { label: "Services", href: "/services" },
  { label: "Sermons", href: "/sermons" },
  { label: "Events", href: "/events" },
  { label: "Resources", href: "/resources" },
  { label: "Contact", href: "/contact" },
] as const;

function isCurrentPage(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

export function HeaderView({
  churchName = "Church",
  logoUrl = "/logo-c.png",
  logoAlt,
  phone,
}: {
  churchName?: string;
  logoUrl?: string;
  logoAlt?: string;
  phone?: string;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavigationRef = useRef<HTMLDivElement>(null);

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

  /* ─── All 8 recommended navigation links from SRS Section 10 ─────── */
  const desktopLinks = navigationLinks;

  return (
    <header className="site-header absolute top-0 left-0 z-50 w-full">
      {/* ── Single header row — overlays the hero ──────────────────────── */}
      <div className="flex w-full items-stretch">

        {/* ── Logo block (white bg, row layout: big logo + text beside it) ── */}
        <Link
          aria-label={`${churchName} home`}
          className="site-header-brand relative z-10 flex shrink-0 items-center gap-3 bg-white px-4 py-3 text-text transition-opacity hover:opacity-85 sm:px-6 sm:py-3.5"
          href="/"
        >
          <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full sm:size-12">
            <ChurchLogo
              alt={logoAlt || churchName}
              className="size-11 object-contain sm:size-12"
              priority
              src={logoUrl}
            />
          </span>
          <span className="min-w-0">
            <span className="block max-w-[12rem] font-display text-[0.82rem] font-extrabold uppercase leading-tight tracking-wide text-primary-dark sm:text-[0.92rem]">
              {churchName}
            </span>
            <span className="mt-0.5 block text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-muted sm:text-[0.62rem]">
              A community of faith
            </span>
          </span>
        </Link>

        {/* ── Transparent right section (nav + actions) ─────────────────── */}
        <div className="flex flex-1 items-stretch">

          {/* ── Desktop nav links ─────── */}
          <nav
            aria-label="Main navigation"
            className="hidden flex-1 items-center justify-end gap-0.5 px-3 lg:flex xl:gap-1.5 xl:px-5"
          >
            {desktopLinks.map(({ label, href }) => {
              const active = isCurrentPage(pathname, href);
              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={`site-nav-link whitespace-nowrap px-2.5 py-1.5 text-[0.74rem] font-semibold uppercase tracking-[0.1em] transition-colors xl:px-3.5 xl:text-[0.8rem] ${
                    active
                      ? "text-secondary font-bold"
                      : "text-white/90 hover:text-secondary"
                  }`}
                  href={href}
                  key={href}
                >
                  {label}
                </Link>
              );
            })}

            {/* Visit CTA button as required by SRS Section 10 */}
            <Link
              className="ml-2 hidden rounded-md bg-secondary px-3.5 py-1.5 text-[0.74rem] font-bold uppercase tracking-wider text-stone-950 transition hover:bg-secondary/90 xl:inline-flex xl:text-[0.78rem]"
              href="/plan-your-visit"
            >
              Plan Your Visit
            </Link>
          </nav>

          {/* ── MENU button — tall red/primary block on far right ──────── */}
          <button
            aria-controls="mobile-navigation"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="site-menu-btn ml-auto flex min-w-[4rem] flex-col items-center justify-center gap-1.5 bg-primary px-4 py-3 text-white transition-colors hover:bg-primary-hover sm:min-w-[5.5rem] sm:px-5"
            onClick={() => setMobileMenuOpen((open) => !open)}
            ref={menuButtonRef}
            type="button"
          >
            {mobileMenuOpen ? (
              <X aria-hidden="true" className="size-6" />
            ) : (
              <>
                <span className="flex flex-col gap-[5px]">
                  <span className="block h-[2px] w-6 bg-white" />
                  <span className="block h-[2px] w-6 bg-white" />
                  <span className="block h-[2px] w-6 bg-white" />
                </span>
              </>
            )}
            <span className="text-[0.6rem] font-bold uppercase tracking-[0.18em]">
              {mobileMenuOpen ? "Close" : "Menu"}
            </span>
          </button>
        </div>
      </div>

      {/* ── Full-screen mobile navigation drawer ─────────────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-text/50 backdrop-blur-sm">
          {/* Backdrop close */}
          <button
            aria-label="Close navigation menu"
            className="absolute inset-0 size-full cursor-default"
            onClick={closeMobileMenu}
            type="button"
          />

          {/* Drawer panel */}
          <div
            aria-labelledby="mobile-navigation-title"
            aria-modal="true"
            className="absolute inset-y-0 right-0 flex max-h-dvh w-[min(88vw,24rem)] flex-col overflow-y-auto overscroll-contain border-l border-border bg-white px-5 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl sm:px-6"
            id="mobile-navigation"
            ref={mobileNavigationRef}
            role="dialog"
          >
            <h2 className="sr-only" id="mobile-navigation-title">
              Navigation menu
            </h2>

            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-5">
              <Link
                aria-label={`${churchName} home`}
                className="flex min-w-0 items-center gap-3 text-text"
                href="/"
                onClick={closeMobileMenu}
              >
                <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
                  <ChurchLogo alt={logoAlt || churchName} className="size-9 object-contain" src={logoUrl} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-display text-sm font-extrabold uppercase leading-tight tracking-wide text-primary-dark">
                    {churchName}
                  </span>
                  <span className="block text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-muted">
                    A community of faith
                  </span>
                </span>
              </Link>
              <button
                aria-label="Close navigation menu"
                className="flex size-10 shrink-0 items-center justify-center rounded-md border border-stone-200 text-text transition-colors hover:bg-stone-100"
                onClick={closeMobileMenu}
                ref={closeButtonRef}
                type="button"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>

            {/* Drawer nav links */}
            <nav aria-label="Mobile navigation links" className="mt-6 grid gap-1">
              {navigationLinks.map(({ label, href }) => {
                const active = isCurrentPage(pathname, href);
                return (
                  <Link
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-12 items-center rounded-sm px-4 text-sm font-semibold uppercase tracking-wide transition-colors ${
                      active
                        ? "border-l-4 border-primary bg-primary/5 text-primary"
                        : "text-stone-600 hover:bg-stone-50 hover:text-primary"
                    }`}
                    href={href}
                    key={href}
                    onClick={closeMobileMenu}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Drawer footer CTAs */}
            <div className="mt-auto grid gap-3 border-t border-stone-200 pt-6">
              <Link
                className="flex min-h-11 items-center gap-2 rounded-sm border border-stone-200 px-4 text-sm font-semibold text-stone-700 transition-colors hover:border-primary hover:bg-stone-50 hover:text-primary"
                href="/admin/login"
                onClick={closeMobileMenu}
              >
                <LogIn aria-hidden="true" className="size-4 text-primary" />
                Login
              </Link>
              <Link
                className="flex min-h-11 items-center gap-2 rounded-sm border border-stone-200 px-4 text-sm font-semibold text-stone-700 transition-colors hover:border-primary hover:bg-stone-50 hover:text-primary"
                href="/services"
                onClick={closeMobileMenu}
              >
                <Clock aria-hidden="true" className="size-4 text-primary" />
                Service Times
              </Link>
              <Link
                className="flex min-h-12 items-center justify-center gap-2 bg-primary text-sm font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
                href="/plan-your-visit"
                onClick={closeMobileMenu}
              >
                Plan a Visit
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
