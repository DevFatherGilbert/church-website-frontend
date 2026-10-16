import type { Metadata } from "next";
import { AdminAuthPage } from "@/components/admin/admin-auth-page";

export const metadata: Metadata = {
  title: "Confirm your email",
  robots: { index: false, follow: false },
};

export default function AdminVerifyEmailPage() {
  return <AdminAuthPage
    step="verify"
    title="Confirm your email"
    description="Enter the verification code we sent to your inbox."
  />;
}
