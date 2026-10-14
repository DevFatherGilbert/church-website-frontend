"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Eye, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { authGet, authMutation, authUpload } from "@/lib/api/church-api";
import { useConfirmation } from "@/components/admin/confirmation-dialog";

type Section = "sermons" | "events" | "resources" | "leadership" | "settings" | "services" | "testimonials";
type Field = {
  name: string;
  label: string;
  type?: "text" | "url" | "email" | "tel" | "number" | "date" | "time" | "textarea" | "checkbox" | "select" | "image";
  required?: boolean;
  storage?: "details";
  options?: { value: string; label: string }[];
};
type ManagedRecord = {
  id: string;
  title?: string;
  name?: string;
  slug?: string;
  description?: string | null;
  details?: Record<string, unknown>;
  published?: boolean;
  status?: string;
  date?: string;
  time?: string;
  category?: string;
  updatedAt?: string;
  createdAt?: string;
  [key: string]: unknown;
};
type ManagerConfig = {
  title: string;
  description: string;
  api: string;
  adminApi?: string;
  contentType?: string;
  fields: Field[];
  archive?: boolean;
};

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

const configs: Record<Section, ManagerConfig> = {
  services: {
    title: "Service schedule",
    description: "Manage the church’s existing service and gathering schedule. Published records appear on the public Services page and homepage.",
    api: "/admin/content/services",
    contentType: "services",
    fields: [
      { name: "title", label: "Service or gathering name", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "type", label: "Service type", storage: "details" },
      { name: "day", label: "Day", storage: "details" },
      { name: "time", label: "Time", storage: "details" },
      { name: "location", label: "Location", storage: "details" },
      { name: "specialInformation", label: "Special information", type: "textarea", storage: "details" },
      { name: "status", label: "Publication status", type: "select", required: true, options: statusOptions.slice(0, 2) },
    ],
  },
  sermons: {
    title: "Sermons",
    description: "Manage messages, speakers, scripture references, and media links.",
    api: "/sermons",
    fields: [
      { name: "title", label: "Sermon title", required: true },
      { name: "speaker", label: "Speaker", required: true },
      { name: "date", label: "Date", type: "date", required: true },
      { name: "category", label: "Category", required: true },
      { name: "scripture", label: "Scripture reference" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "audioUrl", label: "Audio URL", type: "url" },
      { name: "videoUrl", label: "Video URL", type: "url" },
      { name: "status", label: "Publication status", type: "select", required: true, options: statusOptions },
    ],
    archive: true,
  },
  events: {
    title: "Events",
    description: "Create, publish, update, archive, and delete church events.",
    api: "/events",
    adminApi: "/admin/events",
    fields: [
      { name: "name", label: "Event name", required: true },
      { name: "date", label: "Date", type: "date", required: true },
      { name: "time", label: "Time", type: "time", required: true },
      { name: "endTime", label: "End time", type: "time" },
      { name: "location", label: "Location", required: true },
      { name: "organizer", label: "Organizer" },
      { name: "speaker", label: "Speaker" },
      { name: "flyerUrl", label: "Event image", type: "image" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "registrationRequired", label: "Registration required", type: "checkbox" },
      { name: "registrationInfo", label: "Registration information", type: "textarea" },
      { name: "contactInfo", label: "Contact information" },
      { name: "mapUrl", label: "Map URL", type: "url" },
      { name: "status", label: "Publication status", type: "select", required: true, options: statusOptions },
    ],
    archive: true,
  },
  resources: {
    title: "Resources",
    description: "Manage church documents, guides, and useful links.",
    api: "/admin/content/resources",
    contentType: "resources",
    fields: [
      { name: "title", label: "Resource title", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "category", label: "Category", storage: "details" },
      { name: "resourceType", label: "Resource type", storage: "details" },
      { name: "url", label: "Resource URL", type: "url", storage: "details" },
      { name: "status", label: "Publication status", type: "select", required: true, options: statusOptions.slice(0, 2) },
    ],
  },
  leadership: {
    title: "Leadership Management",
    description: "Create and maintain leader profiles. Drafts stay private until an authorized administrator publishes them.",
    api: "/admin/content/leaders",
    contentType: "leaders",
    fields: [
      { name: "title", label: "Full name", required: true },
      { name: "role", label: "Position or leadership title", storage: "details", required: true },
      { name: "description", label: "Biography", type: "textarea" },
      { name: "ministryResponsibilities", label: "Ministry responsibilities", type: "textarea", storage: "details" },
      { name: "imageUrl", label: "Leader photograph", type: "image", storage: "details" },
      { name: "displayOrder", label: "Display order", type: "number", storage: "details", required: true },
      { name: "email", label: "Approved public email", type: "email", storage: "details" },
      { name: "phone", label: "Approved public phone", type: "tel", storage: "details" },
      { name: "contactApproved", label: "I have approval to publish this contact information", type: "checkbox", storage: "details" },
      { name: "status", label: "Publication status", type: "select", required: true, options: statusOptions },
    ],
  },
  testimonials: {
    title: "Community stories",
    description: "Manage genuine member testimonials. Publish a story only after confirming permission to share the words and any included photo.",
    api: "/admin/content/testimonials",
    contentType: "testimonials",
    fields: [
      { name: "title", label: "Name or approved attribution", required: true },
      { name: "description", label: "Testimonial or member story", type: "textarea", required: true },
      { name: "role", label: "Optional role or context", storage: "details" },
      { name: "imageUrl", label: "Authorized photograph", type: "image", storage: "details" },
      { name: "consentApproved", label: "I have permission to publish this story and any included photograph", type: "checkbox", storage: "details", required: true },
    ],
  },
  settings: {
    title: "Church settings",
    description: "Store the approved public church profile and visitor information.",
    api: "/admin/content/settings",
    contentType: "settings",
    fields: [
      { name: "title", label: "Church name", required: true },
      { name: "city", label: "City", storage: "details" },
      { name: "country", label: "Country", storage: "details" },
      { name: "address", label: "Street address", storage: "details" },
      { name: "serviceSchedule", label: "Service schedule", storage: "details" },
      { name: "publicEmail", label: "Public email", storage: "details" },
      { name: "publicPhone", label: "Public phone", storage: "details" },
      { name: "description", label: "Welcome message", type: "textarea" },
      { name: "status", label: "Publication status", type: "select", required: true, options: statusOptions.slice(0, 2) },
    ],
  },
};

