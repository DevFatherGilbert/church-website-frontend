import type { Metadata } from "next";
import { AdminAuthPage } from "@/components/admin/admin-auth-page";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return <AdminAuthPage
    step="login"
    title="Welcome back"
    description="Sign in to continue to your account."
  />;
}
