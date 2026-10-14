import Image from "next/image";

type ChurchLogoProps = {
  size?: number;
  alt?: string;
  className?: string;
  priority?: boolean;
  src?: string;
};

export function ChurchLogo({ size = 40, alt = "", className = "", priority = false, src = "/logo-c.png" }: ChurchLogoProps) {
  return <Image
    alt={alt}
    className={className}
    height={size}
    priority={priority}
    src={src}
    width={size}
  />;
}
