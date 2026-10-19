import type { Metadata } from "next";
import { AuditLogManager } from "@/components/admin/management/audit-manager";

export const metadata: Metadata = {
  title: "Audit Logs",
  robots: { index: false, follow: false },
};

export default function AdminAuditPage() {
  return <AuditLogManager />;
}
