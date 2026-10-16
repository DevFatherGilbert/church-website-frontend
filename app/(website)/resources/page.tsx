import type { Metadata } from "next";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { getPublicData, type PublicContent } from "@/lib/api/church-api";

export const metadata: Metadata = {
  title: "Church resources",
  description: "Browse published church documents, guides, and useful links.",
  alternates: { canonical: "/resources" },
};

export const revalidate = 60;


function detailText(details: Record<string, unknown>, key: string) {
  const value = details[key];
  return typeof value === "string" ? value.trim() : "";
}

export default async function ResourcesPage() {
  const response = await getPublicData<{ items: PublicContent[] }>("/content/resources?limit=100");
  const resources = response?.items ?? [];

  return (
    <main>
      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }]}
        description="Find church documents, guides, and other resources published by the church."
        emphasis="for the journey."
        eyebrow="RESOURCES"
        title="Tools and guidance"
      />
      <section aria-label="Published church resources" className="page-container section-space">
        {resources.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => {
              const category = detailText(resource.details, "category");
              const resourceType = detailText(resource.details, "resourceType");
              const url = detailText(resource.details, "url");

              return (
                <article
                  className="surface-card group flex min-w-0 flex-col justify-between overflow-hidden rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  key={resource.id}
                >
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <span
                        aria-hidden="true"
                        className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white"
                      >
                        <BookOpen className="size-5" />
                      </span>
                      {(category || resourceType) && (
                        <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                          {[category, resourceType].filter(Boolean).join(" · ")}
                        </span>
                      )}
                    </div>

                    <h2 className="mt-5 font-display text-xl font-bold tracking-tight text-text transition-colors group-hover:text-primary">
                      {resource.title}
                    </h2>
                    {resource.description && (
                      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted font-normal">
                        {resource.description}
                      </p>
                    )}
                  </div>

                  {url && (
                    <div className="mt-6 pt-4 border-t border-border/60">
                      <a
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary transition-colors hover:text-primary-hover"
                        href={url}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Open resource <ArrowUpRight aria-hidden="true" className="size-4" />
                      </a>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="surface-card mx-auto max-w-2xl rounded-2xl p-10 text-center sm:p-12">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <BookOpen aria-hidden="true" className="size-6" />
            </span>
            <h2 className="mt-4 font-display text-2xl font-bold text-text">No resources published yet</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Church resources, guides, and documents will appear here when an administrator publishes them.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
