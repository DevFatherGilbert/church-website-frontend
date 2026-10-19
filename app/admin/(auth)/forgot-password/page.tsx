import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/admin/forgot-password-form";

export const metadata: Metadata = { title: "Admin password recovery", robots: { index: false, follow: false } };

export default function AdminForgotPasswordPage() {
  return <ForgotPasswordForm admin />;
}
