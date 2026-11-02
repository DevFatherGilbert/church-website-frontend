"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Archive, Calendar, Check, Clock, Eye, MapPin, Pencil, Plus, Search, Sparkles, Trash2, Users, X } from "lucide-react";
import { authGet, authMutation } from "@/lib/api/church-api";
import { useConfirmation } from "@/components/admin/confirmation-dialog";
import {
  ActionSuccessPopup,
  RecordSuccessBadge,
  useActionSuccess,
} from "./action-success-popup";
import {
  formatServiceDate,
  formatServiceTime,
  serviceTypes,
  sortServices,
  toChurchService,
  weekdays,
  type ChurchService,
} from "@/lib/content/services";

type ManagedService = ChurchService & {
  slug?: string;
  published?: boolean;
  updatedAt?: string;
  createdAt?: string;
};

type ApiRecord = {
  id: string;
  title: string;
  description?: string | null;
  slug: string;
  details: Record<string, unknown>;
  published?: boolean;
  updatedAt?: string;
  createdAt?: string;
};

const empty = (): Partial<ManagedService> => ({
  scheduleType: "weekly",
  dayOfWeek: 0,
  startTime: "",
  endTime: null,
  serviceType: serviceTypes[0],
  location: "",
  targetAudience: null,
  instructions: null,
  active: true,
  displayOrder: 0,
  publicationStatus: "draft",
  description: "",
});

function asManaged(record: ApiRecord): ManagedService {
  return {
    ...toChurchService(record),
    slug: record.slug,
    published: record.published,
    updatedAt: record.updatedAt,
    createdAt: record.createdAt,
  };
}

