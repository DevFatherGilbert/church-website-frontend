import Link from "next/link";
import { ExternalLink, Menu, X } from "lucide-react";

type AdminProfile = {
  fullName?: string;
  email?: string;
};

export function HeaderView({ profile, isMenuOpen, onMenuClick }: { profile: AdminProfile; isMenuOpen: boolean; onMenuClick: () => void }) {
  const displayName = profile.fullName?.trim() || "Administrator";
  const initials = displayName.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "A";

  return <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
    <div className="flex min-h-[4.5rem] items-center gap-3 px-4 sm:px-6 lg:px-8">
      <button aria-controls="admin-dashboard-sidebar" aria-expanded={isMenuOpen} aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"} className="grid size-10 shrink-0 place-items-center rounded-lg text-muted hover:bg-surface-strong hover:text-foreground lg:hidden" onClick={onMenuClick} type="button">
        {isMenuOpen ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
      </button>

      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-4">
        <Link className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3.5 text-sm font-semibold text-foreground transition hover:bg-surface-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" href="/" target="_blank" rel="noreferrer">
          <ExternalLink aria-hidden="true" className="size-4 text-muted" />
          <span className="hidden sm:inline">View live website</span>
          <span className="sr-only sm:hidden">View public website in a new tab</span>
        </Link>
        <div aria-label={`Signed in as ${displayName}`} className="flex items-center gap-3 border-l border-border pl-3 sm:pl-4">
          <div aria-hidden="true" className="grid size-9 place-items-center rounded-full bg-primary/10 font-display text-xs font-bold text-primary">{initials}</div>
          <div className="hidden min-w-0 sm:block">
            <p className="max-w-40 truncate text-sm font-bold text-foreground">{displayName}</p>
            <p className="max-w-40 truncate text-xs text-muted">{profile.email || "Administrator"}</p>
          </div>
        </div>
      </div>
    </div>
  </header>;
}
