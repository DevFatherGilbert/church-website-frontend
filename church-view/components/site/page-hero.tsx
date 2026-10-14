import Link from "next/link";

export function PageHero({
  eyebrow,
  title,
  emphasis,
  description,
  breadcrumbs = [],
}: {
  eyebrow: string;
  title: string;
  emphasis?: string;
  description: string;
  breadcrumbs?: { label: string; href: string }[];
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0a1526] via-[#0f213f] to-[#0d1d36] px-5 pb-14 pt-32 text-primary-foreground sm:pb-18 sm:pt-40 lg:pb-20 lg:pt-44">
      {/* Ambient background glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl"
      />

      <div className="page-container relative z-10">
        {breadcrumbs.length > 0 && (
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
                    className="transition-colors hover:text-amber-400"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-3.5 py-1 text-[11px] font-bold tracking-widest text-secondary uppercase backdrop-blur-sm">
          <span className="size-1.5 rounded-full bg-secondary animate-pulse" />
          {eyebrow}
        </div>

        <h1 className="mt-5 max-w-4xl font-display text-[clamp(2.5rem,6vw,4.25rem)] font-extrabold leading-[1.08] tracking-[-0.03em] text-white">
          {title}
          {emphasis && (
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              {" "}
              {emphasis}
            </span>
          )}
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
          {description}
        </p>
      </div>

      {/* Subtle bottom separator accent line */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"
      />
    </section>
  );
}

