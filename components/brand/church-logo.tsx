"use client";

import Image from "next/image";
import { useChurchBrand } from "./church-brand-provider";

type ChurchLogoProps = {
  size?: number;
  alt?: string;
  className?: string;
  priority?: boolean;
  src?: string;
};

export function ChurchLogo({
  size = 40,
  alt,
  className = "",
  priority = false,
  src,
}: ChurchLogoProps) {
  const brand = useChurchBrand();
  const effectiveSrc = (src || brand.logoUrl || "/logo-c.png").trim();
  const effectiveAlt = alt || brand.logoAlt || brand.churchName || "Church Logo";
  const isExternal =
    effectiveSrc.startsWith("http://") || effectiveSrc.startsWith("https://");

  return (
    <Image
      alt={effectiveAlt}
      className={className}
      height={size}
      priority={priority}
      src={effectiveSrc}
      unoptimized={isExternal}
      width={size}
    />
  );
}

