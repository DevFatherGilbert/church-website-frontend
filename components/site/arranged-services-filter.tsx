"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock3, MapPin, ArrowUpRight, Calendar, Sparkles } from "lucide-react";
import { formatServiceDate, formatServiceTime, type ChurchService } from "@/lib/content/services";

export function ArrangedServicesFilter({ services }: { services: ChurchService[] }) {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const categories = [
    { id: "all", label: "All Gatherings" },
    { id: "worship", label: "Divine Service" },
    { id: "study", label: "Sabbath School & Bible Study" },
    { id: "prayer", label: "Prayer & Midweek" },
    { id: "youth", label: "Youth & Fellowship" },
  ];

  const filteredServices = services.filter((service) => {
    if (selectedFilter === "all") return true;
    const type = (service.serviceType || "").toLowerCase();
    const title = (service.title || "").toLowerCase();
    const desc = (service.description || "").toLowerCase();
    const combined = `${type} ${title} ${desc}`;

    if (selectedFilter === "worship") {
      return combined.includes("worship") || combined.includes("divine") || combined.includes("main");
    }
    if (selectedFilter === "study") {
      return combined.includes("study") || combined.includes("school") || combined.includes("bible");
    }
    if (selectedFilter === "prayer") {
      return combined.includes("prayer") || combined.includes("midweek") || combined.includes("vesper");
    }
    if (selectedFilter === "youth") {
      return combined.includes("youth") || combined.includes("children") || combined.includes("fellowship");
    }
    return true;
  });

  const displayList = filteredServices.length > 0 ? filteredServices : services;

  return (
    <div className="mt-8 space-y-8">
      {/* ── Category Filter Tabs (BK.rw style) ── */}
      <div className="flex overflow-x-auto pb-2 scrollbar-none gap-2 sm:flex-wrap">
        {categories.map((cat) => {
          const active = selectedFilter === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedFilter(cat.id)}
              className={`min-h-11 whitespace-nowrap rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                active
                  ? "bg-primary text-white shadow-md scale-100"
                  : "bg-white border border-stone-200/90 text-stone-700 hover:border-primary/40 hover:bg-stone-50"
              }`}
              type="button"
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* ── Arranged Cards Grid (Responsive 1/2/3 cols) ── */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {displayList.map((service) => {
          const isMainWorship =
            (service.serviceType || "").toLowerCase().includes("worship") ||
            (service.title || "").toLowerCase().includes("divine");

          return (
            <article
              key={service.id}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                isMainWorship
                  ? "border-primary/30 ring-1 ring-primary/10 shadow-sm"
                  : "border-stone-200/80 shadow-xs"
              }`}
            >
              {isMainWorship && (
                <div className="absolute top-0 right-0 rounded-bl-xl bg-primary px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-secondary">
                  Primary Gathering
                </div>
              )}

              <div>
                {/* Badge Row */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/15 border border-secondary/30 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-primary">
                    <Sparkles className="size-3 text-secondary" />
                    {service.serviceType || "Regular Service"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500">
                    <Calendar className="size-3.5 text-primary" />
                    {formatServiceDate(service)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="mt-4 font-display text-2xl font-bold text-stone-900 group-hover:text-primary transition-colors line-clamp-2">
                  {service.title}
                </h3>

                {/* Time Badge */}
                <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-stone-50 px-3 py-1.5 border border-stone-200/70 text-xs font-bold text-primary">
                  <Clock3 className="size-4 text-primary" />
                  <span>{formatServiceTime(service)}</span>
                </div>

                {/* Description */}
                {service.description && (
                  <p className="mt-3.5 text-xs sm:text-sm leading-relaxed text-muted line-clamp-3">
                    {service.description}
                  </p>
                )}

                {/* Instructions / Focus */}
                {service.instructions && (
                  <p className="mt-2 text-xs italic text-stone-500">
                    {service.instructions}
                  </p>
                )}
              </div>

              {/* Card Footer */}
              <div className="mt-6 border-t border-stone-100 pt-4">
                <div className="flex items-center justify-between gap-2">
                  {service.location ? (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-stone-600 truncate max-w-[65%]">
                      <MapPin className="size-3.5 shrink-0 text-primary" />
                      <span className="truncate">{service.location}</span>
                    </span>
                  ) : (
                    <span className="text-xs text-muted">Main Sanctuary</span>
                  )}

                  <Link
                    href="/plan-your-visit"
                    className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary hover:text-primary-hover group-hover:underline"
                  >
                    Plan Visit <ArrowUpRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
