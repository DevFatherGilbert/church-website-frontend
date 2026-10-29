import type { Metadata, Viewport } from "next";
import { connection } from "next/server";
import type { ReactNode } from "react";
import { getPublicWebsiteSettings } from "@/lib/content/website-settings";
import { ChurchBrandProvider } from "@/components/brand/church-brand-provider";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#00387B",
};

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const { churchName, churchDescription, church } = await getPublicWebsiteSettings().catch(() => ({
    churchName: "Church",
    churchDescription: "",
    church: { profile: { logoUrl: "", logoAlt: "Church Logo" } },
  }));
  const name = churchName || "Church";
  const logo = church?.profile?.logoUrl?.trim() || "/logo-c.png";

  return {
    title: { default: name, template: `%s | ${name}` },
    description: churchDescription || "Find church information, services, ministries, events and ways to connect.",
    openGraph: {
      type: "website",
      siteName: name,
      locale: "en_RW",
      images: logo ? [{ url: logo, alt: name }] : undefined,
    },
    icons: { icon: logo, shortcut: logo, apple: logo },
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  await connection();
  const { churchName, churchDescription, church } = await getPublicWebsiteSettings().catch(() => ({
    churchName: "Church",
    churchDescription: "",
    church: { profile: { logoUrl: "", logoAlt: "Church Logo" } },
  }));

  const initialBrand = {
    churchName: churchName || "Church",
    logoUrl: church.profile?.logoUrl?.trim() || "",
    logoAlt: church.profile?.logoAlt || churchName || "Church Logo",
    description: churchDescription || "",
  };

  return (
    <html data-scroll-behavior="smooth" lang="en">
      <body className="antialiased font-sans">
        <ChurchBrandProvider initialBrand={initialBrand}>
          {children}
        </ChurchBrandProvider>
      </body>
    </html>
  );
}
