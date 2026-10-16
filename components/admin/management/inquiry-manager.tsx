"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { authGet, authMutation } from "@/lib/api/church-api";

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
    : new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

const STATUS_CONFIG: Record<
  InquiryStatus,
  { label: string; dot: string; badge: string }
> = {
  new: {
    label: "New",
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
  in_progress: {
    label: "In progress",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
  resolved: {
    label: "Resolved",
    dot: "bg-green-500",
    badge: "bg-green-50 text-green-700 border-green-200",
  },
};

function StatusBadge({ status }: { status: InquiryStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.new;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.badge}`}
    >
      <span className={`size-1.5 rounded-full ${cfg.dot}`} />
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
  const [open, setOpen] = useState(item.reply ? true : false);
  const [text, setText] = useState(item.reply ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open && !item.reply) textareaRef.current?.focus();
  }, [open, item.reply]);

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
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save reply.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-primary hover:border-primary hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
          {item.reply ? "Edit reply" : "Reply"}
        </button>
      ) : (
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
            {item.reply ? "Edit your reply" : "Write a reply"}
            {item.repliedAt && (
              <span className="ml-2 font-normal normal-case tracking-normal text-slate-400">
                — last replied {formatDate(item.repliedAt)}
              </span>
            )}
          </label>
          <textarea
            ref={textareaRef}
            className="h-28 w-full resize-y rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm leading-relaxed text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            placeholder={`Write your reply to ${item.name}…`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={5000}
          />
          {error && (
            <p className="text-xs text-red-600" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="text-xs text-green-600" role="status">
              Reply saved successfully.
            </p>
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={saving || !text.trim()}
              onClick={saveReply}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save reply"}
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); setText(item.reply ?? ""); setError(""); setSuccess(false); }}
              className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
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
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"" | InquiryStatus>("");
  const [updatingId, setUpdatingId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setItems(await authGet<Inquiry[]>(`/inquiries/${kind}`));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load messages.");
    } finally {
      setLoading(false);
    }
  }, [kind]);

  useEffect(() => {
    const id = setTimeout(() => { void load(); }, 0);
    return () => clearTimeout(id);
  }, [load]);

  async function changeStatus(item: Inquiry, status: InquiryStatus) {
    setUpdatingId(item.id);
    setError("");
    try {
      await authMutation(`/inquiries/${kind}/${item.id}/status`, "PATCH", { status });
      setItems((cur) =>
        cur.map((e) => (e.id === item.id ? { ...e, status } : e))
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update this message.");
    } finally {
      setUpdatingId("");
    }
  }

  function updateItem(id: string, patch: Partial<Inquiry>) {
    setItems((cur) => cur.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  // Stats
  const total = items.length;
  const newCount = items.filter((i) => i.status === "new").length;
  const inProgressCount = items.filter((i) => i.status === "in_progress").length;
  const resolvedCount = items.filter((i) => i.status === "resolved").length;

  const filtered = items.filter((item) => {
    const matchSearch = `${item.name} ${item.email} ${item.message}`
      .toLowerCase()
      .includes(search.trim().toLowerCase());
    const matchStatus = filterStatus ? item.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const title = isPrayer ? "Prayer requests" : "Inquiries";

  return (
    <div>
      {/* Page header */}
      <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">
            Church · Admin workspace
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {isPrayer
              ? "Read private prayer requests and track follow-up."
              : "Review messages from people contacting or planning to visit the church."}
          </p>
        </div>
        {!isPrayer && (
          <label className="text-sm font-semibold text-slate-700">
            Message type
            <select
              className="mt-2 h-11 min-w-44 rounded-xl border border-slate-300 bg-white px-3.5 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
              value={kind}
              onChange={(e) => setKind(e.target.value as InquiryKind)}
            >
              <option value="contact">Contact messages</option>
              <option value="visitor">Visitor messages</option>
            </select>
          </label>
        )}
      </header>

      {error && (
        <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}

      {/* Status overview cards */}
      {!loading && total > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(
            [
              { label: "Total", count: total, key: "" as const, color: "text-slate-700 bg-white border-slate-200" },
              { label: "New", count: newCount, key: "new" as const, color: "text-blue-700 bg-blue-50 border-blue-200" },
              { label: "In progress", count: inProgressCount, key: "in_progress" as const, color: "text-amber-700 bg-amber-50 border-amber-200" },
              { label: "Resolved", count: resolvedCount, key: "resolved" as const, color: "text-green-700 bg-green-50 border-green-200" },
            ] as const
          ).map((stat) => (
            <button
              key={stat.key}
              type="button"
              onClick={() => setFilterStatus(filterStatus === stat.key ? "" : stat.key)}
              className={[
                "flex flex-col rounded-2xl border p-4 text-left transition-all hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20",
                stat.color,
                filterStatus === stat.key ? "ring-2 ring-primary/40 shadow-sm" : "",
              ].join(" ")}
              aria-pressed={filterStatus === stat.key}
            >
              <span className="text-2xl font-bold">{stat.count}</span>
              <span className="mt-1 text-xs font-semibold">{stat.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Inbox */}
      <section
        className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
        aria-label={`${title} list`}
      >
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              {isPrayer ? "Prayer inbox" : kind === "contact" ? "Contact inbox" : "Visitor inbox"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {filtered.length} of {total} message{total === 1 ? "" : "s"}
              {filterStatus && ` · filtered by "${STATUS_CONFIG[filterStatus]?.label}"`}
            </p>
          </div>
          <input
            aria-label={`Search ${title}`}
            className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition sm:max-w-sm"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search messages…"
            value={search}
          />
        </div>

        {loading ? (
          <p className="p-8 text-sm text-slate-500">Loading messages…</p>
        ) : filtered.length ? (
          <div className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <article
                className="p-5 sm:p-6"
                key={item.id}
              >
                {/* Top row: sender info + date + status */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-base font-bold text-slate-900">{item.name}</h3>
                      <StatusBadge status={item.status as InquiryStatus} />
                      {item.reply && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 border border-violet-200 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
                          Replied
                        </span>
                      )}
                    </div>
                    <p className="mt-1 break-all text-sm font-semibold text-primary">
                      <a href={`mailto:${item.email}`} className="hover:underline">{item.email}</a>
                      {item.phone && (
                        <> · <a href={`tel:${item.phone}`} className="hover:underline">{item.phone}</a></>
                      )}
                    </p>
                  </div>
                  <time className="shrink-0 text-xs font-medium text-slate-400" dateTime={item.createdAt}>
                    {formatDate(item.createdAt)}
                  </time>
                </div>

                {/* Message body */}
                <p className="mt-4 whitespace-pre-wrap rounded-r-xl border-l-2 border-amber-400 bg-amber-50/40 p-4 text-sm leading-relaxed text-slate-700">
                  {item.message}
                </p>

                {/* Existing reply preview */}
                {item.reply && (
                  <div className="mt-3 whitespace-pre-wrap rounded-r-xl border-l-2 border-violet-400 bg-violet-50/40 p-4 text-sm leading-relaxed text-slate-700">
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-violet-500">Admin reply</p>
                    {item.reply}
                  </div>
                )}

                {/* Bottom row: status control + reply */}
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status
                    <select
                      aria-label={`Status for ${item.name}`}
                      className="h-9 rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs font-semibold normal-case tracking-normal text-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
                      disabled={updatingId === item.id}
                      onChange={(e) => void changeStatus(item, e.target.value as InquiryStatus)}
                      value={item.status}
                    >
                      <option value="new">New</option>
                      <option value="in_progress">In progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </label>
                </div>

                {/* Reply panel */}
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
            <h3 className="font-display text-lg font-bold text-slate-900">
              {search || filterStatus ? "No matching messages" : "No messages yet"}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {search || filterStatus
                ? "Try adjusting the search or filter."
                : "Submitted messages will appear here."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
