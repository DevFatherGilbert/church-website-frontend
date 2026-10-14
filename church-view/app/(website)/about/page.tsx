import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/page-hero";
import { getPublicWebsiteSettings } from "@/lib/content/website-settings";

export const metadata: Metadata = {
  title: "About the church",
  description: "Learn about the church, its beliefs, leadership, and mission.",
  alternates: { canonical: "/about" },
};

const aboutLinks = [
  { title: "Our story", description: "Learn about the church’s history and community.", href: "/about/our-story" },
  { title: "Mission and vision", description: "Explore the published statements that guide the church.", href: "/about/mission-vision" },
  { title: "What we believe", description: "Read the church’s published beliefs and values.", href: "/about/beliefs" },
  { title: "Leadership", description: "Meet the leaders serving the church community.", href: "/about/leadership" },
];

export default async function AboutPage() {
  const { church, churchRecord } = await getPublicWebsiteSettings();
  const name = churchRecord?.title || "About the church";

  return (
    <main>
      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }]}
        description={churchRecord?.description || "Get to know the church, its shared beliefs, and the people who serve its community."}
        emphasis=""
        eyebrow="WHO WE ARE"
        title={name}
      />
      <section className="page-container section-space">
        {church.profile.history && (
          <article className="mx-auto mb-16 max-w-4xl rounded-2xl border border-border/80 bg-surface p-8 shadow-sm sm:p-12">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-secondary" />
              <p className="eyebrow text-primary">OUR STORY</p>
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">Rooted in faith & community</h2>
            <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-muted font-normal">{church.profile.history}</p>
          </article>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          {aboutLinks.map((item) => (
            <Link
              className="surface-card group relative flex min-h-48 flex-col justify-between overflow-hidden p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl sm:p-9"
              href={item.href}
              key={item.href}
            >
              <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-primary/5 transition-transform duration-300 group-hover:scale-125" />
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-text transition-colors group-hover:text-primary">{item.title}</h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">{item.description}</p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-sm font-bold text-primary">
                <span>Explore</span>
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5">↗</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
