"use client";

import { useRouter } from "next/navigation";
import { Church, RefreshCw, WifiOff } from "lucide-react";

export function ServiceUnavailable({ onRetry }: { onRetry?: () => void }) {
  const router = useRouter();

  function retry() {
    if (onRetry) {
      onRetry();
      return;
    }
    router.refresh();
  }

  return (
    <main className="relative isolate flex min-h-[70svh] items-center justify-center overflow-hidden bg-[hsl(var(--brand-primary-dark))] px-5 py-20 text-white sm:px-8">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--brand-secondary)/.2),transparent_42%),radial-gradient(ellipse_at_bottom_left,hsl(var(--brand-primary)/.8),transparent_55%)]" />
      <div className="w-full max-w-2xl text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-secondary shadow-2xl shadow-black/10">
          <Church aria-hidden="true" className="size-8" />
        </div>
        <p className="eyebrow mt-8 text-secondary">A brief pause</p>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          We’ll be back shortly.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/75 sm:text-lg">
          Our website is taking a short rest while we reconnect a few things.
          Please try again in a moment — we look forward to welcoming you back.
        </p>
        <button
          className="button button-secondary mt-8"
          onClick={retry}
          type="button"
        >
          <RefreshCw aria-hidden="true" className="size-4" />
          Try again
        </button>
        <div className="mt-12 inline-flex items-center gap-2 text-sm text-white/55">
          <WifiOff aria-hidden="true" className="size-4" />
          <span>Temporary connection issue</span>
        </div>
        <div aria-hidden="true" className="mx-auto mt-10 flex max-w-xs items-center gap-3 text-white/35">
          <span className="h-px flex-1 bg-white/15" />
          <span className="text-xs font-semibold tracking-[0.2em]">FAITH · HOPE · COMMUNITY</span>
          <span className="h-px flex-1 bg-white/15" />
        </div>
      </div>
    </main>
  );
}
