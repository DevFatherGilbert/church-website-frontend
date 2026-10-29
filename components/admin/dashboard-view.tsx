"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, HandHeart, Inbox, Megaphone, Mic2, UsersRound, CheckCircle2, FileEdit } from "lucide-react";
import { authGet } from "@/lib/api/church-api";
import { useRealtime } from "@/lib/realtime/notifications-context";
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

type DashboardAvailability = {
  sermons: boolean;
  events: boolean;
  announcements: boolean;
  prayerRequests: boolean;
  ministries: boolean;
  contactInquiries: boolean;
  visitorInquiries: boolean;
};

type DashboardData = {
  sermons: DatedRecord[];
  events: DatedRecord[];
  announcements: DatedRecord[];
  prayerRequests: DatedRecord[];
  ministries: DatedRecord[];
  inquiries: DatedRecord[];
  visitorInquiries: DatedRecord[];
  available: DashboardAvailability;
  loading: boolean;
};

const initialData: DashboardData = {
  sermons: [],
  events: [],
  announcements: [],
  prayerRequests: [],
  ministries: [],
  inquiries: [],
  visitorInquiries: [],
  available: {
    sermons: false,
    events: false,
    announcements: false,
    prayerRequests: false,
    ministries: false,
    contactInquiries: false,
    visitorInquiries: false,
  },
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

function isPublished(record: DatedRecord) {
  const status = record.details?.status ?? record.status;
  return status === undefined || status.toLowerCase() === "published";
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
    const sermonStatus = sermon.status?.toLowerCase();
    items.push({
      id: `sermon-${sermon.id}`,
      title: sermon.title || "Untitled sermon",
      category: "Sermon",
      status: sermonStatus === "draft" ? "Draft" : sermonStatus === "archived" ? "Archived" : "Published",
      ...formatted,
    });
  }

  const events = Array.isArray(data?.events) ? data.events : [];
  for (const event of events) {
    if (!event) continue;
    const rawDate = getActivityTime(event);
    if (!rawDate) continue;
    const formatted = formatActivityDate(rawDate);
    const eventStatus = event.status?.toLowerCase();
    const status = eventStatus === "draft" ? "Draft"
      : eventStatus === "archived" ? "Archived"
        : event.date && event.date >= today ? "Scheduled" : "Published";
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
              : announcementStatus === "DRAFT" || announcement.status?.toLowerCase() === "draft" ? "Draft"
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
  const { connected, onInquiryCreated, onStatusChanged } = useRealtime();

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
        visitorsResult,
      ] = await Promise.allSettled([
        authGet<DatedRecord[]>("/admin/sermons").catch(() => authGet<DatedRecord[]>("/sermons")),
        authGet<DatedRecord[]>("/events"),
        authGet<unknown>("/admin/announcements").catch(() => authGet<unknown>("/content/announcements")),
        authGet<DatedRecord[]>("/inquiries/prayer"),
        authGet<unknown>("/admin/ministries").catch(() => authGet<unknown>("/ministries")),
        authGet<DatedRecord[]>("/inquiries/contact"),
        authGet<DatedRecord[]>("/inquiries/visitor"),
      ]);

      if (cancelled) return;

      setData({
        sermons: sermonsResult.status === "fulfilled" ? extractItems<DatedRecord>(sermonsResult.value) : [],
        events: eventsResult.status === "fulfilled" ? extractItems<DatedRecord>(eventsResult.value) : [],
        announcements: announcementsResult.status === "fulfilled" ? extractItems<DatedRecord>(announcementsResult.value) : [],
        prayerRequests: prayersResult.status === "fulfilled" ? extractItems<DatedRecord>(prayersResult.value) : [],
        ministries: ministriesResult.status === "fulfilled" ? extractItems<DatedRecord>(ministriesResult.value) : [],
        inquiries: inquiriesResult.status === "fulfilled" ? extractItems<DatedRecord>(inquiriesResult.value) : [],
        visitorInquiries: visitorsResult.status === "fulfilled" ? extractItems<DatedRecord>(visitorsResult.value) : [],
        available: {
          sermons: sermonsResult.status === "fulfilled",
          events: eventsResult.status === "fulfilled",
          announcements: announcementsResult.status === "fulfilled",
          prayerRequests: prayersResult.status === "fulfilled",
          ministries: ministriesResult.status === "fulfilled",
          contactInquiries: inquiriesResult.status === "fulfilled",
          visitorInquiries: visitorsResult.status === "fulfilled",
        },
        loading: false,
      });
    }

    void loadDashboard();
    const unsubscribeCreated = onInquiryCreated(() => void loadDashboard());
    const unsubscribeStatusChanged = onStatusChanged(() => void loadDashboard());
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      unsubscribeCreated();
      unsubscribeStatusChanged();
    };
  }, [onInquiryCreated, onStatusChanged]);

  const recentItems = useMemo(() => toActivityItems(data), [data]);
  const today = currentTime ? getKigaliDateKey(new Date(currentTime)) : "";

  const sermons = Array.isArray(data.sermons) ? data.sermons : [];
  const events = Array.isArray(data.events) ? data.events : [];
  const announcements = Array.isArray(data.announcements) ? data.announcements : [];
  const prayerRequests = Array.isArray(data.prayerRequests) ? data.prayerRequests : [];
  const ministries = Array.isArray(data.ministries) ? data.ministries : [];
  const inquiries = Array.isArray(data.inquiries) ? data.inquiries : [];
  const visitorInquiries = Array.isArray(data.visitorInquiries) ? data.visitorInquiries : [];

  const publishedCount = data.available.sermons && data.available.events && data.available.announcements
    ? [...sermons, ...events, ...announcements].filter(isPublished).length
    : null;
  const draftCount = data.available.sermons && data.available.events && data.available.announcements
    ? [...sermons, ...events, ...announcements].filter((record) =>
        record.details?.status?.toLowerCase() === "draft" || record.status?.toLowerCase() === "draft",
      ).length
    : null;

  const stats: StatCardData[] = [
    {
      title: "Published Sermons",
      value: data.available.sermons ? sermons.filter(isPublished).length : null,
      loading: data.loading,
      description: !data.loading && !data.available.sermons ? "Unavailable" : undefined,
      icon: Mic2,
    },
    {
      title: "Upcoming Events",
      value: data.available.events && today
        ? events.filter((event) => isPublished(event) && Boolean(event.date) && event.date! >= today).length
        : null,
      loading: data.loading || !today,
      description: !data.loading && !data.available.events ? "Unavailable" : undefined,
      icon: CalendarDays,
    },
    {
      title: "Active Ministries",
      value: data.available.ministries ? ministries.filter(isPublished).length : null,
      loading: data.loading,
      description: !data.loading && !data.available.ministries ? "Unavailable" : undefined,
      icon: UsersRound,
    },
    {
      title: "Published Announcements",
      value: data.available.announcements ? announcements.filter(isPublished).length : null,
      loading: data.loading,
      description: !data.loading && !data.available.announcements ? "Unavailable" : undefined,
      icon: Megaphone,
    },
    {
      title: "New Inquiries",
      value: data.available.contactInquiries && data.available.visitorInquiries
        ? [...inquiries, ...visitorInquiries].filter((inquiry) => inquiry.status === "new").length
        : null,
      loading: data.loading,
      description: !data.loading && !(data.available.contactInquiries && data.available.visitorInquiries) ? "Unavailable" : undefined,
      icon: Inbox,
    },
    {
      title: "New Prayer Requests",
      value: data.available.prayerRequests
        ? prayerRequests.filter((request) => request.status === "new").length
        : null,
      loading: data.loading,
      description: !data.loading && !data.available.prayerRequests ? "Unavailable" : undefined,
      icon: HandHeart,
    },
  ];

  const formattedDate = new Intl.DateTimeFormat("en-RW", {
    dateStyle: "full",
    timeZone: "Africa/Kigali",
  }).format(new Date());
  const loadedSources = Object.values(data.available).filter(Boolean).length;

  return <div>
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Church website management</p>
        <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Dashboard overview</h1>
        <p className="mt-2 text-sm text-muted">A snapshot of content and activity across your church website (SRS Section 57).</p>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <span className={`admin-state-pill ${data.loading ? "admin-state-pill-neutral" : connected ? "admin-state-pill-success" : loadedSources === 7 ? "admin-state-pill-neutral" : "admin-state-pill-warning"}`}>
          {data.loading ? "Loading data" : connected ? "Live updates" : loadedSources === 7 ? "Data loaded" : `${loadedSources}/7 sources available`}
        </span>
        <time className="text-sm font-medium text-muted">{formattedDate}</time>
      </div>
    </div>

    {/* Publication Status Summary Banner (SRS Section 57: Published & Draft content) */}
    <div className="admin-card mb-6 flex flex-wrap items-center gap-4 p-4 sm:px-6">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
        Content status
      </div>
      <div className="admin-state-pill admin-state-pill-success">
        <CheckCircle2 className="size-3.5" />
        <span>{publishedCount === null ? "—" : publishedCount} published</span>
      </div>
      <div className="admin-state-pill admin-state-pill-warning">
        <FileEdit className="size-3.5" />
        <span>{draftCount === null ? "—" : draftCount} drafts</span>
      </div>
      <div className="ml-auto text-xs text-muted">
        Content records
      </div>
    </div>

    <section aria-label="Church website statistics" className="mb-8 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat) => <StatCardView key={stat.title} stat={stat} />)}
    </section>

    <div className="mb-8"><QuickActionsView /></div>
    <RecentActivityTableView items={recentItems} />
    {!data.loading && loadedSources < 7 && <p className="mt-4 text-xs leading-5 text-muted">Some dashboard figures could not be loaded. Refresh the page to try again.</p>}
  </div>;
}
