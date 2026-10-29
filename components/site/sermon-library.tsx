"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BookOpen,
  Download,
  Filter,
  Headphones,
  Mic,
  RotateCcw,
  Search,
  User,
  Video,
} from "lucide-react";
import type { Sermon } from "@/lib/api/church-api";
import { formatSermonDate } from "@/lib/media/video-utils";

export function SermonLibrary({ sermons }: { sermons: Sermon[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [speaker, setSpeaker] = useState("all");
  const [bibleBook, setBibleBook] = useState("all");
  const [series, setSeries] = useState("all");
  const [service, setService] = useState("all");
  const [mediaType, setMediaType] = useState<"all" | "audio" | "video">("all");

  // Extract distinct filter lists from actual published data
  const categories = useMemo(
    () => [...new Set(sermons.map((s) => s.category).filter(Boolean))].sort(),
    [sermons],
  );
  const speakers = useMemo(
    () => [...new Set(sermons.map((s) => s.speaker).filter(Boolean))].sort(),
    [sermons],
  );
  const bibleBooks = useMemo(
    () =>
      [...new Set(sermons.map((s) => s.bibleBook).filter((v): v is string => Boolean(v)))].sort(),
    [sermons],
  );
  const seriesList = useMemo(
    () =>
      [...new Set(sermons.map((s) => s.series).filter((v): v is string => Boolean(v)))].sort(),
    [sermons],
  );

  // Filter sermons
  const visibleSermons = useMemo(() => {
    return sermons.filter((sermon) => {
      const searchTarget = `${sermon.title} ${sermon.speaker} ${sermon.scripture ?? ""} ${sermon.category} ${sermon.series ?? ""} ${sermon.description ?? ""}`.toLowerCase();
      const matchesQuery = !query.trim() || searchTarget.includes(query.trim().toLowerCase());
      const matchesCategory = category === "all" || sermon.category === category;
      const matchesSpeaker = speaker === "all" || sermon.speaker === speaker;
      const matchesBibleBook = bibleBook === "all" || sermon.bibleBook === bibleBook;
      const matchesSeries = series === "all" || sermon.series === series;
      const matchesService = service === "all" || sermon.service === service;
      const matchesMedia =
        mediaType === "all" ||
        (mediaType === "audio" && Boolean(sermon.audioUrl)) ||
        (mediaType === "video" && Boolean(sermon.videoUrl));

      return (
        matchesQuery &&
        matchesCategory &&
        matchesSpeaker &&
        matchesBibleBook &&
        matchesSeries &&
        matchesService &&
        matchesMedia
      );
    });
  }, [sermons, query, category, speaker, bibleBook, series, service, mediaType]);

  const hasActiveFilters =
    query.trim() !== "" ||
    category !== "all" ||
    speaker !== "all" ||
    bibleBook !== "all" ||
    series !== "all" ||
    service !== "all" ||
    mediaType !== "all";

  const resetFilters = () => {
    setQuery("");
    setCategory("all");
    setSpeaker("all");
    setBibleBook("all");
    setSeries("all");
    setService("all");
    setMediaType("all");
  };

  return (
    <div className="space-y-10">
      {/* Search and Filters Section */}
      <section
        aria-label="Sermon filters and search"
        className="surface-card space-y-6 p-6 sm:p-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Filter className="size-5 text-primary" />
              Explore Teaching & Sermons
            </h2>
            <p className="mt-1 text-sm text-muted">
              Filter by preacher, Scripture, sermon topic, or search by biblical keyword.
            </p>
          </div>
          {hasActiveFilters && (
            <button
              className="inline-flex items-center gap-1.5 self-start text-xs font-semibold text-primary hover:text-primary-hover"
              onClick={resetFilters}
              type="button"
            >
              <RotateCcw className="size-3.5" />
              Reset all filters
            </button>
          )}
        </div>

        {/* Primary Search Bar */}
        <div className="relative">
          <Search
            aria-hidden="true"
            className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted"
          />
          <input
            aria-label="Search sermons"
            className="h-12 w-full rounded-md border border-border bg-surface pl-12 pr-4 text-sm outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by sermon title, preacher, Scripture passage (e.g. Hebrews 11), or topic..."
            type="search"
            value={query}
          />
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 text-xs">
          {/* Category Filter */}
          <div>
            <label className="block font-semibold text-muted mb-1.5">Topic / Category</label>
            <select
              aria-label="Filter by category"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-primary"
              onChange={(e) => setCategory(e.target.value)}
              value={category}
            >
              <option value="all">All Topics</option>
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          {/* Speaker Filter */}
          <div>
            <label className="block font-semibold text-muted mb-1.5">Speaker / Pastor</label>
            <select
              aria-label="Filter by speaker"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-primary"
              onChange={(e) => setSpeaker(e.target.value)}
              value={speaker}
            >
              <option value="all">All Preachers</option>
              {speakers.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          {/* Bible Book Filter */}
          <div>
            <label className="block font-semibold text-muted mb-1.5">Bible Book</label>
            <select
              aria-label="Filter by Bible book"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-primary"
              onChange={(e) => setBibleBook(e.target.value)}
              value={bibleBook}
            >
              <option value="all">All Books</option>
              {bibleBooks.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          {/* Sermon Series */}
          <div>
            <label className="block font-semibold text-muted mb-1.5">Sermon Series</label>
            <select
              aria-label="Filter by sermon series"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-primary"
              onChange={(e) => setSeries(e.target.value)}
              value={series}
            >
              <option value="all">All Series</option>
              {seriesList.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          {/* Media Format Filter */}
          <div>
            <label className="block font-semibold text-muted mb-1.5">Media Format</label>
            <select
              aria-label="Filter by media type"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-primary"
              onChange={(e) => setMediaType(e.target.value as "all" | "audio" | "video")}
              value={mediaType}
            >
              <option value="all">All Formats</option>
              <option value="audio">Audio Available</option>
              <option value="video">Video Available</option>
            </select>
          </div>
        </div>

        {/* Results Counter & Active Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-xs text-muted">
          <p>
            Showing <strong className="text-foreground">{visibleSermons.length}</strong> published message{visibleSermons.length === 1 ? "" : "s"}
          </p>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5">
              {category !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                  Topic: {category}
                </span>
              )}
              {speaker !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                  Speaker: {speaker}
                </span>
              )}
              {bibleBook !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                  Book: {bibleBook}
                </span>
              )}
              {series !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-purple-600">
                  Series: {series}
                </span>
              )}
              {mediaType !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                  Format: {mediaType}
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Sermons Grid */}
      {visibleSermons.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleSermons.map((sermon) => {
            const detailHref = `/sermons/${encodeURIComponent(sermon.slug || sermon.id)}`;
            return (
              <article
                className="surface-card group flex flex-col justify-between overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                key={sermon.id}
              >
                <div>
                  {/* Card Thumbnail / Header */}
                  <Link className="relative block aspect-video overflow-hidden bg-primary-dark" href={detailHref}>
                    {sermon.thumbnailUrl ? (
                      <Image
                        alt={sermon.title}
                        className="object-cover transition duration-500 group-hover:scale-105"
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        src={sermon.thumbnailUrl}
                        unoptimized
                      />
                    ) : (
                      <div className="flex size-full flex-col items-center justify-center bg-gradient-to-br from-[#0a1526] via-primary to-[#0a1526] p-6 text-center text-white">
                        <Mic className="mb-2 size-10 text-secondary opacity-80" />
                        <span className="text-xs font-bold tracking-widest text-secondary uppercase">
                          {sermon.category}
                        </span>
                      </div>
                    )}

                    {/* Format Badges on Thumbnail */}
                    <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                      {sermon.audioUrl && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-xs">
                          <Headphones className="size-3 text-secondary" />
                          Audio
                        </span>
                      )}
                      {sermon.videoUrl && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-xs">
                          <Video className="size-3 text-purple-400" />
                          Video
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* Card Body */}
                  <div className="p-6 space-y-3">
                    {/* Meta line */}
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span className="font-bold text-primary uppercase tracking-wider text-[11px]">
                        {sermon.category}
                      </span>
                      <span>{formatSermonDate(sermon.date)}</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-display text-xl font-bold leading-snug tracking-tight text-text">
                      <Link
                        className="transition hover:text-primary-hover focus:outline-none"
                        href={detailHref}
                      >
                        {sermon.title}
                      </Link>
                    </h3>

                    {/* Speaker and Scripture */}
                    <div className="flex flex-col gap-1 text-xs text-muted">
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <User className="size-3.5 text-muted shrink-0" />
                        <span>{sermon.speaker}</span>
                      </div>
                      {sermon.scripture && (
                        <div className="flex items-center gap-1.5 text-muted">
                          <BookOpen className="size-3.5 text-secondary shrink-0" />
                          <span>{sermon.scripture}</span>
                        </div>
                      )}
                    </div>

                    {/* Series Badge */}
                    {sermon.series && (
                      <p className="text-[11px] font-medium text-primary bg-primary/10 rounded px-2 py-1 w-fit">
                        Series: {sermon.series}
                      </p>
                    )}

                    {/* Short Description */}
                    {sermon.description && (
                      <p className="line-clamp-2 text-xs leading-relaxed text-muted pt-1">
                        {sermon.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer / Action */}
                <div className="border-t border-border p-5 sm:p-6 pt-4 flex items-center justify-between">
                  <Link
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover group-hover:translate-x-0.5 transition"
                    href={detailHref}
                  >
                    <span>Listen / View message</span>
                    <span>→</span>
                  </Link>
                  {sermon.allowDownload && sermon.audioUrl && (
                    <span className="text-[11px] text-muted flex items-center gap-1">
                      <Download className="size-3" />
                      Downloadable
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="surface-card border-dashed py-16 text-center">
          <Mic className="mx-auto size-12 text-muted/60" />
          <h3 className="mt-4 text-xl font-bold text-foreground">
            {sermons.length ? "No sermons match your filters" : "No sermons published yet"}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            {sermons.length
              ? "Try clearing some filter options or using different search keywords to find what you need."
              : "Church teachings and messages will appear here once published by the pastoral team."}
          </p>
          {hasActiveFilters && (
            <button
              className="mt-6 inline-flex items-center gap-2 button button-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover shadow-sm transition"
              onClick={resetFilters}
              type="button"
            >
              <RotateCcw className="size-4" />
              Reset filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
