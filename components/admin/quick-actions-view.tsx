import Link from "next/link";
import { ArrowRight, CalendarPlus, HandHeart, Megaphone, Mic2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const actions: { label: string; description: string; href: string; icon: LucideIcon }[] = [
  { label: "Add Sermon", description: "Share a new message", href: "/admin/sermons", icon: Mic2 },
  { label: "Create Event", description: "Add to the church calendar", href: "/admin/events", icon: CalendarPlus },
  { label: "Post Announcement", description: "Send a church update", href: "/admin/announcements", icon: Megaphone },
  { label: "View Prayer Requests", description: "Support the prayer team", href: "/admin/prayer-requests", icon: HandHeart },
];

export function QuickActionsView() {
  return (
    <section aria-labelledby="quick-actions-title">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground" id="quick-actions-title">
            Quick actions
          </h2>
          <p className="mt-1 text-sm text-muted font-normal">Common tasks, ready when you are.</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map(({ label, description, href, icon: Icon }) => (
          <Link
            className="group flex min-h-28 items-center gap-4 rounded-xl border border-border bg-surface p-4 shadow-xs transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
            href={href}
            key={href}
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary/15">
              <Icon aria-hidden="true" className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                {label}
              </span>
              <span className="mt-1 block text-xs leading-5 text-muted">{description}</span>
            </span>
            <ArrowRight
              aria-hidden="true"
              className="size-4 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-primary"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
