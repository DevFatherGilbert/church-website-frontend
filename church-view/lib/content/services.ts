import type { PublicContent } from "@/lib/api/church-api";

export const serviceTypes = ["Worship service", "Bible study", "Prayer meeting", "Youth service", "Children's service", "Special service"] as const;
export const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

export type ChurchService = {
  id: string;
  title: string;
  description: string | null;
  serviceType: string;
  scheduleType: "weekly" | "special";
  dayOfWeek: number | null;
  serviceDate: string | null;
  startTime: string;
  endTime: string | null;
  location: string;
  targetAudience: string | null;
  instructions: string | null;
  active: boolean;
  displayOrder: number;
  publicationStatus: string;
};

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function toChurchService(record: PublicContent): ChurchService {
  const details = record.details ?? {};
  const scheduleType = details.scheduleType === "special" ? "special" : "weekly";
  const day = Number(details.dayOfWeek);
  return {
    id: record.id,
    title: record.title,
    description: record.description ?? null,
    serviceType: text(details.serviceType) ?? text(details.type) ?? "Service",
    scheduleType,
    dayOfWeek: scheduleType === "weekly" && Number.isInteger(day) && day >= 0 && day < weekdays.length ? day : null,
    serviceDate: scheduleType === "special" ? text(details.serviceDate) : null,
    startTime: text(details.startTime) ?? text(details.time) ?? "",
    endTime: text(details.endTime),
    location: text(details.location) ?? "",
    targetAudience: text(details.targetAudience),
    instructions: text(details.instructions) ?? text(details.specialInformation),
    active: details.active !== false,
    displayOrder: Number.isInteger(Number(details.displayOrder)) ? Number(details.displayOrder) : 0,
    publicationStatus: text(details.publicationStatus) ?? "published",
  };
}

export function sortServices(services: ChurchService[]) {
  return [...services].sort((a, b) => {
    if (a.scheduleType !== b.scheduleType) return a.scheduleType === "weekly" ? -1 : 1;
    if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
    if (a.scheduleType === "weekly") return (a.dayOfWeek ?? 7) - (b.dayOfWeek ?? 7) || a.startTime.localeCompare(b.startTime);
    return (a.serviceDate ?? "9999-12-31").localeCompare(b.serviceDate ?? "9999-12-31") || a.startTime.localeCompare(b.startTime);
  });
}

export function formatServiceDate(service: ChurchService) {
  if (service.scheduleType === "weekly") return service.dayOfWeek === null ? "Weekly" : weekdays[service.dayOfWeek];
  if (!service.serviceDate) return "Special service";
  return new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "Africa/Kigali" }).format(new Date(`${service.serviceDate}T12:00:00+02:00`));
}

export function formatServiceTime(service: ChurchService) {
  const format = (value: string) => new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit", timeZone: "Africa/Kigali" }).format(new Date(`1970-01-01T${value}:00+02:00`));
  return service.startTime ? `${format(service.startTime)}${service.endTime ? ` – ${format(service.endTime)}` : ""}` : "Time to be confirmed";
}
