import type { Metadata } from "next";
import { AnnouncementDetailPage } from "@/components/public-pages/announcement-detail-page";
import { getPublicData, type PublicContent } from "@/lib/api/church-api";

type AnnouncementParams = { slug: string };

function titleFromSlug(slug: string) {
  return slug.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export async function generateMetadata({ params }: { params: Promise<AnnouncementParams> }): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPublicData<PublicContent>(`/content/announcements/${encodeURIComponent(slug)}`, { allowNotFound: true });
  const title = item?.title ?? titleFromSlug(slug);
  const image = typeof item?.details.imageUrl === "string" ? item.details.imageUrl : undefined;
  return {
    title,
    description: item?.description ?? "A published update from the church community.",
    alternates: { canonical: `/announcements/${slug}` },
    openGraph: {
      title,
      description: item?.description ?? "A published update from the church community.",
      type: "article",
      url: `/announcements/${slug}`,
      ...(image ? { images: [{ url: image, alt: title }] } : {}),
    },
  };
}

export default async function AnnouncementRoute({ params }: { params: Promise<AnnouncementParams> }) {
  const { slug } = await params;
  return <AnnouncementDetailPage slug={slug} />;
}
