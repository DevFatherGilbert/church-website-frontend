import type { ReactNode } from "react";
import { AdminAuthLayout } from "@/components/admin/admin-auth-layout";

export default function AdminAuthRouteLayout({ children }: { children: ReactNode }) {
  return <AdminAuthLayout>{children}</AdminAuthLayout>;
}
