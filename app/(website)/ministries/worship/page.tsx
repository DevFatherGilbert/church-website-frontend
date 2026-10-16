import { MinistryDetail, ministryMetadata } from "../[slug]/page";

export function generateMetadata() {
  return ministryMetadata("worship");
}

export default function WorshipMinistryPage() {
  return <MinistryDetail slug="worship" />;
}
