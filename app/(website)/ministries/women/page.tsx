import { MinistryDetail, ministryMetadata } from "../[slug]/page";

export function generateMetadata() {
  return ministryMetadata("women");
}

export default function WomenMinistryPage() {
  return <MinistryDetail slug="women" />;
}