export function ServiceScheduleManager() {
  const confirm = useConfirmation();
  const [records, setRecords] = useState<ManagedService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editing, setEditing] = useState<Partial<ManagedService> | null>(null);
  const [viewing, setViewing] = useState<ManagedService | null>(null);
  const [saving, setSaving] = useState(false);
  const { successData, showSuccess, dismissSuccess, recentlyUpdatedId } = useActionSuccess();

  const load = useCallback(async () => {
    const data = await authGet<{ items?: ApiRecord[] }>("/admin/content/services");
    return sortServices((data.items ?? []).map(asManaged)) as ManagedService[];
  }, []);

  const refresh = useCallback(async () => {
    setRecords(await load());
  }, [load]);

  useEffect(() => {
    let active = true;
    void load()
      .then((services) => {
        if (active) setRecords(services);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Could not load services.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [load]);

  const visible = useMemo(
    () =>
      records.filter(
        (service) =>
          (!query || `${service.title} ${service.location}`.toLowerCase().includes(query.toLowerCase())) &&
          (!typeFilter || service.serviceType === typeFilter) &&
          (!statusFilter || service.publicationStatus === statusFilter)
      ),
    [records, query, statusFilter, typeFilter]
  );

  function open(record?: ManagedService) {
    setError("");
    setNotice("");
    setEditing(record ? { ...record } : empty());
  }

  async function persist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const data = new FormData(event.currentTarget);
    const scheduleType = String(data.get("scheduleType"));
    const status = String(data.get("publicationStatus"));
    const previousStatus = editing.publicationStatus ?? "draft";
    const serviceTitle = String(data.get("title")).trim();
    const changesPublicStatus = status !== previousStatus && (status !== "draft" || previousStatus === "published");
    const savingLive = status === "published";

    if (
      (changesPublicStatus || savingLive) &&
      !(await confirm({
        title: `${
          status === "published"
            ? previousStatus === "published"
              ? "Save live changes to"
              : "Publish"
            : status === "archived"
            ? "Archive"
            : "Unpublish"
        } this service?`,
        description:
          status === "published"
            ? `“${serviceTitle}” will be visible on the public website.`
            : status === "archived"
            ? `“${serviceTitle}” will be removed from active service listings.`
            : `“${serviceTitle}” will no longer appear publicly.`,
        confirmLabel:
          status === "published"
            ? previousStatus === "published"
              ? "Save live changes"
              : "Publish service"
            : status === "archived"
            ? "Archive service"
            : "Save as draft",
        tone: status === "published" ? "primary" : "danger",
      }))
    )
      return;

    const details = {
      scheduleType,
      serviceType: String(data.get("serviceType")),
      dayOfWeek: scheduleType === "weekly" ? Number(data.get("dayOfWeek")) : null,
      serviceDate: scheduleType === "special" ? String(data.get("serviceDate")) : null,
      startTime: String(data.get("startTime")),
      endTime: String(data.get("endTime")) || null,
      location: String(data.get("location")),
      targetAudience: String(data.get("targetAudience")) || null,
      instructions: String(data.get("instructions")) || null,
      active: data.get("active") === "on",
      displayOrder: Number(data.get("displayOrder")),
      publicationStatus: status,
    };
    const body = {
      type: "services",
      title: serviceTitle,
      description: String(data.get("description")) || undefined,
      details,
      published: status === "published",
    };

    setSaving(true);
    setError("");
    try {
      if (editing.id) await authMutation(`/admin/content/${editing.id}`, "PATCH", body);
      else await authMutation("/admin/content", "POST", body);
      setEditing(null);
      showSuccess({
        id: editing.id,
        name: serviceTitle,
        action: status === "published" ? "published" : "saved",
        message:
          status === "published"
            ? "Service schedule is live and visible to church attendees."
            : "Service details saved successfully.",
      });
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save service.");
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(record: ManagedService, action: "publish" | "unpublish" | "archive") {
    const label = action === "publish" ? "Publish" : action === "archive" ? "Archive" : "Unpublish";
    if (
      !(await confirm({
        title: `${label} this service?`,
        description:
          action === "publish"
            ? `“${record.title}” will be visible on the public website.`
            : action === "archive"
            ? `“${record.title}” will be removed from active service listings.`
            : `“${record.title}” will no longer appear publicly.`,
        confirmLabel: `${label} service`,
        tone: action === "publish" ? "primary" : "danger",
      }))
    )
      return;
    setError("");
    try {
      const details = {
        ...record,
        publicationStatus: action === "publish" ? "published" : action === "archive" ? "archived" : "unpublished",
      };
      await authMutation(
        `/admin/content/${record.id}`,
        "PATCH",
        action === "unpublish" ? { unpublish: true } : { details, published: action === "publish" }
      );
      showSuccess({
        id: record.id,
        name: record.title,
        action: action === "publish" ? "published" : "updated",
        message: `Service status updated to ${action}.`,
      });
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update this service.");
    }
  }

  async function remove(record: ManagedService) {
    if (
      !(await confirm({
        title: "Delete this service?",
        description: `“${record.title}” will be permanently deleted. This action cannot be undone.`,
        confirmLabel: "Delete service",
        tone: "danger",
      }))
    )
      return;
    try {
      await authMutation(`/admin/content/${record.id}`, "DELETE");
      showSuccess({
        id: record.id,
        name: record.title,
        action: "deleted",
        message: "Service permanently deleted.",
      });
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete this service.");
    }
  }

  return (
    <div>
      <ActionSuccessPopup data={successData} onDismiss={dismissSuccess} />
      <header className="flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Church · Admin workspace</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground">
            Services and Schedule Management
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Create weekly and special services. Only active, published schedules appear on the public website.
          </p>
        </div>
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-xs hover:bg-primary-hover transition"
          onClick={() => open()}
          type="button"
        >
          <Plus className="mr-2 size-4" />
          Add Service
        </button>
      </header>

      {error && (
        <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800" role="status">
          {notice}
        </p>
      )}

      <section className="admin-card mt-6 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm font-medium text-muted">
            {records.length} service{records.length === 1 ? "" : "s"} in the database
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              aria-label="Filter by service type"
              className="h-11 rounded-xl border border-border bg-surface px-3.5 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              onChange={(event) => setTypeFilter(event.target.value)}
              value={typeFilter}
            >
              <option value="">All types</option>
              {serviceTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
            <select
              aria-label="Filter by publication status"
              className="h-11 rounded-xl border border-border bg-surface px-3.5 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              onChange={(event) => setStatusFilter(event.target.value)}
              value={statusFilter}
            >
              <option value="">All statuses</option>
              {["draft", "published", "unpublished", "archived"].map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
            <label className="relative">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input
                className="h-11 rounded-xl border border-border bg-surface pl-10 pr-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search services…"
                type="search"
                value={query}
              />
            </label>
          </div>
        </div>

        {loading ? (
          <p className="p-8 text-sm text-muted">Loading services…</p>
        ) : visible.length ? (
          <div className="divide-y divide-border">
            {visible.map((service) => {
              const isHighlighted = recentlyUpdatedId === service.id || successData?.name === service.title;
              return (
                <article
                  className={`flex flex-col gap-4 p-5 transition duration-300 lg:flex-row lg:items-center lg:justify-between ${
                    isHighlighted ? "bg-emerald-50/60 ring-2 ring-emerald-500/40 rounded-xl" : "hover:bg-surface-strong/40"
                  }`}
                  key={service.id}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-base font-bold text-foreground">{service.title}</h2>
                      <RecordSuccessBadge
                        action={successData?.action === "published" ? "published" : "saved"}
                        isCurrent={isHighlighted}
                      />
                      <span
                        className={`admin-badge ${
                          service.publicationStatus === "published"
                            ? "admin-badge-published"
                            : service.publicationStatus === "archived"
                            ? "admin-badge-archived"
                            : "admin-badge-draft"
                        }`}
                      >
                        {service.publicationStatus}
                      </span>
                      {!service.active && (
                        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted">
                      {service.serviceType} · {formatServiceDate(service)} · {formatServiceTime(service)} ·{" "}
                      {service.location}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                  <button
                    aria-label={`View ${service.title}`}
                    className="grid size-10 place-items-center rounded-xl border border-border bg-surface text-muted transition hover:border-primary/40 hover:text-primary"
                    onClick={() => setViewing(service)}
                    type="button"
                  >
                    <Eye className="size-4" />
                  </button>
                  <button
                    aria-label={`Edit ${service.title}`}
                    className="grid size-10 place-items-center rounded-xl border border-border bg-surface text-muted transition hover:border-primary/40 hover:text-primary"
                    onClick={() => open(service)}
                    type="button"
                  >
                    <Pencil className="size-4" />
                  </button>
                  {service.publicationStatus !== "published" && service.active && (
                    <button
                      className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
                      onClick={() => void changeStatus(service, "publish")}
                      type="button"
                    >
                      <Check className="size-4" />
                      Publish
                    </button>
                  )}
                  {service.publicationStatus === "published" && (
                    <button
                      className="min-h-10 rounded-xl border border-border bg-surface px-3.5 text-sm font-semibold text-foreground transition hover:bg-surface-strong"
                      onClick={() => void changeStatus(service, "unpublish")}
                      type="button"
                    >
                      Unpublish
                    </button>
                  )}
                  {service.publicationStatus !== "archived" && (
                    <button
                      aria-label={`Archive ${service.title}`}
                      className="grid size-10 place-items-center rounded-xl border border-border bg-surface text-muted transition hover:text-amber-700"
                      onClick={() => void changeStatus(service, "archive")}
                      type="button"
                    >
                      <Archive className="size-4" />
                    </button>
                  )}
                  <button
                    aria-label={`Delete ${service.title}`}
                    className="grid size-10 place-items-center rounded-xl border border-red-200 bg-surface text-red-700 transition hover:bg-red-50"
                    onClick={() => void remove(service)}
                    type="button"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </article>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="font-display text-base font-bold text-foreground">No services found</p>
            <button className="mt-4 text-sm font-semibold text-primary hover:underline" onClick={() => open()} type="button">
              Add a service
            </button>
          </div>
        )}
      </section>

      {editing && (
        <ServiceForm
          onClose={() => setEditing(null)}
          onSubmit={persist}
          saving={saving}
          service={editing}
        />
      )}
      {viewing && <ServiceDetails onClose={() => setViewing(null)} service={viewing} />}
    </div>
  );
}

function ServiceForm({
  service,
  saving,
  onClose,
  onSubmit,
}: {
  service: Partial<ManagedService>;
  saving: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const [scheduleType, setScheduleType] = useState(service.scheduleType ?? "weekly");
  const isEditing = Boolean(service.id);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <form
        aria-modal="true"
        className="relative flex flex-col max-h-[92vh] w-full max-w-3xl rounded-3xl border border-slate-200/90 bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onSubmit={onSubmit}
        role="dialog"
      >
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 sm:px-8 py-5 backdrop-blur-md">
          <div className="flex items-center gap-3.5 min-w-0 pr-4">
            <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 text-primary border border-primary/20 shadow-xs">
              <Clock className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 truncate">
                  {isEditing ? `Edit: ${service.title || "Service"}` : "Create Service Schedule"}
                </h2>
                <span className="hidden sm:inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                  {isEditing ? "Editing" : "New"}
                </span>
              </div>
              <p className="mt-0.5 text-xs sm:text-sm text-slate-500 truncate">
                Configure service timings, recurrence, and audience. (Africa/Kigali CAT)
              </p>
            </div>
          </div>

          <button
            aria-label="Close service editor"
            className="grid size-10 place-items-center rounded-2xl border border-slate-200/80 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-all duration-200 hover:rotate-90 shrink-0"
            disabled={saving}
            onClick={onClose}
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 sm:px-8 py-6 space-y-6 flex-1 text-slate-900">
          {/* Section 1: Service Basics */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Calendar className="size-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                1. Service Basics & Type
              </h3>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Service Name" name="title" required value={service.title} />

              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Service Type <span className="text-red-500">*</span>
                <select
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 text-sm font-medium text-slate-900 outline-none transition-all hover:bg-white focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
                  defaultValue={service.serviceType}
                  name="serviceType"
                >
                  {serviceTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 sm:col-span-2">
                Schedule Recurrence
                <select
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 text-sm font-medium text-slate-900 outline-none transition-all hover:bg-white focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
                  name="scheduleType"
                  onChange={(event) => setScheduleType(event.target.value as "weekly" | "special")}
                  value={scheduleType}
                >
                  <option value="weekly">Repeats Weekly</option>
                  <option value="special">One-Time Special Service</option>
                </select>
              </label>

              {scheduleType === "weekly" ? (
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 sm:col-span-2">
                  Day of Week <span className="text-red-500">*</span>
                  <select
                    className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 text-sm font-medium text-slate-900 outline-none transition-all hover:bg-white focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
                    defaultValue={service.dayOfWeek ?? 0}
                    name="dayOfWeek"
                  >
                    {weekdays.map((day, index) => (
                      <option key={day} value={index}>
                        {day}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <Field
                  label="Special Service Date"
                  name="serviceDate"
                  required
                  type="date"
                  value={service.serviceDate}
                />
              )}
            </div>
          </div>

          {/* Section 2: Timing & Location */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Clock className="size-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                2. Timing & Location
              </h3>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Start Time" name="startTime" required type="time" value={service.startTime} />
              <Field label="End Time" name="endTime" type="time" value={service.endTime} />
              <Field label="Location / Venue" name="location" required value={service.location} />
              <Field label="Target Audience (e.g. Everyone, Youth)" name="targetAudience" value={service.targetAudience} />
            </div>
          </div>

          {/* Section 3: Details & Publication */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Sparkles className="size-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                3. Details & Publication Status
              </h3>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field area label="Description (What to expect)" name="description" value={service.description} />
              <Field area label="Special Instructions (e.g. Bring Bible, Livestream info)" name="instructions" value={service.instructions} />
              <Field label="Display Order" min={0} name="displayOrder" type="number" value={service.displayOrder} />

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 self-end">
                <input
                  className="size-5 rounded-md accent-primary"
                  defaultChecked={service.active !== false}
                  id="service-active-toggle"
                  name="active"
                  type="checkbox"
                />
                <label className="text-xs font-bold text-slate-700 cursor-pointer" htmlFor="service-active-toggle">
                  Active (Eligible for public display)
                </label>
              </div>

              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 sm:col-span-2">
                Publication Status <span className="text-red-500">*</span>
                <select
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 text-sm font-medium text-slate-900 outline-none transition-all hover:bg-white focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
                  defaultValue={service.publicationStatus ?? "draft"}
                  name="publicationStatus"
                >
                  <option value="draft">Save as Draft (Private)</option>
                  <option value="published">Publish (Live on Website)</option>
                  <option value="unpublished">Unpublished (Hidden)</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-20 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/90 px-6 sm:px-8 py-4 backdrop-blur-md">
          <button
            className="w-full sm:w-auto h-11 px-5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            disabled={saving}
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="w-full sm:w-auto h-11 px-6 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-white text-sm font-bold shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            disabled={saving}
            type="submit"
          >
            {saving ? (
              "Saving Service…"
            ) : isEditing ? (
              <>
                <Check className="size-4" /> Save Changes
              </>
            ) : (
              <>
                <Plus className="size-4" /> Create Service
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  type = "text",
  required,
  area,
  min,
}: {
  label: string;
  name: string;
  value?: string | number | null;
  type?: string;
  required?: boolean;
  area?: boolean;
  min?: number;
}) {
  return (
    <label className={`block text-xs font-bold uppercase tracking-wider text-slate-600 ${area ? "sm:col-span-2" : ""}`}>
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
      {area ? (
        <textarea
          className="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm leading-relaxed text-slate-900 outline-none transition-all hover:bg-white focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
          defaultValue={value ?? ""}
          name={name}
        />
      ) : (
        <input
          className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 text-sm text-slate-900 outline-none transition-all hover:bg-white focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
          defaultValue={value ?? ""}
          min={min}
          name={name}
          required={required}
          type={type}
        />
      )}
    </label>
  );
}

function ServiceDetails({ service, onClose }: { service: ManagedService; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        aria-modal="true"
        className="relative flex flex-col max-h-[90vh] w-full max-w-xl rounded-3xl border border-slate-200/90 bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
      >
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 sm:px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Service Overview</p>
              <h2 className="mt-0.5 font-display text-xl font-bold text-slate-900">{service.title}</h2>
            </div>
          </div>
          <button
            aria-label="Close details"
            className="grid size-9 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            onClick={onClose}
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 sm:p-8 space-y-5 text-slate-900">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">Schedule</dt>
              <dd className="mt-1 font-semibold text-slate-900">
                {formatServiceDate(service)} · {formatServiceTime(service)}
              </dd>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">Location</dt>
              <dd className="mt-1 font-semibold text-slate-900">{service.location}</dd>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">Status</dt>
              <dd className="mt-1 font-semibold capitalize text-slate-900">
                {service.publicationStatus}
                {service.active ? " · Active" : " · Inactive"}
              </dd>
            </div>
            {service.targetAudience && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">Audience</dt>
                <dd className="mt-1 font-semibold text-slate-900">{service.targetAudience}</dd>
              </div>
            )}
          </dl>
          {service.description && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Description</p>
              <p className="text-sm leading-relaxed text-slate-700">{service.description}</p>
            </div>
          )}
          {service.instructions && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Instructions</p>
              <p className="text-sm leading-relaxed text-slate-700">{service.instructions}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
