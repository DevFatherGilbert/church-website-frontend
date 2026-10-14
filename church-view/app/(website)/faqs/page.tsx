import type { Metadata } from "next";
import { FaqContentPage } from "@/components/site/faq-content-page";
import { sitePages } from "@/lib/content/site-pages";
import { getPublicData } from "@/lib/api/church-api";

const path = "/faqs";
export const metadata: Metadata = { title: "Frequently asked questions", description: sitePages[path].description, alternates: { canonical: path } };
type PublicFaq = { id: string; question: string; answer: string; category: string | null; displayOrder: number };
type FaqResponse = { items?: PublicFaq[] };
export default async function FAQsPage() {
  const response = await getPublicData<FaqResponse>("/content/faqs?limit=100");
  const faqs = (response?.items ?? []).slice().sort((a, b) => a.displayOrder - b.displayOrder);
  return <FaqContentPage page={sitePages[path]} faqs={faqs}/>;
}
