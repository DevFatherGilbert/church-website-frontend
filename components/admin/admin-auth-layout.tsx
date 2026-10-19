"use client";

import type { ReactNode } from "react";
import { useChurchBrand } from "@/components/brand/church-brand-provider";

export function AdminAuthLayout({ children }: { children: ReactNode }) {
  const { churchName } = useChurchBrand();

  return (
    <div className="auth-page-shell flex min-h-screen flex-col text-white">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      />
      <div className="page-container relative z-10 flex flex-1 flex-col justify-center py-8 sm:py-12">{children}</div>
      <footer className="auth-page-footer relative z-10 border-t py-5 text-center text-xs">
        {churchName || "Church"} administration
      </footer>
    </div>
  );
}
