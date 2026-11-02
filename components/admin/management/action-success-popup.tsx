"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Sparkles, X, Globe, Save } from "lucide-react";

export interface ActionSuccessData {
  id?: string;
  name: string;
  action: "published" | "saved" | "created" | "updated" | "deleted";
  message?: string;
}

export function useActionSuccess() {
  const [successData, setSuccessData] = useState<ActionSuccessData | null>(null);

  const showSuccess = (data: ActionSuccessData) => {
    setSuccessData(data);
  };

  const dismissSuccess = () => {
    setSuccessData(null);
  };

  useEffect(() => {
    if (!successData) return;
    const timer = setTimeout(() => {
      setSuccessData(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [successData]);

  return {
    successData,
    showSuccess,
    dismissSuccess,
    recentlyUpdatedId: successData?.id,
  };
}

export function ActionSuccessPopup({
  data,
  onDismiss,
}: {
  data: ActionSuccessData | null;
  onDismiss: () => void;
}) {
  if (!data) return null;

  const isPublished = data.action === "published";
  const isDeleted = data.action === "deleted";

  return (
    <aside
      aria-label="Action confirmation"
      aria-live="polite"
      className="fixed top-6 left-1/2 z-[150] -translate-x-1/2 w-[min(92vw,32rem)] pointer-events-auto"
    >
      <div
        className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-6 ${
          isDeleted
            ? "border-rose-200 bg-rose-50/95 text-rose-950 shadow-rose-900/10"
            : isPublished
              ? "border-emerald-300/80 bg-white/95 text-slate-900 shadow-emerald-600/15 ring-1 ring-emerald-500/20"
              : "border-sky-300/80 bg-white/95 text-slate-900 shadow-sky-600/15 ring-1 ring-sky-500/20"
        }`}
      >
        {/* Glow accent bar at top */}
        <div
          className={`absolute inset-x-0 top-0 h-1.5 ${
            isDeleted
              ? "bg-rose-500"
              : isPublished
                ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600"
                : "bg-gradient-to-r from-sky-500 via-indigo-400 to-sky-600"
          }`}
        />

        <div className="flex items-start gap-3.5">
          <div
            className={`grid size-11 shrink-0 place-items-center rounded-xl shadow-xs ${
              isDeleted
                ? "bg-rose-100 text-rose-600"
                : isPublished
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-sky-100 text-sky-700"
            }`}
          >
            {isDeleted ? (
              <X className="size-5" />
            ) : isPublished ? (
              <Globe className="size-5" />
            ) : (
              <CheckCircle2 className="size-5" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                  isDeleted
                    ? "bg-rose-200/80 text-rose-800"
                    : isPublished
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-sky-100 text-sky-800"
                }`}
              >
                {isPublished ? (
                  <>
                    <Sparkles className="size-3" /> Published
                  </>
                ) : isDeleted ? (
                  "Deleted"
                ) : data.action === "created" ? (
                  <>
                    <Save className="size-3" /> Created
                  </>
                ) : data.action === "updated" ? (
                  <>
                    <Save className="size-3" /> Updated
                  </>
                ) : (
                  <>
                    <Save className="size-3" /> Saved
                  </>
                )}
              </span>
              <span className="text-xs text-slate-500">Just now</span>
            </div>

            <div className="mt-1">
              <p className="font-display text-base font-bold text-slate-900 truncate">
                “{data.name}”
              </p>
              <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                {data.message ||
                  (isPublished
                    ? "Is now published and visible to website visitors."
                    : isDeleted
                      ? "Has been permanently removed."
                      : "Changes have been saved successfully.")}
              </p>
            </div>
          </div>

          <button
            aria-label="Dismiss notification"
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            onClick={onDismiss}
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export function RecordSuccessBadge({
  isCurrent,
  action = "published",
}: {
  isCurrent: boolean;
  action?: "published" | "saved" | "created" | "updated";
}) {
  if (!isCurrent) return null;

  const isPublished = action === "published";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold shadow-xs animate-bounce transition-all ${
        isPublished
          ? "border border-emerald-300 bg-emerald-50 text-emerald-700"
          : "border border-sky-300 bg-sky-50 text-sky-700"
      }`}
    >
      <CheckCircle2 className="size-3" />
      {isPublished ? "Just published!" : "Just saved!"}
    </span>
  );
}
