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
      <HeaderView
        churchName={churchName || "Church"}
        logoUrl={church.profile.logoUrl || "/logo-c.png"}
        logoAlt={church.profile.logoAlt || churchName || "Church logo"}
        phone={church.contact.phone}
      />
      {children}
      <SiteFooter />
    </div>
  );
}
