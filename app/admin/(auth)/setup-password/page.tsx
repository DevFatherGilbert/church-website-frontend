import type { Metadata } from "next";
import { AdminAuthPage } from "@/components/admin/admin-auth-page";

export const metadata: Metadata = {
  title: "Set your password",
  robots: { index: false, follow: false },
};

export default function AdminSetupPasswordPage() {
  return <AdminAuthPage
    step="password"
    title="Set your password"
    description="Choose a password to finish setting up your account."
  />;
}
