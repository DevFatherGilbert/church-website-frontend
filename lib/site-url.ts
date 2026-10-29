/**
 * Centralized site URL and canonical domain configuration.
 *
 * Canonical production base URL:
 * https://church-website-frontend-5k4s.vercel.app
 */

export const PRODUCTION_SITE_URL = "https://church-website-frontend-5k4s.vercel.app";

/**
 * Returns the fully qualified base URL without a trailing slash.
 * Prioritizes process.env.NEXT_PUBLIC_SITE_URL if configured with an absolute URL,
 * falling back to the canonical production URL.
 */
export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl && (envUrl.startsWith("http://") || envUrl.startsWith("https://"))) {
    return envUrl.replace(/\/+$/, "");
  }
  return PRODUCTION_SITE_URL;
}

/**
 * Returns a fully qualified absolute URL for a given site path.
 *
 * Examples:
 * - "/" => "https://church-website-frontend-5k4s.vercel.app/"
 * - "/about" => "https://church-website-frontend-5k4s.vercel.app/about"
 * - "/about/our-story" => "https://church-website-frontend-5k4s.vercel.app/about/our-story"
 * - "sermons/hope" => "https://church-website-frontend-5k4s.vercel.app/sermons/hope"
 */
export function absoluteUrl(path: string = "/"): string {
  const base = getSiteUrl();
  const cleaned = (path || "/").trim();

  if (cleaned === "" || cleaned === "/") {
    return `${base}/`;
  }

  const normalized = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
  // Remove any trailing slash on sub-paths to avoid duplicate URLs
  return `${base}${normalized.replace(/\/+$/, "")}`;
}