function readField(record: ManagedRecord, field: Field) {
  const value = field.storage === "details" ? record.details?.[field.name] : record[field.name];
  if (value == null) return "";
  const text = String(value);
  return field.type === "time" ? text.slice(0, 5) : text;
}

function statusOf(record: ManagedRecord, isContent: boolean): string {
  if (isContent && record.details?.publicationStatus === "archived") return "archived";
  return isContent ? (record.published ? "published" : "draft") : record.status ?? "draft";
}

function descriptionOf(record: ManagedRecord) {
  const value = record.description ?? record.category ?? record.details?.category ?? record.details?.role;
  return typeof value === "string" ? value : "—";
}

function nameOf(record: ManagedRecord) {
  return typeof record.title === "string" ? record.title : typeof record.name === "string" ? record.name : "";
}

function secondaryLabel(record: ManagedRecord) {
  const value = [record.slug, record.speaker, record.location, record.date].find((item) => typeof item === "string");
  return typeof value === "string" ? value : "";
}

function displayDate(value?: string) {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(parsed);
}

export function AdminRecordManager({ section }: { section: Section }) {
  const confirm = useConfirmation();
  const config = configs[section];
  const isContent = Boolean(config.contentType);
  const [records, setRecords] = useState<ManagedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editing, setEditing] = useState<ManagedRecord | null>(null);
  const [viewing, setViewing] = useState<ManagedRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageUploading, setImageUploading] = useState(false);

  const fetchRecords = useCallback(async () => {
    const result = await authGet<ManagedRecord[] | { items?: ManagedRecord[] }>(
      config.adminApi ?? (isContent ? config.api : `/admin${config.api}`),
    );
    const loaded = Array.isArray(result) ? result : result.items ?? [];
    return loaded;
  }, [config.adminApi, config.api, isContent]);

  const loadRecords = useCallback(async () => {
    try {
      setRecords(await fetchRecords());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load these records.");
    }
  }, [fetchRecords]);

  useEffect(() => {
    let active = true;
    fetchRecords().then(
      (loaded) => { if (active) setRecords(loaded); },
      (cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : "Could not load these records."); },
    ).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [fetchRecords]);

  const filteredRecords = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return records;
    return records.filter((record) => `${record.title ?? record.name ?? ""} ${record.slug ?? ""} ${record.description ?? ""} ${record.details?.role ?? ""}`.toLowerCase().includes(normalized));
  }, [query, records]);
  const visibleRecords = filteredRecords.filter((record) => !statusFilter || statusOf(record, isContent) === statusFilter);

  function openNewRecord() {
    setEditing(null);
    setImageUrl("");
    setError("");
    setNotice("");
    setModalOpen(true);
  }

  function openEditRecord(record: ManagedRecord) {
    setEditing(record);
    setImageUrl(typeof record.flyerUrl === "string" ? record.flyerUrl : typeof record.details?.imageUrl === "string" ? record.details.imageUrl : "");
    setError("");
    setNotice("");
    setModalOpen(true);
  }

  async function uploadEventImage(file: File | undefined) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setError("Choose a JPEG, PNG, WebP, or GIF image.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError("The image must be 15 MB or smaller.");
      return;
    }
    setImageUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.set("file", file);
      const uploaded = await authUpload<{ url: string }>(section === "leadership" || section === "testimonials" ? "/media/upload?purpose=image" : "/media/upload", form);
      if (!uploaded?.url) throw new Error("The upload service did not return an image URL.");
      setImageUrl(uploaded.url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not upload this event image.");
    } finally {
      setImageUploading(false);
    }
  }

  async function saveRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const fields = Object.fromEntries(config.fields.filter((field) => field.name !== "status").map((field) => {
      const value = field.type === "checkbox"
        ? values.has(field.name)
        : String(values.get(field.name) ?? "").trim();
      return [field.name, config.adminApi && value === "" ? null : value];
    }));
    const status = String(values.get("status") ?? "draft");
    const previousStatus = editing ? statusOf(editing, true) : "draft";
    if ((status !== previousStatus || status === "published") && (status !== "draft" || previousStatus === "published")) {
      const title = (editing ? nameOf(editing) : String(fields.title ?? fields.name ?? "")) || "this record";
      const actionLabel = status === "published" ? "publish" : status === "archived" ? "archive" : "unpublish";
      if (!await confirm({ title: `${actionLabel[0].toUpperCase()}${actionLabel.slice(1)} this ${config.title.slice(0, -1).toLowerCase()}?`, description: status === "published" ? `“${title}” will be visible on the public website.` : status === "archived" ? `“${title}” will be removed from active listings.` : `“${title}” will no longer appear on the public website.`, confirmLabel: `${actionLabel[0].toUpperCase()}${actionLabel.slice(1)}`, tone: status === "published" ? "primary" : "danger" })) return;
    }
    setSaving(true);
    setError("");
    const body = isContent
      ? {
          type: config.contentType,
          title: fields.title,
          description: fields.description || undefined,
          details: {
            ...Object.fromEntries(config.fields.filter((field) => field.storage === "details").map((field) => {
              const value = fields[field.name];
              return [field.name, value];
            })),
            ...(section === "leadership" ? { publicationStatus: status } : {}),
          },
          published: status === "published",
        }
      : { ...fields, status };

    try {
      if (editing) {
        const api = config.adminApi ?? config.api;
        const path = isContent ? `/admin/content/${editing.id}` : `${api}/${editing.id}`;
        await authMutation(path, "PATCH", body);
      } else {
        const path = isContent ? "/admin/content" : config.adminApi ?? config.api;
        await authMutation(path, "POST", body);
      }
      setModalOpen(false);
      setNotice(editing ? "Changes saved." : "Record created.");
      await loadRecords();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save this record.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteRecord(record: ManagedRecord) {
    const title = record.title ?? record.name ?? "this record";
    if (!await confirm({ title: "Delete this record?", description: `“${title}” will be permanently deleted. This action cannot be undone.`, confirmLabel: "Delete", tone: "danger" })) return;
    setError("");
    setNotice("");
    try {
      const api = config.adminApi ?? config.api;
      const path = isContent ? `/admin/content/${record.id}` : `${api}/${record.id}`;
      await authMutation(path, "DELETE");
      setNotice("Record deleted.");
      await loadRecords();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete this record.");
    }
  }

  return (
    <div>
      <header className="flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Church · Admin</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground">{config.title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">{config.description}</p>
        </div>
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-md transition hover:bg-primary-hover active:scale-[0.98]"
          onClick={openNewRecord}
          type="button"
        >
          <Plus aria-hidden="true" className="mr-2 size-4" /> {section === "leadership" ? "Add Leader" : "Add record"}
        </button>
      </header>

      {error && (
        <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300" role="status">
          {notice}
        </p>
      )}

      <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface shadow-xs" aria-label={`${config.title} management`}>
        <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <h2 className="font-display text-base font-bold text-foreground">All {config.title.toLowerCase()}</h2>
            <p className="mt-0.5 text-xs text-muted">
              {records.length} record{records.length === 1 ? "" : "s"} in the database
            </p>
          </div>
          {section === "leadership" && (
            <label className="flex items-center text-xs font-bold uppercase tracking-wider text-muted">
              Status
              <select
                className="ml-2 h-10 rounded-xl border border-border bg-surface px-3 text-xs text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                onChange={(event) => setStatusFilter(event.target.value)}
                value={statusFilter}
              >
                <option value="">All statuses</option>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="relative w-full sm:max-w-sm">
            <span className="sr-only">Search {config.title}</span>
            <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-3.5 text-sm text-foreground outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${config.title.toLowerCase()}…`}
              type="search"
              value={query}
            />
          </div>
        </div>

        {loading ? (
          <p className="p-8 text-sm text-muted">Loading records…</p>
        ) : visibleRecords.length ? (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[48rem] text-left text-sm">
                <thead className="border-b border-border bg-surface-strong/50 text-xs font-bold uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-6 py-3.5" scope="col">Name</th>
                    <th className="px-6 py-3.5" scope="col">Details</th>
                    <th className="px-6 py-3.5" scope="col">Status</th>
                    <th className="px-6 py-3.5" scope="col">Updated</th>
                    <th className="px-6 py-3.5 text-right" scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {visibleRecords.map((record) => {
                    const status = statusOf(record, isContent);
                    const updated = record.updatedAt ?? record.createdAt;
                    return (
                      <tr className="transition hover:bg-surface-strong/40" key={record.id}>
                        <td className="max-w-xs px-6 py-4">
                          <div className="flex items-center gap-3">
                            {section === "leadership" && typeof record.details?.imageUrl === "string" && (
                              <img alt="" className="size-11 rounded-full object-cover border border-border" src={record.details.imageUrl} />
                            )}
                            <div>
                              <p className="truncate font-display text-sm font-bold text-foreground">{nameOf(record)}</p>
                              <p className="mt-0.5 truncate text-xs text-muted">
                                {section === "leadership" ? String(record.details?.role ?? "") : secondaryLabel(record)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="max-w-sm px-6 py-4 text-muted">
                          <span className="line-clamp-2 text-xs leading-relaxed">{descriptionOf(record)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                              status === "published"
                                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                                : status === "archived"
                                  ? "bg-muted/10 text-muted"
                                  : "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                            }`}
                          >
                            {status.replaceAll("_", " ")}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-xs text-muted">{displayDate(updated)}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-1.5">
                            {section === "leadership" && (
                              <button
                                aria-label={`View ${record.title ?? record.name}`}
                                className="grid size-9 place-items-center rounded-xl border border-border bg-surface text-muted transition hover:border-primary/40 hover:text-primary"
                                onClick={() => setViewing(record)}
                                type="button"
                              >
                                <Eye aria-hidden="true" className="size-4" />
                              </button>
                            )}
                            <button
                              aria-label={`Edit ${record.title ?? record.name}`}
                              className="grid size-9 place-items-center rounded-xl border border-border bg-surface text-muted transition hover:border-primary/40 hover:text-primary"
                              onClick={() => openEditRecord(record)}
                              type="button"
                            >
                              <Pencil aria-hidden="true" className="size-4" />
                            </button>
                            <button
                              aria-label={`Delete ${record.title ?? record.name}`}
                              className="grid size-9 place-items-center rounded-xl border border-border bg-surface text-muted transition hover:border-red-300 hover:text-red-700"
                              onClick={() => void deleteRecord(record)}
                              type="button"
                            >
                              <Trash2 aria-hidden="true" className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="divide-y divide-border md:hidden">
              {visibleRecords.map((record) => {
                const status = statusOf(record, isContent);
                return (
                  <article className="p-5" key={record.id}>
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-display text-base font-bold text-foreground">{nameOf(record)}</h3>
                      <span className="rounded-full bg-surface-strong px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-muted">
                        {status}
                      </span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted">{descriptionOf(record)}</p>
                    <p className="mt-3 text-xs text-muted/80">Updated {displayDate(record.updatedAt ?? record.createdAt)}</p>
                    <div className="mt-4 flex gap-3">
                      {section === "leadership" && (
                        <button
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-primary transition hover:bg-surface-strong"
                          onClick={() => setViewing(record)}
                          type="button"
                        >
                          <Eye aria-hidden="true" className="size-3.5" /> View
                        </button>
                      )}
                      <button
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-foreground transition hover:bg-surface-strong"
                        onClick={() => openEditRecord(record)}
                        type="button"
                      >
                        <Pencil aria-hidden="true" className="size-3.5" /> Edit
                      </button>
                      <button
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300"
                        onClick={() => void deleteRecord(record)}
                        type="button"
                      >
                        <Trash2 aria-hidden="true" className="size-3.5" /> Delete
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        ) : (
          <div className="p-12 text-center">
            <h3 className="font-display text-base font-bold text-foreground">
              {query ? "No matching records" : `No ${config.title.toLowerCase()} yet`}
            </h3>
            <p className="mt-1 text-sm text-muted">
              {query ? "Try another search term." : "Add a record to get started. Drafts remain private until published."}
            </p>
            {!query && (
              <button
                className="mt-5 inline-flex min-h-10 items-center rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground shadow-xs transition hover:bg-primary-hover"
                onClick={openNewRecord}
                type="button"
              >
                <Plus aria-hidden="true" className="mr-1.5 size-4" /> Add record
              </button>
            )}
          </div>
        )}
      </section>

      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:items-center sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModalOpen(false);
          }}
        >
          <section
            aria-labelledby="record-form-title"
            aria-modal="true"
            className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-border bg-surface shadow-2xl sm:rounded-2xl"
            role="dialog"
          >
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-border bg-surface/95 px-6 py-4 backdrop-blur-sm sm:px-7">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground" id="record-form-title">
                  {editing ? `Edit ${config.title.slice(0, -1)}` : `Add ${config.title.slice(0, -1)}`}
                </h2>
                <p className="mt-0.5 text-xs text-muted">Complete the fields and choose whether to publish this record.</p>
              </div>
              <button
                aria-label="Close editor"
                className="grid size-9 place-items-center rounded-xl border border-border text-muted transition hover:bg-surface-strong hover:text-foreground"
                onClick={() => setModalOpen(false)}
                type="button"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
            <form className="space-y-5 p-6 sm:p-7" key={editing?.id ?? "new-record"} onSubmit={saveRecord}>
              <div className="grid gap-5 sm:grid-cols-2">
                {config.fields.map((field) => {
                  const value = field.name === "status" ? statusOf(editing ?? { id: "" }, isContent) : editing ? readField(editing, field) : "";
                  const wide = field.type === "textarea" || field.type === "image" || field.name === "status" || field.type === "checkbox";
                  if (field.type === "checkbox") {
                    return (
                      <label className="flex min-h-11 items-center gap-3 text-xs font-bold uppercase tracking-wider text-muted sm:col-span-2" key={field.name}>
                        <input className="size-4 rounded-sm accent-primary" defaultChecked={editing ? readField(editing, field) === "true" : false} name={field.name} type="checkbox" />
                        {field.label}
                      </label>
                    );
                  }
                  return (
                    <label className={`block text-xs font-bold uppercase tracking-wider text-muted ${wide ? "sm:col-span-2" : ""}`} key={field.name}>
                      {field.label}
                      {field.required && <span className="ml-1 text-red-500">*</span>}
                      {field.type === "image" ? (
                        <div className="mt-2 space-y-3">
                          {imageUrl && (
                            <div aria-label="Current profile image" className="aspect-[4/3] max-w-sm rounded-xl border border-border bg-surface-strong bg-cover bg-center" role="img" style={{ backgroundImage: `url("${imageUrl}")` }} />
                          )}
                          <input
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="block min-h-11 w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-surface-strong file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-foreground hover:file:bg-surface-strong/80"
                            disabled={imageUploading}
                            onChange={(event) => void uploadEventImage(event.target.files?.[0])}
                            type="file"
                          />
                          <input name={field.name} type="hidden" value={imageUrl} />
                          <p className="text-[11px] text-muted">
                            {imageUploading ? "Uploading securely to Cloudinary…" : "JPEG, PNG, WebP, or GIF · up to 15 MB"}
                          </p>
                        </div>
                      ) : field.type === "textarea" ? (
                        <textarea
                          className="mt-1.5 min-h-28 w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-sm leading-relaxed text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                          defaultValue={value}
                          maxLength={field.name === "description" || field.name === "ministryResponsibilities" ? 10000 : undefined}
                          name={field.name}
                          required={field.required}
                        />
                      ) : field.type === "select" ? (
                        <select
                          className="mt-1.5 h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                          defaultValue={value || "draft"}
                          name={field.name}
                          required={field.required}
                        >
                          {field.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          className="mt-1.5 h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                          defaultValue={value}
                          maxLength={field.name === "title" || field.name === "name" ? 180 : undefined}
                          min={field.type === "number" ? 0 : undefined}
                          name={field.name}
                          required={field.required}
                          type={field.type ?? "text"}
                        />
                      )}
                    </label>
                  );
                })}
              </div>
              {error && (
                <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300" role="alert">
                  {error}
                </p>
              )}
              <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
                <button
                  className="min-h-11 rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-foreground transition hover:bg-surface-strong"
                  onClick={() => setModalOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="min-h-11 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground shadow-md transition hover:bg-primary-hover disabled:opacity-60"
                  disabled={saving || imageUploading}
                  type="submit"
                >
                  {saving ? "Saving…" : editing ? "Save changes" : "Create record"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {viewing && section === "leadership" && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:items-center sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setViewing(null);
          }}
        >
          <section
            aria-labelledby="leader-detail-title"
            aria-modal="true"
            className="max-h-[94vh] w-full max-w-xl overflow-y-auto rounded-t-2xl border border-border bg-surface shadow-2xl sm:rounded-2xl"
            role="dialog"
          >
            <div className="flex items-start justify-between border-b border-border px-6 py-4 sm:px-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary">Leader Profile</p>
                <h2 className="mt-1 font-display text-xl font-bold text-foreground" id="leader-detail-title">
                  {viewing.title}
                </h2>
              </div>
              <button
                aria-label="Close profile details"
                className="grid size-9 place-items-center rounded-xl border border-border text-muted transition hover:bg-surface-strong hover:text-foreground"
                onClick={() => setViewing(null)}
                type="button"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
            <div className="space-y-5 p-6 sm:p-7">
              {typeof viewing.details?.imageUrl === "string" && (
                <img alt={`${viewing.title} profile`} className="aspect-[4/3] w-full rounded-xl object-cover border border-border" src={viewing.details.imageUrl} />
              )}
              <p className="font-display text-sm font-bold text-primary">{String(viewing.details?.role ?? "")}</p>
              <div>
                <h3 className="font-display text-sm font-bold text-foreground">Biography</h3>
                <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-muted">
                  {viewing.description || "No biography provided."}
                </p>
              </div>
              {typeof viewing.details?.ministryResponsibilities === "string" && (
                <div>
                  <h3 className="font-display text-sm font-bold text-foreground">Ministry Responsibilities</h3>
                  <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-muted">
                    {viewing.details.ministryResponsibilities}
                  </p>
                </div>
              )}
              <p className="text-xs text-muted">
                Status: {statusOf(viewing, true)} · Display order: {String(viewing.details?.displayOrder ?? 0)}
              </p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
