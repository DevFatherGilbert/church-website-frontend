import type { Metadata } from "next";
import { UserRoleManager } from "@/components/admin/management/user-role-manager";

export const metadata: Metadata = {
  title: "Users & Roles | Church Admin",
  description: "Manage church members and administrator access permissions.",
};

export default function AdminUsersPage() {
  return <UserRoleManager />;
}
