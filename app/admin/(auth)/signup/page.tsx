import type { Metadata } from "next";
import { AdminAuthPage } from "@/components/admin/admin-auth-page";

export const metadata: Metadata = {
  title: "Register",
  robots: { index: false, follow: false },
};

export default function AdminSignupPage() {
  return <AdminAuthPage
    basePath="/admin"
    step="register"
    title="Register"
    description="Create your account to join the church community."
  />;
}
