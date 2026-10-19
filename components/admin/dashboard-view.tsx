"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, HandHeart, Inbox, Megaphone, Mic2, UsersRound, CheckCircle2, FileEdit } from "lucide-react";
import { authGet } from "@/lib/api/church-api";
import { QuickActionsView } from "./quick-actions-view";
import { RecentActivityTableView, type RecentActivityItem } from "./recent-activity-table-view";
import { StatCardView, type StatCardData } from "./stat-card-view";

type DatedRecord = {
  id: string;
  title?: string;
  name?: string;
  status?: string;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
  details?: { status?: string };
};

type DashboardAnnouncementList = { items: DatedRecord[] };

type DashboardData = {
  sermons: DatedRecord[];
  events: DatedRecord[];
  announcements: DatedRecord[];
  prayerRequests: DatedRecord[];
  ministries: DatedRecord[];
  inquiries: DatedRecord[];
  available: boolean[];
  loading: boolean;
};

const initialData: DashboardData = {
  sermons: [],
  events: [],
  announcements: [],
  prayerRequests: [],
  ministries: [],
  inquiries: [],
  available: [false, false, false, false, false, false],
  loading: true,
};

function extractItems<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (Array.isArray(obj.items)) return obj.items as T[];
    if (Array.isArray(obj.data)) return obj.data as T[];
    if (Array.isArray(obj.results)) return obj.results as T[];
  }
  return [];
}

function countInRange(records: DatedRecord[], start: number, end: number) {
  if (!Array.isArray(records)) return 0;
  return records.filter((record) => {
    const value = record?.publishedAt ?? record?.createdAt ?? record?.updatedAt;
    if (!value) return false;
    const time = new Date(value).getTime();
    return Number.isFinite(time) && time >= start && time < end;
  }).length;
}

function getPeriodChange(records: DatedRecord[]) {
  if (!Array.isArray(records)) {
    return { change: "0", direction: "steady" as const };
  }
  const now = Date.now();
  const currentStart = now - 30 * 24 * 60 * 60 * 1000;
  const previousStart = now - 60 * 24 * 60 * 60 * 1000;
  const current = countInRange(records, currentStart, now + 1);
  const previous = countInRange(records, previousStart, currentStart);
  const difference = current - previous;

  return {
    change: difference > 0 ? `+${difference}` : difference < 0 ? `−${Math.abs(difference)}` : "0",
    direction: difference > 0 ? "up" as const : difference < 0 ? "down" as const : "steady" as const,
  };
}

function formatActivityDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: "Date unavailable", dateTime: "" };
  return {
    date: new Intl.DateTimeFormat("en-RW", { dateStyle: "medium", timeZone: "Africa/Kigali" }).format(date),
    dateTime: date.toISOString(),
  };
}

function getKigaliDateKey(value: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Kigali",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function getActivityTime(record: DatedRecord) {
  return record.publishedAt ?? record.createdAt ?? record.updatedAt ?? record.date ?? "";
}

