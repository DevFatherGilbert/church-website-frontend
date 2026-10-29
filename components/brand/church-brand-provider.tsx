"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getPublicWebsiteSettings } from "@/lib/content/website-settings";

export type ChurchBrand = {
  churchName: string;
  logoUrl: string;
  logoAlt: string;
  description: string;
  refresh: () => Promise<void>;
};

const defaultBrand: ChurchBrand = {
  churchName: "Church",
  logoUrl: "/logo-c.png",
  logoAlt: "Church Logo",
  description: "",
  refresh: async () => {},
};

const ChurchBrandContext = createContext<ChurchBrand>(defaultBrand);

export function ChurchBrandProvider({
  children,
  initialBrand,
}: {
  children: ReactNode;
  initialBrand?: Partial<Omit<ChurchBrand, "refresh">>;
}) {
  const [brand, setBrand] = useState<Omit<ChurchBrand, "refresh">>({
    churchName: initialBrand?.churchName || "Church",
    logoUrl: initialBrand?.logoUrl || "/logo-c.png",
    logoAlt: initialBrand?.logoAlt || initialBrand?.churchName || "Church Logo",
    description: initialBrand?.description || "",
  });

  const refresh = useCallback(async () => {
    try {
      const settings = await getPublicWebsiteSettings();
      const churchName = settings.churchName || "Church";
      const logoUrl = settings.church.profile.logoUrl || "/logo-c.png";
      const logoAlt =
        settings.church.profile.logoAlt || churchName || "Church Logo";
      setBrand({
        churchName,
        logoUrl,
        logoAlt,
        description: settings.churchDescription || "",
      });
    } catch {
      // Ignore network errors on background refresh
    }
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      void refresh();
    };

    window.addEventListener("church-settings-updated", handleUpdate);
    return () => {
      window.removeEventListener("church-settings-updated", handleUpdate);
    };
  }, [refresh]);

  return (
    <ChurchBrandContext.Provider value={{ ...brand, refresh }}>
      {children}
    </ChurchBrandContext.Provider>
  );
}

export function useChurchBrand(): ChurchBrand {
  return useContext(ChurchBrandContext);
}
