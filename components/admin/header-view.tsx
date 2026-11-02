"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ExternalLink, LogOut, Menu, Settings, X } from "lucide-react";
import { NotificationsDropdown } from "./notifications-dropdown";
import { handleAdminLogout } from "@/lib/auth/logout";

type AdminProfile = {
  fullName?: string;
  email?: string;
};

export function HeaderView({
  profile,
  isMenuOpen,
  onMenuClick,
}: {
  profile: AdminProfile;
  isMenuOpen: boolean;
  onMenuClick: () => void;
}) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const displayName = profile.fullName?.trim() || "Administrator";
  const initials =
    displayName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "A";

  useEffect(() => {
    if (!profileMenuOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !profileMenuRef.current?.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
        profileButtonRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileMenuOpen]);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
      <div className="flex min-h-[4.5rem] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          aria-controls="admin-dashboard-sidebar"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          className="grid size-10 shrink-0 place-items-center rounded-lg text-muted hover:bg-surface-strong hover:text-foreground lg:hidden"
          onClick={onMenuClick}
          type="button"
        >
          {isMenuOpen ? (
            <X aria-hidden="true" className="size-5" />
          ) : (
            <Menu aria-hidden="true" className="size-5" />
          )}
        </button>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-4">
          <Link
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3.5 text-sm font-semibold text-foreground transition hover:bg-surface-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            href="/"
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink aria-hidden="true" className="size-4 text-muted" />
            <span className="hidden sm:inline">View live website</span>
            <span className="sr-only sm:hidden">View public website in a new tab</span>
          </Link>

          <NotificationsDropdown />

          <div className="relative border-l border-border pl-3 sm:pl-4" ref={profileMenuRef}>
            <button
              aria-controls="admin-profile-menu"
              aria-expanded={profileMenuOpen}
              aria-haspopup="menu"
              aria-label={`Account menu for ${displayName}`}
              className="flex items-center gap-3 rounded-xl p-1.5 text-left transition hover:bg-surface-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onClick={() => setProfileMenuOpen((open) => !open)}
              ref={profileButtonRef}
              type="button"
            >
              <span
                aria-hidden="true"
                className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 font-display text-xs font-bold text-primary"
              >
                {initials}
              </span>
              <span className="hidden min-w-0 sm:block">
                <span className="block max-w-40 truncate text-sm font-bold text-foreground">
                  {displayName}
                </span>
                <span className="block max-w-40 truncate text-xs text-muted">
                  {profile.email || "Administrator"}
                </span>
              </span>
            </button>
            {profileMenuOpen && (
              <div
                className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-border bg-surface p-1.5 shadow-xl"
                id="admin-profile-menu"
                role="menu"
              >
                <div className="border-b border-border px-3 py-2.5">
                  <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
                  <p className="truncate text-xs text-muted">{profile.email || "Administrator"}</p>
                </div>
                <Link
                  className="mt-1 flex min-h-10 items-center gap-2.5 rounded-xl px-3 text-sm font-medium text-foreground transition hover:bg-surface-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                  href="/admin/settings"
                  onClick={() => setProfileMenuOpen(false)}
                  role="menuitem"
                >
                  <Settings aria-hidden="true" className="size-4 text-muted" />
                  Settings
                </Link>
                <button
                  className="flex min-h-10 w-full items-center gap-2.5 rounded-xl px-3 text-left text-sm font-medium text-red-700 transition hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
                  onClick={() => void handleAdminLogout()}
                  role="menuitem"
                  type="button"
                >
                  <LogOut aria-hidden="true" className="size-4" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
