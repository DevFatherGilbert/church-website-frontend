"use client";

import { ErrorState } from "@/components/feedback/page-states";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main><ErrorState reset={reset} /></main>;
}
