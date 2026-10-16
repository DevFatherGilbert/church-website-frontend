"use client";

import { ServiceUnavailable } from "@/components/feedback/service-unavailable";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ServiceUnavailable onRetry={reset} />;
}
