import type { Metadata } from "next";
import { connection } from "next/server";
import type { ReactNode } from "react";
import { Inter, Manrope } from "next/font/google";
import { getPublicWebsiteSettings } from "@/lib/content/website-settings";
import { ChurchBrandProvider } from "@/components/brand/church-brand-provider";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const { churchName, churchDescription, church } = await getPublicWebsiteSettings().catch(() => ({
    churchName: "Church",
    churchDescription: "",
    church: { profile: { logoUrl: "/logo-c.png", logoAlt: "Church Logo" } },
  }));
  const name = churchName || "Church";
  const logo = church?.profile?.logoUrl || "/logo-c.png";

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
    church: { profile: { logoUrl: "/logo-c.png", logoAlt: "Church Logo" } },
  }));

  const initialBrand = {
    churchName: churchName || "Church",
    logoUrl: church.profile?.logoUrl || "/logo-c.png",
    logoAlt: church.profile?.logoAlt || churchName || "Church Logo",
    description: churchDescription || "",
  };

  return (
    <html data-scroll-behavior="smooth" lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Finger+Paint&display=swap" rel="stylesheet" />
      </head>
      <body className={`${manrope.variable} ${inter.variable} antialiased font-sans`}>
        <ChurchBrandProvider initialBrand={initialBrand}>
          {children}
        </ChurchBrandProvider>
      </body>
    </html>
  );
}
