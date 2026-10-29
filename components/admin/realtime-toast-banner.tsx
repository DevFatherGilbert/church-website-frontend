"use client";

import Link from "next/link";
import { MessageSquare, X } from "lucide-react";
import { useRealtime } from "@/lib/realtime/notifications-context";

export function RealtimeToastBanner() {
  const { activeToast, dismissToast } = useRealtime();

  if (!activeToast) return null;

  const targetUrl =
    activeToast.inquiryType === "prayer"
      ? "/admin/prayer-requests"
      : "/admin/inquiries";

  return (
    <div
      role="status"
      aria-live="polite"
      className="admin-card fixed bottom-5 right-5 z-50 w-[min(24rem,calc(100vw-2.5rem))] p-4"
    >
      <div className="flex items-start gap-3">
        <div className="admin-stat-icon">
          <MessageSquare className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
              {activeToast.title}
            </h4>
            <button
              type="button"
              onClick={dismissToast}
              aria-label="Dismiss alert"
              className="rounded-lg p-1 text-muted hover:bg-surface-strong hover:text-foreground transition"
            >
              <X className="size-3.5" />
            </button>
          </div>
          <p className="mt-0.5 text-sm font-bold text-foreground truncate">
            {activeToast.senderName}
          </p>
          <p className="mt-1 text-xs text-muted line-clamp-2 leading-relaxed">
            {activeToast.message}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Link
              href={targetUrl}
              onClick={dismissToast}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-primary/90 transition"
            >
              Open in Dashboard
            </Link>
            <button
              type="button"
              onClick={dismissToast}
              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-muted hover:bg-surface-strong transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
