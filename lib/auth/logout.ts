import { authRequest } from "@/lib/api/church-api";

export async function handleAdminLogout(): Promise<void> {
  try {
    await authRequest("/auth/logout", {});
  } catch {
    // Ignore error if endpoint doesn't exist or already logged out
  }

  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.clear();
      window.localStorage.removeItem("church-admin-token");
      window.localStorage.removeItem("token");
    } catch {
      // Storage access might be restricted
    }
    // Hard refresh/redirect to login to clear all cached state
    window.location.href = "/admin/login";
  }
}
