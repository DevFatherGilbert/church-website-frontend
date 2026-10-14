"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, HelpCircle, Search } from "lucide-react";

type PublicFaq = { id: string; question: string; answer: string; category: string | null; displayOrder: number };

export function FaqList({ faqs }: { faqs: PublicFaq[] }) {
  const [search, setSearch] = useState("");
  const matching = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return term
      ? faqs.filter((faq) => `${faq.question} ${faq.answer} ${faq.category ?? ""}`.toLocaleLowerCase().includes(term))
      : faqs;
  }, [faqs, search]);

  const groups = useMemo(() => {
    const result = new Map<string, PublicFaq[]>();
    for (const faq of matching) {
      const name = faq.category ?? "General Questions";
      result.set(name, [...(result.get(name) ?? []), faq]);
    }
    return [...result.entries()];
  }, [matching]);

  return (
    <div className="mt-8 space-y-8">
      <div className="relative max-w-lg">
        <label className="sr-only" htmlFor="faq-search">
          Search FAQs
        </label>
        <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input
          id="faq-search"
          className="h-12 w-full rounded-xl border border-border bg-surface pl-11 pr-4 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search questions and answers…"
          type="search"
          value={search}
        />
      </div>

      {groups.length ? (
        <div className="space-y-10">
          {groups.map(([group, questions]) => (
            <section aria-label={group} key={group} className="space-y-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="size-4 text-primary" />
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-primary">
                  {group}
                </h3>
              </div>
              <div className="space-y-3">
                {questions.map((faq) => (
                  <details
                    className="group rounded-2xl border border-border bg-surface p-5 shadow-xs transition hover:border-primary/40 open:border-primary/50 open:bg-surface-strong"
                    key={faq.id}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-display text-base font-bold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
                      <span>{faq.question}</span>
                      <ChevronDown
                        aria-hidden="true"
                        className="size-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180 group-open:text-primary"
                      />
                    </summary>
                    <p className="mt-3.5 whitespace-pre-wrap border-t border-border/60 pt-3.5 text-sm leading-relaxed text-muted">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-surface p-8 text-center sm:p-12 shadow-xs">
          <HelpCircle className="mx-auto size-10 text-muted/60" />
          <h3 className="mt-3 font-display text-lg font-bold text-foreground">
            {search ? "No matching answers" : "Answers are on the way"}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
            {search
              ? "We couldn't find anything matching that search. Try a different keyword or contact our team directly."
              : "Our team is preparing approved answers. Please get in touch if we can help with a question."}
          </p>
          <div className="mt-6">
            <Link
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-xs transition hover:bg-primary-hover"
              href="/contact"
            >
              Contact the Church →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

