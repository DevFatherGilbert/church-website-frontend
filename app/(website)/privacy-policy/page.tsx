import type { Metadata } from "next";
import { SiteContentPage } from "@/components/site/site-content-page";
import { sitePages } from "@/lib/content/site-pages";

const path = "/privacy-policy";
export const metadata: Metadata = { title: "Privacy policy.", description: sitePages[path].description, alternates: { canonical: path } };
export default function PrivacyPolicyPage() { return <SiteContentPage page={sitePages[path]} path={path} />; }
