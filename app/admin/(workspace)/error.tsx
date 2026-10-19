"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function AdminWorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin workspace error:", error);
  }, [error]);

  return (
    <div className="grid min-h-[60vh] place-items-center p-6 text-center">
      <div className="surface-card max-w-md p-8 shadow-lg rounded-2xl border border-border">
        <div className="mx-auto grid size-12 place-items-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 mb-4">
          <AlertTriangle className="size-6" />
        </div>
        <h2 className="font-display text-xl font-bold text-text">
          Something went wrong
        </h2>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          {error?.message || "An unexpected error occurred while loading this workspace section."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            className="button button-primary inline-flex items-center gap-2 text-xs uppercase tracking-wider"
            onClick={() => reset()}
            type="button"
          >
            <RotateCcw className="size-3.5" />
            Try again
          </button>
          <Link
            className="button button-outline text-xs uppercase tracking-wider"
            href="/admin/dashboard"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
