"use client";

import Image from "next/image";
import { useState } from "react";
import { useChurchBrand } from "./church-brand-provider";

const fallbackLogo = "/logo-c.png";

type ChurchLogoProps = {
  size?: number;
  alt?: string;
  className?: string;
  priority?: boolean;
};

export function ChurchLogo({
  size = 40,
  alt,
  className = "",
  priority = false,
}: ChurchLogoProps) {
  const brand = useChurchBrand();
  const source = brand.logoUrl.trim() || fallbackLogo;
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const effectiveSrc = failedSource === source ? fallbackLogo : source;
  const effectiveAlt = alt || brand.logoAlt || brand.churchName || "Church Logo";
  const isExternal =
    effectiveSrc.startsWith("http://") || effectiveSrc.startsWith("https://");

  return (
    <Image
      alt={effectiveAlt}
      className={className}
      height={size}
      onError={() => setFailedSource(source)}
      priority={priority}
      src={effectiveSrc}
      unoptimized={isExternal}
      width={size}
    />
  );
}
