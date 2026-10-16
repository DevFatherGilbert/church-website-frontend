import type { Metadata } from "next";
import { MinistriesManager } from "@/components/admin/management/ministries-manager";

export const metadata: Metadata = { title: "Ministries", robots: { index: false, follow: false } };

export default function AdminMinistriesPage() {
  return <MinistriesManager />;
}
