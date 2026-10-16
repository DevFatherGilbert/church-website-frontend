import { MinistryDetail, ministryMetadata } from "../[slug]/page";

export function generateMetadata() {
  return ministryMetadata("prayer");
}

export default function PrayerMinistryPage() {
  return <MinistryDetail slug="prayer" />;
}
