"use client";

import Link from "next/link";
import { ArrowRight, Heart, Users, BookOpen, Sparkles } from "lucide-react";
import type { HomepageLinkCard } from "@/lib/content/website-settings";

export function ArrangedAudienceStrip({ cards }: { cards: HomepageLinkCard[] }) {
  const iconById: Record<string, typeof Heart> = { visitor: Heart, member: Users, sermons: BookOpen, prayer: Sparkles };
  const visibleCards = cards.filter((item) => item.visible).sort((left, right) => left.order - right.order);
  if (!visibleCards.length) return null;

  return (
    <section aria-labelledby="homepage-pathways-title" className="bg-white py-14 sm:py-16">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
        <header className="mb-8 max-w-2xl">
          <p className="eyebrow text-primary">Take your next step</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-primary sm:text-4xl" id="homepage-pathways-title">
            Find your place here
          </h2>
          <p className="mt-3 text-base leading-7 text-muted">
            Visiting, finding a community, hearing a message, or looking for prayer? Start here.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visibleCards.map((item) => {
            const Icon = iconById[item.id] ?? Sparkles;
            return (
              <Link
                key={item.id}
                href={item.href}
                className="group flex min-h-56 flex-col rounded-2xl border border-border bg-background p-5 transition duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:p-6"
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
                  {item.eyebrow}
                </p>
                <h3 className="mt-1 font-display text-xl font-bold text-text transition-colors group-hover:text-primary">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {item.description}
                </p>
                <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-primary">
                  {item.cta}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
