import { MinistryDetail, ministryMetadata } from "../[slug]/page";

export function generateMetadata() {
  return ministryMetadata("outreach");
}

export default function OutreachMinistryPage() {
  return <MinistryDetail slug="outreach" />;
}
