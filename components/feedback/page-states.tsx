"use client";

export function LoadingState({ label = "Loading church information…" }: { label?: string }) {
  return <div className="page-container py-16" role="status"><span className="sr-only">{label}</span><div aria-hidden="true" className="h-2 max-w-sm overflow-hidden bg-surface-strong"><div className="h-full w-1/3 animate-pulse bg-primary" /></div><p className="mt-3 text-sm text-muted">{label}</p></div>;
}

export function ErrorState({ reset }: { reset: () => void }) {
  return <section className="page-container py-16" role="alert"><p className="eyebrow text-clay">SOMETHING WENT WRONG</p><h1 className="mt-3 text-2xl font-semibold">This page could not load.</h1><p className="mt-2 text-sm text-muted">Please try again. If the issue continues, contact the church.</p><button className="button button-primary mt-5" onClick={reset} type="button">Try again</button></section>;
}
