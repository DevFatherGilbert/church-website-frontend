import type { ReactNode } from "react";

export function AdminAuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      />
      <div className="page-container flex flex-1 flex-col justify-center py-8 sm:py-12">{children}</div>
      <footer className="border-t border-border py-5 text-center text-xs text-muted">Church administration</footer>
    </div>
  );
}