function toActivityItems(data: DashboardData): RecentActivityItem[] {
  const today = getKigaliDateKey(new Date());
  const items: RecentActivityItem[] = [];

  const sermons = Array.isArray(data?.sermons) ? data.sermons : [];
  for (const sermon of sermons) {
    if (!sermon) continue;
    const rawDate = getActivityTime(sermon);
    if (!rawDate) continue;
    const formatted = formatActivityDate(rawDate);
    if (!formatted.dateTime) continue;
    items.push({
      id: `sermon-${sermon.id}`,
      title: sermon.title || "Untitled sermon",
      category: "Sermon",
      status: sermon.status === "draft" ? "Draft" : "Published",
      ...formatted,
    });
  }

  const events = Array.isArray(data?.events) ? data.events : [];
  for (const event of events) {
    if (!event) continue;
    const rawDate = getActivityTime(event);
    if (!rawDate) continue;
    const formatted = formatActivityDate(rawDate);
    const status = event.status === "draft" ? "Draft" : event.date && event.date >= today ? "Scheduled" : "Published";
    if (!formatted.dateTime) continue;
    items.push({
      id: `event-${event.id}`,
      title: event.name || event.title || "Untitled event",
      category: "Event",
      status,
      ...formatted,
    });
  }

  const announcements = Array.isArray(data?.announcements) ? data.announcements : [];
  for (const announcement of announcements) {
    if (!announcement) continue;
    const rawDate = getActivityTime(announcement);
    if (!rawDate) continue;
    const formatted = formatActivityDate(rawDate);
    if (!formatted.dateTime) continue;
    const announcementStatus = announcement.details?.status;
    const status =
      announcementStatus === "SCHEDULED" ? "Scheduled"
        : announcementStatus === "UNPUBLISHED" ? "Unpublished"
          : announcementStatus === "EXPIRED" ? "Expired"
            : announcementStatus === "ARCHIVED" ? "Archived"
              : announcementStatus === "DRAFT" || announcement.status === "draft" ? "Draft"
                : "Published";
    items.push({
      id: `announcement-${announcement.id}`,
      title: announcement.title || "Untitled announcement",
      category: "Announcement",
      status,
      ...formatted,
    });
  }

  return items
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
    .slice(0, 5);
}

