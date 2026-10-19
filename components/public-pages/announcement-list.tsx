"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { PublicContent } from "@/lib/api/church-api";
import {
  announcementCategories,
  announcementCategoryLabel,
} from "@/lib/content/announcements";

const defaultAnnouncementImages: Record<string, string> = {
  general: "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=800&q=80",
  schedule: "https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=800&q=80",
  ministry: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80",
  community: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=800&q=80",
  youth: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=800&q=80",
  worship: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=800&q=80",
};

export function AnnouncementList({ items }: { items: PublicContent[] }) {
  const [category, setCategory] = useState("");
  const filtered = useMemo(
    () => items.filter((item) => !category || item.details.category === category),
    [category, items],
  );

  return (
    <>
      <div aria-label="Filter announcements by category" className="mb-10 flex gap-2.5 overflow-x-auto pb-2" role="group">
        <button
          aria-pressed={!category}
          className={`min-h-10 shrink-0 rounded-full px-5 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
            !category
              ? "bg-primary text-white shadow-md shadow-primary/25"
              : "border border-border/80 bg-surface text-muted hover:border-primary/40 hover:text-text"
          }`}
          onClick={() => setCategory("")}
          type="button"
        >
          All Updates
        </button>
        {announcementCategories.map((option) => (
          <button
            aria-pressed={category === option.value}
            className={`min-h-10 shrink-0 rounded-full px-5 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              category === option.value
                ? "bg-primary text-white shadow-md shadow-primary/25"
                : "border border-border/80 bg-surface text-muted hover:border-primary/40 hover:text-text"
            }`}
            key={option.value}
            onClick={() => setCategory(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>

      {filtered.length ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const categoryValue = typeof item.details.category === "string" ? item.details.category : "general";
            const imageUrl =
              (typeof item.details.imageUrl === "string" && item.details.imageUrl.trim()) ||
              defaultAnnouncementImages[categoryValue] ||
              defaultAnnouncementImages.general;
            const publicationDate = typeof item.details.publicationDate === "string" ? item.details.publicationDate : item.publishedAt;

            return (
              <article
                className="surface-card group flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl border border-primary/10"
                key={item.id}
              >
                <div className="relative aspect-video overflow-hidden bg-stone-900">
                  <Image
                    alt={item.title}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    src={imageUrl}
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-stone-950">
                      {announcementCategoryLabel(categoryValue)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between p-6 sm:p-7">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                      {publicationDate
                        ? new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "Africa/Kigali" }).format(new Date(publicationDate))
                        : "CHURCH UPDATE"}
                    </span>
                    <h2 className="mt-2 font-display text-xl font-bold tracking-tight text-text transition-colors group-hover:text-primary">
                      <Link href={`/announcements/${item.slug}`}>{item.title}</Link>
                    </h2>
                    {item.description && (
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted font-normal">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-border/60">
                    <Link
                      className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-primary transition-colors hover:text-primary-hover group-hover:translate-x-1 transition-transform"
                      href={`/announcements/${item.slug}`}
                    >
                      Read full update <span className="ml-1" aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="eyebrow text-primary">{category ? "NO MATCHING UPDATES" : "STAY IN THE LOOP"}</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-text">
            {category ? "No announcements found" : "News, notes & good things"}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            {category
              ? "Try another category to see more church updates."
              : "Announcements and ministry updates will appear here when they are published. For an urgent question, please get in touch with the church."}
          </p>
          {category ? (
            <button className="button button-primary mt-6" onClick={() => setCategory("")} type="button">
              Show all announcements
            </button>
          ) : (
            <Link className="button button-primary mt-6" href="/contact">
              Contact the church <span>→</span>
            </Link>
          )}
        </div>
      )}
    </>
  );
}
