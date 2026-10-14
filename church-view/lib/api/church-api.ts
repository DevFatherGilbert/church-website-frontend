const protocol = process.env.NEXT_PUBLIC_API_PROTOCOL ?? "http";
const host = process.env.NEXT_PUBLIC_API_HOST ?? "localhost";
const port = process.env.NEXT_PUBLIC_API_PORT?.trim();
const apiPrefix = `/${(process.env.NEXT_PUBLIC_API_PREFIX ?? "api").replace(/^\/+|\/+$/g, "")}`;
const apiBase = `${protocol}://${host}${port ? `:${port}` : ""}${apiPrefix}`.replace(/\/$/, "");

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
  statusCode?: number;
};

async function readApiEnvelope<T>(response: Response, failureMessage: string): Promise<ApiEnvelope<T>> {
  let payload: ApiEnvelope<T> | null;
  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    if (!response.ok) {
      throw new Error(`${failureMessage} (HTTP ${response.status}).`);
    }
    throw new Error(`${failureMessage} The service returned an unreadable response.`);
  }

  if (!payload || typeof payload !== "object") {
    throw new Error(`${failureMessage} The service returned an unexpected response.`);
  }
  if (!response.ok || payload.success === false) {
    throw new Error(payload.error ?? payload.message ?? `${failureMessage} (HTTP ${response.status}).`);
  }
  return payload;
}

function responseData<T>(payload: ApiEnvelope<T>, failureMessage: string): T {
  if (!("data" in payload) || payload.data === undefined) {
    throw new Error(`${failureMessage} The service response did not include data.`);
  }
  return payload.data;
}

export async function authRequest<T>(path: string, body?: unknown): Promise<T> {
  return authMutation<T>(path, "POST", body ?? {});
}

export async function authMutation<T>(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBase}${path}`, {
      method,
      credentials: "include",
      ...(body === undefined ? {} : {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    });
  } catch {
    throw new Error("We couldn’t reach the sign-in service. Check your connection and try again.");
  }

  return responseData(
    await readApiEnvelope<T>(response, "That request could not be completed. Please try again."),
    "That request could not be completed. Please try again.",
  );
}

export async function authUpload<T>(path: string, body: FormData): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBase}${path}`, {
      method: "POST",
      credentials: "include",
      body,
    });
  } catch {
    throw new Error("We couldn’t reach the upload service. Check your connection and try again.");
  }

  return responseData(
    await readApiEnvelope<T>(response, "That upload could not be completed. Please try again."),
    "That upload could not be completed. Please try again.",
  );
}

export async function authGet<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBase}${path}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });
  } catch {
    throw new Error("We couldn’t reach the sign-in service. Check your connection and try again.");
  }

  return responseData(
    await readApiEnvelope<T>(response, "That request could not be completed. Please try again."),
    "That request could not be completed. Please try again.",
  );
}

export async function getPublicData<T>(
  path: string,
  options: { allowNotFound?: boolean } = {},
): Promise<T | null> {
  let response: Response;
  try {
    response = await fetch(`${apiBase}${path}`, { cache: "no-store" });
  } catch {
    throw new Error("We couldn’t reach the church website service. Please try again later.");
  }

  if (response.status === 404 && options.allowNotFound) return null;
  if (!response.ok) {
    throw new Error(`The church website service returned an error (${response.status}). Please try again later.`);
  }

  const payload = (await response.json()) as ApiEnvelope<T> | null;
  if (!payload || typeof payload !== "object") {
    throw new Error("The church website service returned an unexpected response.");
  }
  if (payload.success === false) {
    throw new Error(payload.error ?? payload.message ?? "The church website service could not complete this request.");
  }
  if (!("data" in payload)) {
    throw new Error("The church website service returned an unexpected response.");
  }
  return payload.data ?? null;
}

export async function submitInquiry(
  type: "contact" | "visitor" | "prayer",
  inquiry: { name: string; email: string; phone: string; message: string },
): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${apiBase}/inquiries/${type}`, {
      method: "POST",
      credentials: "omit",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: inquiry.name,
        email: inquiry.email,
        ...(inquiry.phone ? { phone: inquiry.phone } : {}),
        message: inquiry.message,
      }),
    });
  } catch {
    throw new Error("We couldn’t send your message because the church website service is unavailable. Please try again.");
  }

  await readApiEnvelope<unknown>(response, "Your message could not be sent. Please try again.");
}

export type ChurchEvent = {
  id: string;
  name: string;
  date: string;
  time: string;
  endTime?: string | null;
  location: string;
  description?: string | null;
  flyerUrl?: string | null;
  organizer?: string | null;
  speaker?: string | null;
  registrationRequired: boolean;
  registrationInfo?: string | null;
  contactInfo?: string | null;
  mapUrl?: string | null;
  status?: "draft" | "published" | "archived";
};

export type Speaker = {
  id: string;
  name: string;
  slug: string;
  title?: string | null;
  bio?: string | null;
  photoUrl?: string | null;
  email?: string | null;
  phone?: string | null;
  socialLinks?: Record<string, string>;
  sermonCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type Sermon = {
  id: string;
  title: string;
  slug: string;
  speaker: string;
  speakerId?: string | null;
  speakerRef?: Speaker | null;
  date: string;
  scripture?: string | null;
  bibleBook?: string | null;
  category: string;
  series?: string | null;
  ministry?: string | null;
  service?: string | null;
  description?: string | null;
  thumbnailUrl?: string | null;
  audioUrl?: string | null;
  videoUrl?: string | null;
  allowDownload?: boolean;
  status?: "draft" | "published" | "archived";
  createdAt?: string;
  updatedAt?: string;
  relatedSermons?: Sermon[];
};

export type SermonFilterMeta = {
  categories: string[];
  speakers: string[];
  series: string[];
  bibleBooks: string[];
  ministries: string[];
  services: string[];
  totalPublished: number;
};

export type PublicContent = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  details: Record<string, unknown>;
  publishedAt?: string | null;
};

export type Ministry = {
  id: string;
  slug: string;
  name: string;
  description: string;
  leader?: string | null;
  imageUrl?: string | null;
  targetAudience?: string | null;
  meetingSchedule?: string | null;
  location?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  status?: "draft" | "published" | "archived";
  createdAt?: string;
  updatedAt?: string;
};
