import type { ReactNode } from "react";
import { connection } from "next/server";
import { SiteFooter } from "./site-footer";
import { HeaderView } from "./Header";
import { getPublicWebsiteSettings } from "@/lib/content/website-settings";

export async function SiteChrome({ children }: { children: ReactNode }) {
  await connection();
  const { churchName, church } = await getPublicWebsiteSettings();

  return (
    <div id="top">
      {/* Skip to main content link for keyboard accessibility (SRS Section 70) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-amber-400 focus:px-4 focus:py-2.5 focus:text-xs focus:font-extrabold focus:uppercase focus:tracking-wider focus:text-stone-950 focus:shadow-2xl focus:outline-none focus:ring-2 focus:ring-stone-950"
      >
        Skip to main content
      </a>
      <HeaderView
        churchName={churchName || "Church"}
        logoUrl={church.profile.logoUrl || "/logo-c.png"}
        logoAlt={church.profile.logoAlt || churchName || "Church logo"}
        phone={church.contact.phone}
      />
      <div id="main-content">{children}</div>
      <SiteFooter />
    </div>
  );
}
