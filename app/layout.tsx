import type { Metadata } from "next";
import { connection } from "next/server";
import type { ReactNode } from "react";
import { Inter, Manrope } from "next/font/google";
import { getPublicWebsiteSettings } from "@/lib/content/website-settings";
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
  const { churchName, churchDescription } = await getPublicWebsiteSettings();
  const name = churchName || "Church";

  return {
    title: { default: name, template: `%s | ${name}` },
    description: churchDescription || "Find church information, services, ministries, events and ways to connect.",
    openGraph: { type: "website", siteName: name, locale: "en_RW" },
    icons: { icon: "/logo-c.png", shortcut: "/logo-c.png", apple: "/logo-c.png" },
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html data-scroll-behavior="smooth" lang="en">
      <body className={`${manrope.variable} ${inter.variable} antialiased font-sans`}>
        {children}
      </body>
    </html>
  );
}
