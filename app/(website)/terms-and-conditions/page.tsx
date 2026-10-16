import type { Metadata } from "next";
import { SiteContentPage } from "@/components/site/site-content-page";
import { sitePages } from "@/lib/content/site-pages";

const path = "/terms-and-conditions";
export const metadata: Metadata = { title: "Terms and conditions.", description: sitePages[path].description, alternates: { canonical: path } };
export default function TermsPage() { return <SiteContentPage page={sitePages[path]} path={path} />; }