export function DashboardView() {
  const [data, setData] = useState(initialData);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setCurrentTime(new Date().getTime()), 0);
    let cancelled = false;

    async function loadDashboard() {
      const [
        sermonsResult,
        eventsResult,
        announcementsResult,
        prayersResult,
        ministriesResult,
        inquiriesResult,
      ] = await Promise.allSettled([
        authGet<DatedRecord[]>("/admin/sermons").catch(() => authGet<DatedRecord[]>("/sermons")),
        authGet<DatedRecord[]>("/events"),
        authGet<unknown>("/admin/announcements").catch(() => authGet<unknown>("/content/announcements")),
        authGet<DatedRecord[]>("/inquiries/prayer"),
        authGet<unknown>("/admin/ministries").catch(() => authGet<unknown>("/ministries")),
        authGet<DatedRecord[]>("/inquiries/contact"),
      ]);

      if (cancelled) return;

      const available = [
        sermonsResult.status === "fulfilled",
        eventsResult.status === "fulfilled",
        announcementsResult.status === "fulfilled",
        prayersResult.status === "fulfilled",
        ministriesResult.status === "fulfilled",
        inquiriesResult.status === "fulfilled",
      ];

      setData({
        sermons: sermonsResult.status === "fulfilled" ? extractItems<DatedRecord>(sermonsResult.value) : [],
        events: eventsResult.status === "fulfilled" ? extractItems<DatedRecord>(eventsResult.value) : [],
        announcements: announcementsResult.status === "fulfilled" ? extractItems<DatedRecord>(announcementsResult.value) : [],
        prayerRequests: prayersResult.status === "fulfilled" ? extractItems<DatedRecord>(prayersResult.value) : [],
        ministries: ministriesResult.status === "fulfilled" ? extractItems<DatedRecord>(ministriesResult.value) : [],
        inquiries: inquiriesResult.status === "fulfilled" ? extractItems<DatedRecord>(inquiriesResult.value) : [],
        available,
        loading: false,
      });
    }

    void loadDashboard();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  const recentItems = useMemo(() => toActivityItems(data), [data]);
  const now = currentTime;
  const currentPeriodStart = now - 30 * 24 * 60 * 60 * 1000;
  const today = currentTime ? getKigaliDateKey(new Date(currentTime)) : "";

  const sermons = Array.isArray(data.sermons) ? data.sermons : [];
  const events = Array.isArray(data.events) ? data.events : [];
  const announcements = Array.isArray(data.announcements) ? data.announcements : [];
  const prayerRequests = Array.isArray(data.prayerRequests) ? data.prayerRequests : [];
  const ministries = Array.isArray(data.ministries) ? data.ministries : [];
  const inquiries = Array.isArray(data.inquiries) ? data.inquiries : [];

  const upcomingEvents = events.filter((event) => Boolean(event.date) && event.date! >= today);
  const recentPrayerRequests = prayerRequests.filter((request) => {
    const createdAt = request.createdAt ? new Date(request.createdAt).getTime() : 0;
    return createdAt >= currentPeriodStart && createdAt <= now;
  });
  const recentInquiries = inquiries.filter((inquiry) => {
    const createdAt = inquiry.createdAt ? new Date(inquiry.createdAt).getTime() : 0;
    return createdAt >= currentPeriodStart && createdAt <= now;
  });

  // Calculate Draft vs Published Breakdown (SRS Section 57)
  const publishedCount =
    sermons.filter((s) => s.status !== "draft").length +
    events.filter((e) => e.status !== "draft").length +
    announcements.filter((a) => a.details?.status === "PUBLISHED" || a.status === "published").length;

  const draftCount =
    sermons.filter((s) => s.status === "draft").length +
    events.filter((e) => e.status === "draft").length +
    announcements.filter((a) => a.details?.status === "DRAFT" || a.status === "draft").length;

  const statDefinitions: Omit<StatCardData, "value" | "change" | "direction" | "comparisonLabel">[] = [
    { title: "Published Sermons", icon: Mic2, tone: "indigo" },
    { title: "Upcoming Events", icon: CalendarDays, tone: "indigo" },
    { title: "Active Ministries", icon: UsersRound, tone: "indigo" },
    { title: "Announcements", icon: Megaphone, tone: "indigo" },
    { title: "New Inquiries", icon: Inbox, tone: "indigo" },
    { title: "Prayer Requests", icon: HandHeart, tone: "indigo" },
  ];
  const metricSources = [
    sermons,
    events,
    ministries,
    announcements,
    inquiries,
    prayerRequests,
  ];
  const metricCounts = [
    sermons.length,
    upcomingEvents.length,
    ministries.length,
    announcements.length,
    recentInquiries.length || inquiries.length,
    recentPrayerRequests.length || prayerRequests.length,
  ];
  const stats: StatCardData[] = statDefinitions.map((definition, index) => {
    const change = getPeriodChange(metricSources[index]);
    const available = data.available[index];
    return {
      ...definition,
      value: data.loading ? "—" : available ? String(metricCounts[index]) : "—",
      change: data.loading ? "Loading" : available ? change.change : "Unavailable",
      direction: data.loading || !available ? "steady" : change.direction,
      comparisonLabel: data.loading ? "" : "vs. prior 30 days",
    };
  });

  const formattedDate = new Intl.DateTimeFormat("en-RW", {
    dateStyle: "full",
    timeZone: "Africa/Kigali",
  }).format(new Date());
  const loadedSources = data.available.filter(Boolean).length;

  return <div>
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Church website management</p>
        <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Dashboard overview</h1>
        <p className="mt-2 text-sm text-slate-500">A snapshot of content and activity across your church website (SRS Section 57).</p>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${data.loading ? "bg-slate-100 text-slate-600" : loadedSources >= 4 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>
          {data.loading ? "Loading data" : loadedSources >= 4 ? "Live data" : `${loadedSources}/6 sources available`}
        </span>
        <time className="text-sm text-slate-500">{formattedDate}</time>
      </div>
    </div>

    {/* Publication Status Summary Banner (SRS Section 57: Published & Draft content) */}
    <div className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:px-6">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
        Content Status Overview:
      </div>
      <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
        <CheckCircle2 className="size-3.5" />
        <span>{publishedCount} Published Records</span>
      </div>
      <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800">
        <FileEdit className="size-3.5" />
        <span>{draftCount} Draft Items</span>
      </div>
      <div className="ml-auto text-xs text-slate-400">
        Automatic sync with database
      </div>
    </div>

    <section aria-label="Church website statistics" className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat) => <StatCardView key={stat.title} stat={stat} />)}
    </section>

    <div className="mb-8"><QuickActionsView /></div>
    <RecentActivityTableView items={recentItems} />
    {!data.loading && loadedSources < 4 && <p className="mt-4 text-xs leading-5 text-slate-500">Some dashboard figures could not be loaded. Refresh the page to try again.</p>}
  </div>;
}
