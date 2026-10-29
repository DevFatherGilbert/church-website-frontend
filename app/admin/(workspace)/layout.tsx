"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { ChurchLogo } from "@/components/brand/church-logo";
import { useChurchBrand } from "@/components/brand/church-brand-provider";
import { authGet, authRequest } from "@/lib/api/church-api";
import { AdminShellView } from "@/components/admin/admin-shell-view";
import { ConfirmationDialogProvider } from "@/components/admin/confirmation-dialog";

type SessionProfile = {
  status?: string;
  role?: "admin" | "member";
  fullName?: string;
  email?: string;
};

export default function AdminWorkspaceLayout({ children }: { children: ReactNode }) {
  const { churchName } = useChurchBrand();
  const pathname = usePathname();
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState<"checking" | "authorized" | "redirecting">("checking");
  const [profile, setProfile] = useState<SessionProfile>({});
  const checkStarted = useRef(false);
  const currentPath = useRef(pathname);

  useEffect(() => {
    if (checkStarted.current) return;
    checkStarted.current = true;
    let cancelled = false;
    currentPath.current = pathname;

    async function checkSession() {
      try {
        let profile: SessionProfile;
        try {
          profile = await authGet<SessionProfile>("/auth/me");
        } catch {
          await authRequest("/auth/refresh");
          profile = await authGet<SessionProfile>("/auth/me");
        }

        if (profile?.status !== "active" || profile.role !== "admin") {
          throw new Error("An active administrator account is required.");
        }
        if (!cancelled) {
          setProfile(profile);
          setAuthStatus("authorized");
        }
      } catch {
        if (!cancelled) {
          const returnTo = encodeURIComponent(currentPath.current);
          setAuthStatus("redirecting");
          router.replace(`/admin/login?next=${returnTo}`);
        }
      }
    }

    void checkSession();
    return () => {
      cancelled = true;
      checkStarted.current = false;
    };
  }, [router, pathname]);

  if (authStatus !== "authorized") {
    return <main className="grid min-h-screen place-items-center bg-background px-5 py-10">
      <section aria-live="polite" className="surface-card w-full max-w-sm p-8 text-center" role="status">
        <span className="mx-auto grid size-14 place-items-center rounded-xl bg-white p-1 shadow-sm">
          <ChurchLogo
            className="size-10 object-contain"
          />
        </span>
        <div className="mt-6 flex items-center justify-center gap-2">
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin text-primary" />
          <p className="text-sm font-bold uppercase tracking-wide text-text">
            {authStatus === "redirecting"
              ? `Welcome to ${churchName || "Church"} Admin`
              : "Faithfulness and dedication is important"}
          </p>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted">{authStatus === "redirecting" ? "Taking you to the secure sign-in page." : "One moment while we get your dashboard ready."}</p>
        <div aria-hidden="true" className="mt-7 space-y-2.5">
          <div className="mx-auto h-2 w-2/3 animate-pulse rounded-full bg-surface-strong" />
          <div className="mx-auto h-2 w-1/2 animate-pulse rounded-full bg-surface-strong [animation-delay:120ms]" />
        </div>
      </section>
    </main>;
  }

  return <ConfirmationDialogProvider><AdminShellView profile={profile}>{children}</AdminShellView></ConfirmationDialogProvider>;
}
