"use client";

import { useState, type ReactNode } from "react";
import { HeaderView } from "./header-view";
import { SidebarView } from "./sidebar-view";
import { RealtimeProvider } from "@/lib/realtime/notifications-context";
import { RealtimeToastBanner } from "./realtime-toast-banner";

type AdminProfile = { fullName?: string; email?: string };

export function AdminShellView({
  children,
  profile,
}: {
  children: ReactNode;
  profile: AdminProfile;
}) {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);

  return (
    <RealtimeProvider>
      <div className="flex min-h-screen bg-background text-text">
        <SidebarView
          isOpen={mobileNavigationOpen}
          onClose={() => setMobileNavigationOpen(false)}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <HeaderView
            profile={profile}
            isMenuOpen={mobileNavigationOpen}
            onMenuClick={() => setMobileNavigationOpen((open) => !open)}
          />
          <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
            {children}
          </main>
        </div>
        <RealtimeToastBanner />
      </div>
    </RealtimeProvider>
  );
}
