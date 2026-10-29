"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Calendar,
  Clock,
  Filter,
  RefreshCw,
  Search,
  ShieldAlert,
  User,
} from "lucide-react";
import { authGet } from "@/lib/api/church-api";

type AuditLog = {
  id: string;
  event: string;
  actorId: string | null;
  details: Record<string, unknown>;
  createdAt: string;
};

export function AuditLogManager() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");

  async function fetchLogs() {
    setLoading(true);
    setError(null);
    try {
      const data = await authGet<AuditLog[]>("/audit?limit=100");
      setLogs(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void fetchLogs(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const eventTypes = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((log) => set.add(log.event));
    return Array.from(set);
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        search === "" ||
        log.event.toLowerCase().includes(search.toLowerCase()) ||
        (log.actorId && log.actorId.toLowerCase().includes(search.toLowerCase())) ||
        JSON.stringify(log.details).toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        eventFilter === "all" || log.event === eventFilter;

      return matchesSearch && matchesFilter;
    });
  }, [logs, search, eventFilter]);

  function formatTime(iso: string) {
    try {
      const d = new Date(iso);
      return d.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return iso;
    }
  }

  function getBadgeColor(event: string) {
    if (event.includes("LOGIN") || event.includes("AUTH")) {
      return "bg-blue-100 text-blue-800 border-blue-200";
    }
    if (event.includes("CREATE") || event.includes("NEW")) {
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    }
    if (event.includes("DELETE") || event.includes("REMOVE")) {
      return "bg-rose-100 text-rose-800 border-rose-200";
    }
    if (event.includes("UPDATE") || event.includes("MODIFY")) {
      return "bg-amber-100 text-amber-800 border-amber-200";
    }
    return "bg-slate-100 text-slate-800 border-slate-200";
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <Activity className="size-6 text-primary" />
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Audit & Activity Logs
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted">
            Immutable log of administrative events, authentications, and inquiry activity (SRS Section 78).
          </p>
        </div>

        <button
          onClick={() => void fetchLogs()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-foreground shadow-xs transition hover:bg-surface-strong disabled:opacity-50"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="admin-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events, actor ID, or details..."
            className="h-10 w-full rounded-xl border border-border bg-surface-strong/40 pl-10 pr-4 text-sm text-foreground placeholder:text-muted focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted" />
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="h-10 rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
          >
            <option value="all">All Events ({logs.length})</option>
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <ShieldAlert className="size-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Logs Table / Card List */}
      <div className="admin-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-muted">
            <RefreshCw className="mx-auto size-6 animate-spin text-primary" />
            <p className="mt-3 font-semibold">Loading audit logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted">
            <Activity className="mx-auto size-8 text-muted/40" />
            <p className="mt-3 font-semibold text-foreground">No activity logs recorded yet</p>
            <p className="mt-1 text-xs text-muted">
              Administrative logins, content publishing, and inquiry updates will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex flex-col gap-3 p-4 transition-colors hover:bg-surface-strong/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-bold tracking-wide uppercase ${getBadgeColor(
                        log.event
                      )}`}
                    >
                      {log.event}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted">
                      <Clock className="size-3" />
                      {formatTime(log.createdAt)}
                    </span>
                  </div>

                  {log.actorId && (
                    <p className="flex items-center gap-1.5 text-xs text-muted font-medium">
                      <User className="size-3 text-muted" />
                      Actor ID: <span className="font-mono text-foreground">{log.actorId}</span>
                    </p>
                  )}

                  {log.details && Object.keys(log.details).length > 0 && (
                    <details className="text-xs text-muted">
                      <summary className="cursor-pointer font-semibold hover:text-primary">
                        View event details
                      </summary>
                      <pre className="mt-1 max-h-40 overflow-auto rounded-lg bg-slate-900 p-2.5 font-mono text-[11px] text-slate-200">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>

                <div className="shrink-0 text-right text-[11px] font-mono text-muted">
                  {log.id.slice(0, 8)}...
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
