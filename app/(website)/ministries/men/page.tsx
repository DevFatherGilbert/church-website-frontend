import { MinistryDetail, ministryMetadata } from "../[slug]/page";

export function generateMetadata() {
  return ministryMetadata("men");
}

export default function MenMinistryPage() {
  return <MinistryDetail slug="men" />;
}
