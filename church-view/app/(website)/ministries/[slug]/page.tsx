import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/site/page-hero";
import { getPublicData, type Ministry } from "@/lib/api/church-api";

type MinistryPageProps = { params: Promise<{ slug: string }> };

async function getMinistry(slug: string) {
  return getPublicData<Ministry>(`/ministries/${encodeURIComponent(slug)}`, { allowNotFound: true });
}

export async function generateMetadata({ params }: MinistryPageProps): Promise<Metadata> {
  const { slug } = await params;
  return ministryMetadata(slug);
}

export async function ministryMetadata(slug: string): Promise<Metadata> {
  const ministry = await getMinistry(slug);
  if (!ministry) return { title: "Ministry not found" };
  return {
    title: ministry.seoTitle || ministry.name,
    description: ministry.seoDescription || ministry.description.slice(0, 300),
    alternates: { canonical: `/ministries/${ministry.slug}` },
    openGraph: {
      title: ministry.seoTitle || ministry.name,
      description: ministry.seoDescription || ministry.description.slice(0, 300),
      images: ministry.imageUrl ? [{ url: ministry.imageUrl, alt: `${ministry.name} ministry` }] : undefined,
    },
  };
}

import { ArrowLeft, Clock, Mail, MapPin, Phone, Users } from "lucide-react";

export async function MinistryDetail({ slug }: { slug: string }) {
  const ministry = await getMinistry(slug);
  if (!ministry) notFound();

  return (
    <main>
      <PageHero
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Ministries", href: "/ministries" },
          { label: ministry.name, href: `/ministries/${ministry.slug}` },
        ]}
        description={ministry.description}
        eyebrow="FIND YOUR PEOPLE"
        title={ministry.name}
      />

      <section className="page-container section-space">
        <div className="mb-8">
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-primary transition"
            href="/ministries"
          >
            <ArrowLeft className="size-4" />
            Back to All Ministries
          </Link>
        </div>

        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,.65fr)]">
          <div className="space-y-6">
            {ministry.imageUrl && (
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border shadow-md">
                <Image
                  alt={`${ministry.name} ministry`}
                  className="object-cover"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 65vw"
                  src={ministry.imageUrl}
                  unoptimized
                />
              </div>
            )}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Ministry Overview</p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                About this ministry
              </h2>
              <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-muted">
                {ministry.description}
              </p>
            </div>

            {ministry.leader && (
              <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
                <p className="text-xs font-bold uppercase tracking-wider text-muted">Ministry Leader</p>
                <p className="mt-1 font-display text-lg font-bold text-foreground">{ministry.leader}</p>
              </div>
            )}
          </div>

          <aside className="h-fit space-y-6" aria-label={`${ministry.name} information`}>
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs sm:p-8">
              <h3 className="font-display text-xl font-bold text-foreground">Get Connected</h3>
              <p className="mt-1 text-xs text-muted">Join this community or reach out to get involved.</p>

              <dl className="mt-6 divide-y divide-border text-sm">
                {ministry.targetAudience && (
                  <div className="flex items-start gap-3 py-3.5">
                    <Users className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wider text-muted">Who It Serves</dt>
                      <dd className="mt-0.5 leading-relaxed text-foreground">{ministry.targetAudience}</dd>
                    </div>
                  </div>
                )}

                {ministry.meetingSchedule && (
                  <div className="flex items-start gap-3 py-3.5">
                    <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wider text-muted">Meeting Schedule</dt>
                      <dd className="mt-0.5 leading-relaxed text-foreground">{ministry.meetingSchedule}</dd>
                    </div>
                  </div>
                )}

                {ministry.location && (
                  <div className="flex items-start gap-3 py-3.5">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wider text-muted">Location</dt>
                      <dd className="mt-0.5 leading-relaxed text-foreground">{ministry.location}</dd>
                    </div>
                  </div>
                )}
              </dl>

              {(ministry.contactEmail || ministry.contactPhone) && (
                <div className="mt-6 space-y-2.5 border-t border-border pt-5 text-sm">
                  {ministry.contactEmail && (
                    <div className="flex items-center gap-2.5">
                      <Mail className="size-4 shrink-0 text-primary" />
                      <a
                        className="truncate text-xs font-medium text-muted transition hover:text-primary hover:underline"
                        href={`mailto:${ministry.contactEmail}`}
                      >
                        {ministry.contactEmail}
                      </a>
                    </div>
                  )}
                  {ministry.contactPhone && (
                    <div className="flex items-center gap-2.5">
                      <Phone className="size-4 shrink-0 text-primary" />
                      <a
                        className="text-xs font-medium text-muted transition hover:text-primary hover:underline"
                        href={`tel:${ministry.contactPhone}`}
                      >
                        {ministry.contactPhone}
                      </a>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 border-t border-border pt-6">
                <Link
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-5 text-center text-sm font-bold text-primary-foreground shadow-md transition hover:bg-primary-hover active:scale-[0.98]"
                  href={ministry.ctaUrl || "/contact"}
                >
                  {ministry.ctaLabel || "Contact the Church →"}
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default async function MinistryPage({ params }: MinistryPageProps) {
  const { slug } = await params;
  return <MinistryDetail slug={slug} />;
}
