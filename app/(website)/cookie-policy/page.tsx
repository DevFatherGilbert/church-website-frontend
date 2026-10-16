import type { Metadata } from "next";
import { SiteContentPage } from "@/components/site/site-content-page";
import { sitePages } from "@/lib/content/site-pages";

const path = "/cookie-policy";
export const metadata: Metadata = { title: "Cookie policy.", description: sitePages[path].description, alternates: { canonical: path } };
export default function CookiePolicyPage() { return <SiteContentPage page={sitePages[path]} path={path} />; }
