import type { ReactNode } from "react";
import { HeaderView } from "@/components/site/Header";
import { getPublicWebsiteSettings } from "@/lib/content/website-settings";

export async function AdminAuthLayout({ children }: { children: ReactNode }) {
  const settings = await getPublicWebsiteSettings();
  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      />
      <HeaderView
        churchName={settings.churchName || "Seventh-day Adventist Fellowship"}
        logoUrl={settings.church.profile.logoUrl || "/logo-c.png"}
        logoAlt={settings.church.profile.logoAlt || settings.churchName || "Church logo"}
        phone={settings.church.contact.phone}
        variant="solid"
      />
      <div className="page-container flex flex-1 flex-col justify-center py-8 sm:py-12">{children}</div>
      <footer className="border-t border-border py-4 text-center text-xs text-muted">Secure church account access</footer>
    </div>
  );
}
