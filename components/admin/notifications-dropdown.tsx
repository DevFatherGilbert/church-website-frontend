"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, MessageSquare, Trash2 } from "lucide-react";
import { useRealtime, type RealtimeNotification } from "@/lib/realtime/notifications-context";

function formatTimestamp(iso: string) {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diffSec < 45) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(d);
  } catch {
    return "";
  }
}

export function NotificationsDropdown() {
  const {
    connected,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  } = useRealtime();

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((cur) => !cur)}
        aria-expanded={open}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        className="relative grid size-10 place-items-center rounded-xl border border-border bg-surface text-muted transition hover:bg-surface-strong hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Bell className="size-4.5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex min-w-5 h-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-border bg-surface shadow-xl z-50 overflow-hidden animate-in fade-in-50 slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-surface-subtle">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span
                title={connected ? "Real-time connection active" : "Reconnecting to live server…"}
                className={`inline-block size-2 rounded-full ${
                  connected ? "bg-green-500" : "bg-amber-500 animate-pulse"
                }`}
              />
              {notifications.length > 0 && (
                <>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      title="Mark all as read"
                      className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-surface-strong transition ml-1"
                    >
                      <CheckCheck className="size-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={clearNotifications}
                    title="Clear notifications"
                    className="p-1 rounded-lg text-muted hover:text-red-600 hover:bg-surface-strong transition"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-border">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="size-8 mx-auto text-muted/50 mb-2" />
                <p className="text-sm font-semibold text-foreground">No notifications yet</p>
                <p className="mt-1 text-xs text-muted">
                  New visitor messages and prayer requests will appear here in real time.
                </p>
              </div>
            ) : (
              notifications.map((item: RealtimeNotification) => {
                const targetUrl =
                  item.inquiryType === "prayer"
                    ? "/admin/prayer-requests"
                    : "/admin/inquiries";

                return (
                  <Link
                    key={item.id}
                    href={targetUrl}
                    onClick={() => {
                      markAsRead(item.id);
                      setOpen(false);
                    }}
                    className={`block p-4 transition hover:bg-surface-subtle ${
                      !item.read ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {!item.read && (
                            <span className="size-2 rounded-full bg-primary shrink-0" />
                          )}
                          <p className="text-xs font-bold text-foreground truncate">
                            {item.title}
                          </p>
                        </div>
                        <p className="mt-1 text-xs font-semibold text-primary truncate">
                          From: {item.senderName}
                        </p>
                        <p className="mt-1 text-xs text-muted line-clamp-2 leading-relaxed">
                          {item.message}
                        </p>
                      </div>
                      <time className="shrink-0 text-[10px] font-medium text-muted">
                        {formatTimestamp(item.createdAt)}
                      </time>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border p-2.5 bg-surface-subtle text-center">
            <Link
              href="/admin/inquiries"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-primary hover:underline"
            >
              View all inquiries →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

