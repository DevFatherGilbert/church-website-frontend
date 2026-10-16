import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { SermonLibrary } from "@/components/site/sermon-library";
import { getPublicData, type Sermon } from "@/lib/api/church-api";

export const metadata: Metadata = {
  title: "Sermons & Christian Teaching | Church Messages",
  description:
    "Listen to and watch biblical sermons, explore teaching by Scripture and topics, and download audio messages for your spiritual journey.",
  alternates: { canonical: "/sermons" },
  openGraph: {
    title: "Sermons & Bible Teaching",
    description:
      "Explore gospel-centered sermons, audio recordings, video messages, and Scripture study notes.",
  },
};

export const revalidate = 60;

export default async function SermonsPage() {
  const sermons = await getPublicData<Sermon[]>("/sermons");

  return (
    <main>
      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }]}
        description="Listen to biblical teaching, watch video messages, and explore the Word of God categorized by topic, Scripture passage, and speaker."
        emphasis="way ahead."
        eyebrow="SERMONS & TEACHINGS"
        title="Words for the"
      />
      <section className="page-container section-space">
        <SermonLibrary sermons={sermons ?? []} />
      </section>
    </main>
  );
}
