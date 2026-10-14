"use client";

import { useCallback, useEffect, useState } from "react";
import { authGet, authMutation } from "@/lib/api/church-api";

type InquiryKind = "contact" | "visitor" | "prayer";
type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  status: "new" | "in_progress" | "resolved";
  createdAt: string;
};

function formatReceived(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function InquiryManager({ section }: { section: "inquiries" | "prayer-requests" }) {
  const isPrayer = section === "prayer-requests";
  const [kind, setKind] = useState<InquiryKind>(isPrayer ? "prayer" : "contact");
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
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
    const timeoutId = setTimeout(() => { void load(); }, 0);
    return () => clearTimeout(timeoutId);
  }, [load]);

  async function changeStatus(item: Inquiry, status: Inquiry["status"]) {
    setUpdatingId(item.id);
    setError("");
    try {
      await authMutation(`/inquiries/${kind}/${item.id}/status`, "PATCH", { status });
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status } : entry));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update this message.");
    } finally {
      setUpdatingId("");
    }
  }

  const filtered = items.filter((item) => `${item.name} ${item.email} ${item.message}`.toLowerCase().includes(search.trim().toLowerCase()));
  const title = isPrayer ? "Prayer requests" : "Inquiries";

  return <div>
    <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Church · Admin workspace</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 font-normal">{isPrayer ? "Read private prayer requests and track follow-up." : "Review messages from people contacting or planning to visit the church."}</p>
      </div>
      {!isPrayer && <label className="text-sm font-semibold text-slate-700">Message type
        <select className="mt-2 h-11 min-w-44 rounded-xl border border-slate-300 bg-white px-3.5 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition" value={kind} onChange={(event) => setKind(event.target.value as InquiryKind)}>
          <option value="contact">Contact messages</option><option value="visitor">Visitor messages</option>
        </select>
      </label>}
    </header>

    {error && <p className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{error}</p>}

    <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm" aria-label={`${title} list`}>
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div><h2 className="font-display text-lg font-bold text-slate-900">{isPrayer ? "Prayer inbox" : kind === "contact" ? "Contact inbox" : "Visitor inbox"}</h2><p className="mt-1 text-sm text-slate-500">{items.length} message{items.length === 1 ? "" : "s"}</p></div>
        <input aria-label={`Search ${title}`} className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition sm:max-w-sm" onChange={(event) => setSearch(event.target.value)} placeholder="Search messages…" value={search} />
      </div>
      {loading ? <p className="p-8 text-sm text-slate-500">Loading messages…</p> : filtered.length ? <div className="divide-y divide-slate-100">
        {filtered.map((item) => <article className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_12rem]" key={item.id}>
          <div className="min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h3 className="font-display text-base font-bold text-slate-900">{item.name}</h3><p className="mt-1 break-all text-sm font-semibold text-primary"><a href={`mailto:${item.email}`} className="hover:underline">{item.email}</a>{item.phone && <> · <a href={`tel:${item.phone}`} className="hover:underline">{item.phone}</a></>}</p></div>
              <time className="text-xs font-medium text-slate-500" dateTime={item.createdAt}>{formatReceived(item.createdAt)}</time>
            </div>
            <p className="mt-4 whitespace-pre-wrap rounded-r-xl border-l-2 border-amber-500 bg-amber-50/40 p-4 text-sm leading-relaxed text-slate-700">{item.message}</p>
          </div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Follow-up status
            <select aria-label={`Status for ${item.name}`} className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 text-sm font-medium normal-case tracking-normal text-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition" disabled={updatingId === item.id} onChange={(event) => void changeStatus(item, event.target.value as Inquiry["status"])} value={item.status}>
              <option value="new">New</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option>
            </select>
          </label>
        </article>)}
      </div> : <div className="p-12 text-center"><h3 className="font-display text-lg font-bold text-slate-900">{search ? "No matching messages" : "No messages yet"}</h3><p className="mt-2 text-sm text-slate-500">Submitted messages will appear here.</p></div>}
    </section>
  </div>;
}
