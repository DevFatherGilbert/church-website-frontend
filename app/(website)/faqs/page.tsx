import type { Metadata } from "next";
import { FaqContentPage } from "@/components/site/faq-content-page";
import { sitePages } from "@/lib/content/site-pages";
import { getPublicData } from "@/lib/api/church-api";

import { defaultFaqs } from "@/lib/content/default-faqs";

const path = "/faqs";
export const metadata: Metadata = { title: "Frequently asked questions", description: sitePages[path].description, alternates: { canonical: path } };
type PublicFaq = { id: string; question: string; answer: string; category: string | null; displayOrder: number };
type FaqResponse = { items?: PublicFaq[] };
export const revalidate = 300;

export default async function FAQsPage() {
  const response = await getPublicData<FaqResponse>("/content/faqs?limit=100").catch(() => null);
  const items = response?.items && response.items.length > 0 ? response.items : defaultFaqs;
  const faqs = items.slice().sort((a, b) => a.displayOrder - b.displayOrder);

  const faqJsonLd = faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  } : null;

  return (
    <>
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <FaqContentPage page={sitePages[path]} faqs={faqs} />
    </>
  );
}
