import Link from "next/link";

export function PageHero({
  eyebrow,
  title,
  emphasis,
  description,
  breadcrumbs = [],
  compact = true,
}: {
  eyebrow: string;
  title: string;
  emphasis?: string;
  description: string;
  breadcrumbs?: { label: string; href: string }[];
  compact?: boolean;
}) {
  return (
    <section
      className={compact
        ? "relative px-5 pb-0 pt-0 text-text"
        : "relative overflow-hidden bg-gradient-to-b from-primary-dark via-[hsl(var(--brand-primary))] to-primary-dark px-5 pb-14 pt-32 text-primary-foreground sm:pb-18 sm:pt-40 lg:pb-20 lg:pt-44"
      }
      style={compact ? { paddingTop: "calc(var(--site-header-height, 9rem) - 0.5rem)" } : undefined}
    >
      {!compact && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-secondary/15 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-primary-hover/20 blur-3xl"
          />
        </>
      )}

      <div className="page-container relative z-10">
        {!compact && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-300/80">
              {breadcrumbs.map((item, index) => (
                <li key={item.href} className="flex items-center gap-2">
                  {index > 0 && (
                    <span className="text-slate-500" aria-hidden="true">
                      /
                    </span>
                  )}
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-secondary-light"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        )}

        {!compact && (
          <div className="inline-flex items-center gap-2 rounded-full border border-secondary-light/30 bg-secondary-light/10 px-3.5 py-1 text-[11px] font-bold tracking-widest text-secondary-light uppercase backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-secondary animate-pulse" />
            {eyebrow}
          </div>
        )}

        <h1 className={`max-w-4xl font-display font-extrabold leading-[1.08] tracking-[-0.03em] ${
          compact ? "text-xl text-primary sm:text-2xl" : "mt-5 text-[clamp(2.5rem,6vw,4.25rem)] text-white"
        }`}>
          {title}
          {emphasis && (
            <span className={compact
              ? "text-secondary"
              : "bg-gradient-to-r from-secondary-light via-white to-secondary-light bg-clip-text text-transparent"
            }>
              {" "}
              {emphasis}
            </span>
          )}
        </h1>

        {!compact && description && (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            {description}
          </p>
        )}
      </div>

      {/* Subtle bottom separator accent line */}
      {!compact && (
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-secondary/40 to-transparent"
        />
      )}
    </section>
  );
}
