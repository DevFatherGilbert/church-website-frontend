import type { ReactNode } from "react";

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-lg bg-current/10 ${className}`} />;
}

function SkeletonSection({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`py-16 sm:py-20 ${className}`}>
      <div className="page-container">{children}</div>
    </section>
  );
}

function SectionHeadingSkeleton() {
  return (
    <div aria-hidden="true" className="max-w-2xl">
      <SkeletonBlock className="h-3 w-32 text-primary" />
      <SkeletonBlock className="mt-4 h-9 w-3/4 text-primary sm:h-11" />
      <SkeletonBlock className="mt-4 h-4 w-full max-w-xl text-muted" />
      <SkeletonBlock className="mt-2 h-4 w-4/5 max-w-lg text-muted" />
    </div>
  );
}

export default function Loading() {
  return (
    <main aria-busy="true" aria-label="Loading homepage">
      <p className="sr-only" role="status">Loading homepage content</p>

      <section
        aria-hidden="true"
        className="relative flex min-h-[min(42rem,calc(100svh-8rem))] items-center overflow-hidden bg-primary-dark py-20 text-white sm:py-24"
      >
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-primary/30 via-transparent to-black/35" />
        <div className="page-container relative z-10 grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-3xl">
            <SkeletonBlock className="h-12 w-full max-w-2xl bg-white/15 sm:h-16 lg:h-20" />
            <SkeletonBlock className="mt-4 h-12 w-4/5 max-w-xl bg-white/15 sm:h-16 lg:h-20" />
            <SkeletonBlock className="mt-7 h-4 w-full max-w-2xl bg-white/15" />
            <SkeletonBlock className="mt-3 h-4 w-4/5 max-w-xl bg-white/15" />
            <div className="mt-9 flex flex-wrap gap-4">
              <SkeletonBlock className="h-12 w-40 rounded-xl bg-white/20" />
              <SkeletonBlock className="h-12 w-36 rounded-xl bg-white/10" />
            </div>
          </div>
          <SkeletonBlock className="hidden aspect-[4/3] w-full rounded-3xl bg-white/10 lg:block" />
        </div>
      </section>

      <SkeletonSection className="bg-surface-strong">
        <SectionHeadingSkeleton />
        <div aria-hidden="true" className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div className="rounded-2xl border border-border bg-white p-6" key={item}>
              <SkeletonBlock className="h-5 w-2/3 text-primary" />
              <SkeletonBlock className="mt-5 h-4 w-1/2 text-muted" />
              <SkeletonBlock className="mt-3 h-4 w-3/4 text-muted" />
              <SkeletonBlock className="mt-7 h-10 w-28 rounded-xl text-primary/10" />
            </div>
          ))}
        </div>
      </SkeletonSection>

      <SkeletonSection>
        <SectionHeadingSkeleton />
        <div aria-hidden="true" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div className="min-h-56 rounded-2xl border border-border bg-white p-5 sm:p-6" key={item}>
              <SkeletonBlock className="size-11 rounded-xl text-primary/10" />
              <SkeletonBlock className="mt-6 h-3 w-28 text-primary/10" />
              <SkeletonBlock className="mt-3 h-6 w-3/4 text-muted" />
              <SkeletonBlock className="mt-3 h-4 w-full text-muted" />
              <SkeletonBlock className="mt-2 h-4 w-4/5 text-muted" />
            </div>
          ))}
        </div>
      </SkeletonSection>

      <SkeletonSection className="bg-surface-strong">
        <SectionHeadingSkeleton />
        <div aria-hidden="true" className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div className="overflow-hidden rounded-2xl border border-border bg-white" key={item}>
              <SkeletonBlock className="aspect-[16/10] rounded-none text-muted/10" />
              <div className="p-6">
                <SkeletonBlock className="h-6 w-4/5 text-muted" />
                <SkeletonBlock className="mt-4 h-4 w-full text-muted" />
                <SkeletonBlock className="mt-2 h-4 w-3/4 text-muted" />
              </div>
            </div>
          ))}
        </div>
      </SkeletonSection>

      <SkeletonSection>
        <SectionHeadingSkeleton />
        <div aria-hidden="true" className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div className="rounded-2xl border border-border bg-white p-6" key={item}>
              <SkeletonBlock className="aspect-video w-full text-muted/10" />
              <SkeletonBlock className="mt-5 h-6 w-4/5 text-muted" />
              <SkeletonBlock className="mt-3 h-4 w-full text-muted" />
              <SkeletonBlock className="mt-2 h-4 w-2/3 text-muted" />
            </div>
          ))}
        </div>
      </SkeletonSection>
    </main>
  );
}
