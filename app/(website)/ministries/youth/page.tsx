import { MinistryDetail, ministryMetadata } from "../[slug]/page";

export function generateMetadata() {
  return ministryMetadata("youth");
}

export default function YouthMinistryPage() {
  return <MinistryDetail slug="youth" />;
}
