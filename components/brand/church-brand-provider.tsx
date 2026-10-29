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
  logoUrl: "",
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
    logoUrl: initialBrand?.logoUrl?.trim() || "",
    logoAlt: initialBrand?.logoAlt || initialBrand?.churchName || "Church Logo",
    description: initialBrand?.description || "",
  });

  const refresh = useCallback(async () => {
    try {
      const settings = await getPublicWebsiteSettings();
      if (!settings.backendAvailable) {
        throw new Error("The church settings service is unavailable.");
      }
      const churchName = settings.churchName || "Church";
      const logoUrl = settings.church.profile.logoUrl?.trim() || "";
      const logoAlt =
        settings.church.profile.logoAlt || churchName || "Church Logo";
      setBrand({
        churchName,
        logoUrl,
        logoAlt,
        description: settings.churchDescription || "",
      });
    } catch (error) {
      console.error("Could not refresh church branding from public settings.", error);
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
