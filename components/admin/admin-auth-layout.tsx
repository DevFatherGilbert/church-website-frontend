import type { ReactNode } from "react";
import Link from "next/link";
import { ChurchLogo } from "@/components/brand/church-logo";

export function AdminAuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      />
      <header className="border-b border-border bg-surface/95">
        <div className="page-container flex min-h-20 items-center justify-between gap-4">
          <Link href="/" aria-label="Church home" className="flex items-center gap-3">
            <ChurchLogo className="size-11 object-contain" priority />
            <span className="font-display text-xl font-semibold tracking-tight sm:text-2xl">Church</span>
          </Link>
          <Link className="text-sm font-semibold text-muted transition-colors hover:text-primary" href="/">
            Return to website <span aria-hidden="true">→</span>
          </Link>
        </div>
      </header>
      <div className="page-container flex flex-1 flex-col justify-center py-8 sm:py-12">{children}</div>
      <footer className="border-t border-border py-5 text-center text-xs text-muted">Church administration</footer>
    </div>
  );
}
