"use client";

import Link from "next/link";
import { Heart, Users, BookOpen, Sparkles, ChevronRight } from "lucide-react";
import type { HomepageLinkCard } from "@/lib/content/website-settings";

export function ArrangedAudienceStrip({ cards }: { cards: HomepageLinkCard[] }) {
  const iconById: Record<string, typeof Heart> = { visitor: Heart, member: Users, sermons: BookOpen, prayer: Sparkles };
  const visibleCards = cards.filter((item) => item.visible).sort((left, right) => left.order - right.order);
  if (!visibleCards.length) return null;

  return (
    <section aria-label="Quick Access Gateways" className="relative z-20 border-b border-border/80 bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Desktop: 4-column balanced grid with border dividers; Mobile: horizontal swipeable snap strip */}
        <div className="flex overflow-x-auto py-3 gap-3 scrollbar-none snap-x snap-mandatory sm:py-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-border/60">
          {visibleCards.map((item) => {
            const Icon = iconById[item.id] ?? Sparkles;
            return (
              <Link
                key={item.id}
                href={item.href}
                className="group relative flex min-w-[280px] flex-1 flex-col justify-between rounded-xl border border-border/70 bg-surface p-5 transition-all duration-300 hover:border-secondary/50 hover:bg-surface-strong/50 hover:shadow-md sm:min-w-0 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-6 lg:p-7 snap-start"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-secondary">
                      {item.eyebrow}
                    </span>
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-secondary group-hover:scale-105">
                      <Icon className="size-4" aria-hidden="true" />
                    </div>
                  </div>

                  <h3 className="mt-3 font-display text-lg font-bold text-text group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>

                  <p className="mt-1.5 text-xs leading-relaxed text-muted line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-primary group-hover:text-secondary transition-colors">
                  <span>{item.cta}</span>
                  <ChevronRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
