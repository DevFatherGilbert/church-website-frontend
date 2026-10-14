import { SiteContentLayout } from "@/components/site/site-content-layout";
import { FaqList } from "@/components/site/faq-list";
import type { SitePage } from "@/lib/content/site-pages";

type PublicFaq = { id: string; question: string; answer: string; category: string | null; displayOrder: number };
export function FaqContentPage({ page, faqs }: { page: SitePage; faqs: PublicFaq[] }) {
  return <SiteContentLayout page={page} path="/faqs"><FaqList faqs={faqs}/></SiteContentLayout>;
}
