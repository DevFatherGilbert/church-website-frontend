import { MinistryDetail, ministryMetadata } from "../[slug]/page";

export function generateMetadata() {
  return ministryMetadata("children");
}

export default function ChildrenMinistryPage() {
  return <MinistryDetail slug="children" />;
}
