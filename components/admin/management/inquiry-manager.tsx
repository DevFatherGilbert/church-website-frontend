"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Clock,
  CornerDownRight,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Send,
  X,
} from "lucide-react";
import { authGet, authMutation } from "@/lib/api/church-api";
import { useRealtime, type RealtimeInquiryCreated } from "@/lib/realtime/notifications-context";

type InquiryKind = "contact" | "visitor" | "prayer";
type InquiryStatus = "new" | "in_progress" | "resolved";

type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  status: InquiryStatus;
  reply: string | null;
  repliedAt: string | null;
  createdAt: string;
};

function formatDate(value: string) {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(d);
}

const STATUS_CONFIG: Record<
  InquiryStatus,
  { label: string }
> = {
  new: { label: "New" },
  in_progress: { label: "In Progress" },
  resolved: { label: "Resolved" },
};

function StatusBadge({ status }: { status: InquiryStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.new;
  return (
    <span className={`admin-badge admin-inquiry-status admin-inquiry-status-${status} px-2.5 py-0.5 text-xs font-semibold`}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {cfg.label}
    </span>
  );
}

function ReplyPanel({
  item,
  kind,
  onSaved,
}: {
  item: Inquiry;
  kind: InquiryKind;
  onSaved: (updated: Partial<Inquiry>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(item.reply ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      textareaRef.current?.focus();
    }
  }, [open]);

  async function saveReply() {
    if (!text.trim()) return;
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const result = await authMutation<{
        id: string;
        status: InquiryStatus;
        repliedAt: string;
      }>(`/inquiries/${kind}/${item.id}/reply`, "PATCH", { reply: text.trim() });
      onSaved({ reply: text.trim(), repliedAt: result.repliedAt, status: result.status });
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 1500);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not send reply.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4 border-t border-border pt-4">
      {!open ? (
        <button
          type="button"
          onClick={() => {
            setText(item.reply ?? "");
            setOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-foreground transition hover:border-primary hover:bg-primary/5 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <CornerDownRight className="size-3.5" aria-hidden="true" />
          {item.reply ? "Edit reply" : "Reply directly via email"}
        </button>
      ) : (
        <div className="space-y-3 rounded-2xl border border-border bg-surface-subtle p-4">
          <div className="flex items-center justify-between">
            <label
              htmlFor={`reply-input-${item.id}`}
              className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5"
            >
              <Mail className="size-3.5 text-primary" />
              {item.reply ? "Update Email Reply" : `Reply to ${item.name} (${item.email})`}
            </label>
            {item.repliedAt && (
              <span className="text-xs text-muted">
                Last replied: {formatDate(item.repliedAt)}
              </span>
            )}
          </div>
          <p className="text-xs text-muted">
            Saving this reply will automatically email {item.name} from the church email service.
          </p>
          <textarea
            id={`reply-input-${item.id}`}
            ref={textareaRef}
            className="h-32 w-full resize-y rounded-xl border border-border bg-surface px-3.5 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted/60 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            placeholder={`Dear ${item.name},\n\nThank you for reaching out to us…`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={5000}
          />
          {error && (
            <p className="text-xs text-red-600 font-medium" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="text-xs text-green-700 font-medium flex items-center gap-1" role="status">
              <Check className="size-3.5" />
              Reply delivered to {item.email} and recorded.
            </p>
          )}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-muted">
              {text.length}/5000 characters
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setText(item.reply ?? "");
                  setError("");
                  setSuccess(false);
                }}
                className="rounded-xl border border-border px-3.5 py-2 text-xs font-semibold text-muted transition hover:bg-surface-strong hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving || !text.trim()}
                onClick={saveReply}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="size-3.5 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="size-3.5" />
                    Send Reply
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function InquiryManager({
  section,
}: {
  section: "inquiries" | "prayer-requests";
}) {
  const isPrayer = section === "prayer-requests";
  const [kind, setKind] = useState<InquiryKind>(isPrayer ? "prayer" : "contact");
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"" | InquiryStatus>("");
  const [updatingId, setUpdatingId] = useState("");

  const { connected, onInquiryCreated, onStatusChanged, onReplyCreated } = useRealtime();

  // Load inquiries from backend
  const load = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError("");
    try {
      const data = await authGet<Inquiry[]>(`/inquiries/${kind}`);
      // Deterministic sort: newest first
      const sorted = [...data].sort((a, b) => {
        const timeDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return timeDiff !== 0 ? timeDiff : b.id.localeCompare(a.id);
      });
      setItems(sorted);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load messages.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [kind]);

  useEffect(() => {
    const id = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(id);
  }, [load]);

  // Real-time WebSocket event listeners
  useEffect(() => {
    // 1. When an inquiry is submitted in real time
    const unsubCreated = onInquiryCreated((createdData: RealtimeInquiryCreated) => {
      if (createdData.type === kind) {
        setItems((prev) => {
          // Prevent duplicates
          if (prev.some((item) => item.id === createdData.id)) return prev;
          const newInquiry: Inquiry = {
            id: createdData.id,
            name: createdData.name,
            email: createdData.email,
            phone: createdData.phone ?? null,
            message: createdData.message,
            status: createdData.status ?? "new",
            reply: null,
            repliedAt: null,
            createdAt: createdData.createdAt,
          };
          return [newInquiry, ...prev];
        });
      }
    });

    // 2. When a status changes in real time
    const unsubStatus = onStatusChanged((statusData) => {
      if (statusData.type === kind) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === statusData.id ? { ...item, status: statusData.status } : item,
          ),
        );
      }
    });

    // 3. When an admin reply is saved in real time
    const unsubReply = onReplyCreated((replyData) => {
      if (replyData.type === kind) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === replyData.id
              ? {
                  ...item,
                  reply: replyData.reply,
                  repliedAt: replyData.repliedAt,
                  status: replyData.status,
                }
              : item,
          ),
        );
      }
    });

    return () => {
      unsubCreated();
      unsubStatus();
      unsubReply();
    };
  }, [kind, onInquiryCreated, onStatusChanged, onReplyCreated]);

  async function changeStatus(item: Inquiry, status: InquiryStatus) {
    if (item.status === status) return;
    setUpdatingId(item.id);
    setError("");
    try {
      await authMutation(`/inquiries/${kind}/${item.id}/status`, "PATCH", { status });
      setItems((cur) =>
        cur.map((e) => (e.id === item.id ? { ...e, status } : e)),
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update message status.");
    } finally {
      setUpdatingId("");
    }
  }

  function updateItem(id: string, patch: Partial<Inquiry>) {
    setItems((cur) => cur.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  // Live status counts
  const total = items.length;
  const newCount = items.filter((i) => i.status === "new").length;
  const inProgressCount = items.filter((i) => i.status === "in_progress").length;
  const resolvedCount = items.filter((i) => i.status === "resolved").length;

  // Filtered inquiries
  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchSearch = `${item.name} ${item.email} ${item.phone ?? ""} ${item.message}`
        .toLowerCase()
        .includes(search.trim().toLowerCase());
      const matchStatus = filterStatus ? item.status === filterStatus : true;
      return matchSearch && matchStatus;
    });
  }, [items, search, filterStatus]);

  const title = isPrayer ? "Prayer Requests" : "Inquiries";

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">
              Church · Admin Workspace
            </p>
            <span
              title={connected ? "Real-time updates live" : "Connecting to real-time events…"}
              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                connected
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${
                  connected ? "bg-green-500" : "bg-amber-500"
                }`}
              />
              {connected ? "Live Real-Time" : "Connecting…"}
            </span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-1.5 text-sm leading-6 text-muted">
            {isPrayer
              ? "Receive and reply to private prayer requests with live updates and email delivery."
              : "Review incoming contact messages and visitor planning forms in real time."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void load(true)}
            disabled={loading || refreshing}
            title="Refresh inquiry list"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs font-semibold text-foreground transition hover:bg-surface-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {!isPrayer && (
            <label className="text-xs font-semibold text-foreground">
              <span className="sr-only">Message type</span>
              <select
                aria-label="Filter message category"
                className="h-10 rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                value={kind}
                onChange={(e) => setKind(e.target.value as InquiryKind)}
              >
                <option value="contact">Contact Messages</option>
                <option value="visitor">Visitor Messages</option>
              </select>
            </label>
          )}
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-center justify-between"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="rounded-lg p-1 text-red-600 hover:bg-red-100"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Status-Based Filtering Tabs with Live Badges */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          [
            {
              label: "All Messages",
              count: total,
              key: "" as const,
            },
            {
              label: "New",
              count: newCount,
              key: "new" as const,
            },
            {
              label: "In Progress",
              count: inProgressCount,
              key: "in_progress" as const,
            },
            {
              label: "Resolved",
              count: resolvedCount,
              key: "resolved" as const,
            },
          ] as const
        ).map((tab) => {
          const isActive = filterStatus === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilterStatus(tab.key)}
              aria-pressed={isActive}
              data-status={tab.key || "all"}
              className="admin-card admin-card-interactive admin-status-card flex min-h-24 flex-col p-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <div className="flex items-center justify-between">
                <span className="admin-status-value admin-stat-number text-2xl font-bold tracking-tight">
                  {error || (loading && items.length === 0) ? "—" : tab.count}
                </span>
                <span className="size-2 rounded-full bg-[hsl(var(--admin-status-color))]" aria-hidden="true" />
              </div>
              <span className="admin-status-label mt-1 text-xs font-semibold">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Inquiries List & Search */}
      <section
        className="admin-card overflow-hidden"
        aria-label={`${title} Inbox`}
      >
        {/* Controls bar */}
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 bg-surface-subtle">
          <div>
            <h2 className="font-display text-base font-bold text-foreground">
              {isPrayer
                ? "Prayer Inbox"
                : kind === "contact"
                ? "General Inquiries Inbox"
                : "Visitor Inquiries Inbox"}
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              Showing {filtered.length} of {total} inquiry
              {total === 1 ? "" : "s"}
              {filterStatus && ` · filtered by ${STATUS_CONFIG[filterStatus]?.label}`}
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted" />
            <input
              type="search"
              aria-label={`Search ${title}`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sender, email, text…"
              className="h-10 w-full rounded-xl border border-border bg-surface pl-9.5 pr-8 text-xs text-foreground placeholder:text-muted/60 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search query"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content list */}
        {loading ? (
          <div className="flex items-center justify-center p-12 text-sm text-muted">
            <RefreshCw className="mr-2 size-4 animate-spin text-primary" />
            Loading live messages…
          </div>
        ) : filtered.length ? (
          <div className="divide-y divide-border">
            {filtered.map((item) => (
              <article
                key={item.id}
                className="p-5 sm:p-6 transition hover:bg-surface-subtle/50"
              >
                {/* Header line: Sender info + Status + Time */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-base font-bold text-foreground">
                        {item.name}
                      </h3>
                      <StatusBadge status={item.status} />
                      {item.reply && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
                          <Check className="size-3" />
                          Replied
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted">
                      <a
                        href={`mailto:${item.email}`}
                        className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                      >
                        <Mail className="size-3 text-muted" />
                        {item.email}
                      </a>
                      {item.phone && (
                        <a
                          href={`tel:${item.phone}`}
                          className="inline-flex items-center gap-1 text-muted hover:text-foreground hover:underline"
                        >
                          <Phone className="size-3" />
                          {item.phone}
                        </a>
                      )}
                    </div>
                  </div>

                  <time
                    className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-muted"
                    dateTime={item.createdAt}
                  >
                    <Clock className="size-3 text-muted/70" />
                    {formatDate(item.createdAt)}
                  </time>
                </div>

                {/* Visitor Message Quote */}
                <div className="mt-4 rounded-xl border-l-3 border-amber-400 bg-amber-50/50 p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-amber-700">
                    Visitor Message
                  </p>
                  {item.message}
                </div>

                {/* Admin Reply Quote (if exists) */}
                {item.reply && (
                  <div className="mt-3 rounded-xl border-l-3 border-primary bg-primary/5 p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                    <div className="mb-1 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-primary">
                      <span>Official Church Reply</span>
                      {item.repliedAt && (
                        <span className="font-normal normal-case text-muted">
                          Delivered {formatDate(item.repliedAt)}
                        </span>
                      )}
                    </div>
                    {item.reply}
                  </div>
                )}

                {/* Status Switcher & Reply trigger */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor={`status-select-${item.id}`}
                      className="text-xs font-bold uppercase tracking-wider text-muted"
                    >
                      Status:
                    </label>
                    <select
                      id={`status-select-${item.id}`}
                      aria-label={`Update status for ${item.name}`}
                      disabled={updatingId === item.id}
                      value={item.status}
                      onChange={(e) =>
                        void changeStatus(item, e.target.value as InquiryStatus)
                      }
                      className="h-8.5 rounded-lg border border-border bg-surface px-2.5 text-xs font-semibold text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
                    >
                      <option value="new">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                    {updatingId === item.id && (
                      <RefreshCw className="size-3.5 animate-spin text-primary" />
                    )}
                  </div>
                </div>

                {/* Reply composer component */}
                <ReplyPanel
                  item={item}
                  kind={kind}
                  onSaved={(patch) => updateItem(item.id, patch)}
                />
              </article>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <MessageSquare className="mx-auto size-10 text-muted/40 mb-3" />
            <h3 className="font-display text-base font-bold text-foreground">
              {search || filterStatus ? "No matching messages" : "No inquiries yet"}
            </h3>
            <p className="mt-1 text-xs text-muted max-w-sm mx-auto">
              {search || filterStatus
                ? "Try clearing your search query or switching the status filter tab."
                : "New visitor messages and prayer requests will arrive here automatically in real time."}
            </p>
            {(search || filterStatus) && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setFilterStatus("");
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-strong transition"
              >
                Reset filters
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
