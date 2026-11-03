"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Archive, Bell, CalendarClock, Check, ImagePlus, Pencil, Search, Sparkles, X } from "lucide-react";
import { authGet, authMutation, authUpload } from "@/lib/api/church-api";
import { useConfirmation } from "@/components/admin/confirmation-dialog";
import { ImageUploadDropzone } from "@/components/admin/management/image-upload-dropzone";
import {
  ActionSuccessPopup,
  RecordSuccessBadge,
  useActionSuccess,
} from "./action-success-popup";
import {
  announcementCategories,
  announcementCategoryLabel,
  announcementStatuses,
  type Announcement,
  type AnnouncementCategory,
  type AnnouncementStatus,
} from "@/lib/content/announcements";

const maxImageSize = 15 * 1024 * 1024;
const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function isCloudinaryImageUrl(value: string) {
  try {
    const url = new URL(value);
    const path = url.pathname.split("/");
    const sharedCdn = url.hostname === "res.cloudinary.com" && path[2] === "image" && path[3] === "upload";
    const privateCdn = url.hostname.endsWith("-res.cloudinary.com") && path[1] === "image" && path[2] === "upload";
    const configuredDeliveryHost = process.env.NEXT_PUBLIC_CLOUDINARY_DELIVERY_HOST?.trim().toLowerCase();
    const customCdn = Boolean(configuredDeliveryHost) && url.hostname === configuredDeliveryHost && url.pathname.length > 1;
    return url.protocol === "https:" && !url.username && !url.password && (sharedCdn || privateCdn || customCdn);
  } catch {
    return false;
  }
}

function localDateTime(value?: string) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function statusStyle(status: AnnouncementStatus) {
  if (status === "PUBLISHED") return "admin-badge-published";
  if (status === "SCHEDULED") return "admin-badge-scheduled";
  if (status === "EXPIRED" || status === "ARCHIVED") return "admin-badge-archived";
  if (status === "UNPUBLISHED") return "admin-badge-unpublished";
  return "admin-badge-draft";
}


export function AnnouncementManager() {
  const confirm = useConfirmation();
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<AnnouncementStatus | "">("");
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<AnnouncementCategory | "">("");
  const [publicationDate, setPublicationDate] = useState(localDateTime());
  const [expiryDate, setExpiryDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [imageName, setImageName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [processingId, setProcessingId] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const { successData, showSuccess, dismissSuccess, recentlyUpdatedId } = useActionSuccess();

  const loadAnnouncements = useCallback(async () => {
    const result = await authGet<{ items: Announcement[] }>("/admin/announcements");
    setItems(result.items);
  }, []);

  useEffect(() => {
    let active = true;
    authGet<{ items: Announcement[] }>("/admin/announcements").then(
      (result) => { if (active) setItems(result.items); },
      (cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : "Could not load announcements."); },
    ).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  useEffect(() => {
    const timer = window.setTimeout(() => setCurrentTime(Date.now()), 0);
    const interval = window.setInterval(() => setCurrentTime(Date.now()), 60_000);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
    };
  }, []);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items.filter((item) =>
      (!normalized || item.title.toLowerCase().includes(normalized)) &&
      (!categoryFilter || item.details.category === categoryFilter) &&
      (!statusFilter || item.details.status === statusFilter),
    );
  }, [categoryFilter, items, query, statusFilter]);

  function resetForm(record?: Announcement) {
    setEditing(record ?? null);
    setTitle(record?.title ?? "");
    setDescription(record?.description ?? "");
    setCategory(record?.details.category ?? "");
    setPublicationDate(localDateTime(record?.details.publicationDate));
    setExpiryDate(localDateTime(record?.details.expiryDate ?? undefined));
    setImageUrl(record?.details.imageUrl ?? "");
    setPreviewUrl("");
    setImageName("");
    setError("");
    setNotice("");
    setModalOpen(true);
  }

  async function uploadImage(file: File) {
    setError("");
    if (!acceptedImageTypes.includes(file.type)) {
      setError("Choose a JPEG, PNG, WebP, or GIF image.");
      return;
    }
    if (file.size > maxImageSize) {
      setError("The image must be 15 MB or smaller.");
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
    setImageName(file.name);
    setUploading(true);
    try {
      const form = new FormData();
      form.set("file", file);
      const uploaded = await authUpload<{ url: string }>("/media/upload?purpose=announcements", form);
      if (!uploaded?.url) throw new Error("The backend did not return an image URL.");
      if (!isCloudinaryImageUrl(uploaded.url)) {
        let host = "an invalid URL";
        try { host = new URL(uploaded.url).hostname; } catch { /* Keep the upload-specific error below. */ }
        throw new Error(`The upload backend returned ${host}, not a recognized Cloudinary delivery URL. Restart or redeploy the backend with Cloudinary configured. If this is your Cloudinary custom hostname, set CLOUDINARY_DELIVERY_HOST on the backend and NEXT_PUBLIC_CLOUDINARY_DELIVERY_HOST on the frontend.`);
      }
      setImageUrl(uploaded.url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not upload this image.");
    } finally {
      setUploading(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const action = String(form.get("action") ?? "DRAFT") as AnnouncementStatus;
    const publicationTimestamp = new Date(publicationDate).getTime();
    const expiryTimestamp = expiryDate ? new Date(expiryDate).getTime() : null;
    if (!imageUrl) {
      setError("Choose an image for this announcement before saving.");
      return;
    }
    if (!isCloudinaryImageUrl(imageUrl)) {
      setError("This announcement image is not stored in Cloudinary. Select Replace and upload the image again before saving.");
      return;
    }
    if (Number.isNaN(publicationTimestamp)) {
      setError("Enter a valid publication date and time.");
      return;
    }
    if (action === "SCHEDULED" && publicationTimestamp <= Date.now()) {
      setError("Choose a future publication date to schedule this announcement.");
      return;
    }
    if (action === "PUBLISHED" && publicationTimestamp > Date.now()) {
      setError("This publication date is in the future. Choose Schedule instead.");
      return;
    }
    if (expiryDate && (Number.isNaN(expiryTimestamp) || expiryTimestamp! <= publicationTimestamp)) {
      setError("The expiry date must be later than the publication date.");
      return;
    }
    if (action === "PUBLISHED" && !await confirm({ title: "Publish this announcement?", description: `“${title.trim()}” will be visible to visitors now.`, confirmLabel: "Publish now" })) return;
    if (action === "SCHEDULED" && !await confirm({ title: "Schedule this announcement?", description: `“${title.trim()}” will be published on ${formatDate(publicationDate)}.`, confirmLabel: "Schedule" })) return;
    if (action === "DRAFT" && editing?.details.status === "PUBLISHED" && !await confirm({ title: "Unpublish this announcement?", description: `“${title.trim()}” will be removed from the public website and saved as a draft.`, confirmLabel: "Save as draft", tone: "danger" })) return;

    setSaving(true);
    setError("");
    setNotice("");
    const body = {
      title: title.trim(),
      description: description.trim(),
      imageUrl,
      category,
      publicationDate: new Date(publicationDate).toISOString(),
      expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null,
      status: action,
    };
    try {
      if (editing) {
        await authMutation(`/admin/announcements/${editing.id}`, "PATCH", body);
      } else {
        await authMutation("/admin/announcements", "POST", body);
      }
      setModalOpen(false);
      showSuccess({
        id: editing?.id,
        name: title.trim(),
        action: action === "PUBLISHED" ? "published" : "saved",
        message:
          action === "PUBLISHED"
            ? "Announcement is published and live on the church website."
            : action === "SCHEDULED"
              ? `Announcement scheduled for ${formatDate(publicationDate)}.`
              : "Announcement saved as a draft.",
      });
      await loadAnnouncements();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save this announcement.");
    } finally {
      setSaving(false);
    }
  }

  async function changeState(item: Announcement, action: "publish" | "schedule" | "unpublish" | "archive") {
    const confirmations = {
      publish: `Publish “${item.title}” now?`,
      schedule: `Schedule “${item.title}” for ${formatDate(item.details.publicationDate)}?`,
      unpublish: `Unpublish “${item.title}”? It will no longer appear publicly.`,
      archive: `Archive “${item.title}”? It will be removed from active announcement listings.`,
    };
    const destructive = action === "unpublish" || action === "archive";
    if (!await confirm({ title: `${action[0].toUpperCase()}${action.slice(1)} announcement?`, description: confirmations[action], confirmLabel: `${action[0].toUpperCase()}${action.slice(1)}`, tone: destructive ? "danger" : "primary" })) return;
    setError("");
    setNotice("");
    setProcessingId(item.id);
    try {
      await authMutation(`/admin/announcements/${item.id}/${action}`, "POST");
      const actionLabel = {
        publish: "published",
        schedule: "scheduled",
        unpublish: "unpublished",
        archive: "archived",
      }[action];
      showSuccess({
        id: item.id,
        name: item.title,
        action: action === "publish" ? "published" : "updated",
        message: `Announcement ${actionLabel}.`,
      });
      await loadAnnouncements();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `Could not ${action} this announcement.`);
    } finally {
      setProcessingId("");
    }
  }

  function availableActions(item: Announcement) {
    const status = item.details.status;
    const actions: { label: string; action: "publish" | "schedule" | "unpublish" | "archive"; icon: typeof Check }[] = [];
    if (status === "DRAFT" || status === "UNPUBLISHED" || status === "EXPIRED") {
      const isFuture = Date.parse(item.details.publicationDate) > currentTime;
      actions.push(isFuture
        ? { label: "Schedule", action: "schedule", icon: CalendarClock }
        : { label: "Publish", action: "publish", icon: Check });
    } else if (status === "PUBLISHED") {
      actions.push({ label: "Unpublish", action: "unpublish", icon: X });
    } else if (status === "SCHEDULED") {
      actions.push({ label: "Unpublish", action: "unpublish", icon: X });
    }
    if (status !== "ARCHIVED") actions.push({ label: "Archive", action: "archive", icon: Archive });
    return actions;
  }

  return (
    <div>
      <ActionSuccessPopup data={successData} onDismiss={dismissSuccess} />
      <header className="flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Church · Admin</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground">Announcements</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Create, schedule, publish, unpublish, and archive church community announcements.
          </p>
        </div>
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-md transition hover:bg-primary-hover active:scale-[0.98]"
          onClick={() => resetForm()}
          type="button"
        >
          <ImagePlus aria-hidden="true" className="mr-2 size-4" /> Add announcement
        </button>
      </header>

      {error && !modalOpen && (
        <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800" role="status">
          {notice}
        </p>
      )}

      <section aria-label="Announcement management" className="admin-card mt-6 overflow-hidden">
        <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-2 lg:grid-cols-[minmax(14rem,1fr)_14rem_14rem] sm:p-5">
          <div className="relative">
            <span className="sr-only">Search announcement titles</span>
            <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title…"
              type="search"
              value={query}
            />
          </div>
          <div>
            <span className="sr-only">Filter announcements by category</span>
            <select
              className="h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              onChange={(event) => setCategoryFilter(event.target.value)}
              value={categoryFilter}
            >
              <option value="">All categories</option>
              {announcementCategories.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className="sr-only">Filter announcements by status</span>
            <select
              className="h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              onChange={(event) => setStatusFilter(event.target.value as AnnouncementStatus | "")}
              value={statusFilter}
            >
              {announcementStatuses.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="p-8 text-sm text-muted">Loading announcements…</p>
        ) : filteredItems.length ? (
          <div className="divide-y divide-border">
            {filteredItems.map((item) => {
              const isHighlighted = recentlyUpdatedId === item.id || successData?.name === item.title;
              return (
                <article
                  className={`grid gap-4 p-5 transition duration-300 sm:p-6 lg:grid-cols-[5rem_minmax(0,1.1fr)_minmax(8rem,.8fr)_minmax(9rem,.9fr)_minmax(8rem,.8fr)_auto] lg:items-center ${
                    isHighlighted ? "bg-emerald-50/70 ring-2 ring-emerald-500/40 rounded-xl" : "hover:bg-surface-strong/50"
                  }`}
                  key={item.id}
                >
                  <div className="relative aspect-[4/3] w-20 overflow-hidden rounded-xl border border-border bg-surface-strong">
                    {item.details.imageUrl ? (
                      <Image alt="" className="object-cover" fill sizes="80px" src={item.details.imageUrl} unoptimized />
                    ) : (
                      <div className="grid h-full place-items-center text-xs text-muted">No image</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate font-display text-base font-bold text-foreground">{item.title}</h2>
                      <RecordSuccessBadge
                        action={successData?.action === "published" ? "published" : "saved"}
                        isCurrent={isHighlighted}
                      />
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted">/{item.slug}</p>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{item.description}</p>
                  </div>
                  <p className="text-sm font-semibold text-primary">{announcementCategoryLabel(item.details.category)}</p>
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted lg:block">
                    <dt className="font-bold uppercase tracking-wider text-muted">Publishes</dt>
                    <dd className="text-foreground">{formatDate(item.details.publicationDate)}</dd>
                    <dt className="font-bold uppercase tracking-wider text-muted lg:mt-1.5">Expires</dt>
                    <dd className="text-foreground">{formatDate(item.details.expiryDate)}</dd>
                  </dl>
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted lg:block">
                    <dt className="sr-only">Status</dt>
                    <dd>
                      <span className={`admin-badge ${statusStyle(item.details.status)}`}>
                        {item.details.status[0] + item.details.status.slice(1).toLowerCase()}
                      </span>
                    </dd>
                    <dt className="font-bold uppercase tracking-wider text-muted lg:mt-2">Created</dt>
                    <dd className="text-foreground">{formatDate(item.createdAt)}</dd>
                    <dt className="font-bold uppercase tracking-wider text-muted lg:mt-1">Updated</dt>
                    <dd className="text-foreground">{formatDate(item.updatedAt)}</dd>
                  </dl>
                  <div className="flex flex-wrap items-center gap-2">
                    {item.details.status === "PUBLISHED" && (
                      <a
                        className="inline-flex min-h-9 items-center rounded-lg px-2 text-xs font-semibold text-primary hover:underline"
                        href={`/announcements/${item.slug}`}
                        rel="noreferrer"
                        target="_blank"
                      >
                        View
                      </a>
                    )}
                    <button
                      aria-label={`Edit ${item.title}`}
                      className="grid size-9 place-items-center rounded-xl border border-border bg-surface text-muted transition hover:border-primary/40 hover:text-primary"
                      onClick={() => resetForm(item)}
                      type="button"
                    >
                      <Pencil aria-hidden="true" className="size-4" />
                    </button>
                    {availableActions(item).map(({ label, action, icon: Icon }) => (
                      <button
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-foreground transition hover:border-primary/40 hover:text-primary disabled:cursor-wait disabled:opacity-60"
                        disabled={Boolean(processingId)}
                        key={action}
                        onClick={() => void changeState(item, action)}
                        type="button"
                      >
                        <Icon aria-hidden="true" className="size-3.5" />
                        {processingId === item.id ? `${label}…` : label}
                      </button>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <h2 className="font-display text-base font-bold text-foreground">No announcements found.</h2>
            <p className="mt-1 text-sm text-muted">
              {query || categoryFilter || statusFilter
                ? "Try changing your search or filters."
                : "Create an announcement to share church updates."}
            </p>
          </div>
        )}
      </section>

      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving && !uploading) setModalOpen(false);
          }}
        >
          <section
            aria-labelledby="announcement-form-title"
            aria-modal="true"
            className="relative flex flex-col max-h-[92vh] w-full max-w-3xl rounded-3xl border border-slate-200/90 bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            role="dialog"
          >
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 sm:px-8 py-5 backdrop-blur-md">
              <div className="flex items-center gap-3.5 min-w-0 pr-4">
                <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 text-primary border border-primary/20 shadow-xs">
                  <Bell className="size-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 truncate" id="announcement-form-title">
                      {editing ? `Edit Announcement: ${editing.title}` : "Create New Announcement"}
                    </h2>
                    <span className="hidden sm:inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                      {editing ? "Editing" : "New"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs sm:text-sm text-slate-500 truncate">
                    Choose an image, category, and publication timing.
                  </p>
                </div>
              </div>
              <button
                aria-label="Close editor"
                className="grid size-10 place-items-center rounded-2xl border border-slate-200/80 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-all duration-200 hover:rotate-90 shrink-0"
                disabled={saving || uploading}
                onClick={() => setModalOpen(false)}
                type="button"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
            <form className="overflow-y-auto px-6 sm:px-8 py-6 space-y-6 flex-1 text-slate-900" onSubmit={(event) => void submit(event)}>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 sm:col-span-2">
                  Title <span className="text-red-500">*</span>
                  <input
                    className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 text-sm text-slate-900 outline-none transition-all hover:bg-white focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
                    maxLength={180}
                    onChange={(event) => setTitle(event.target.value)}
                    required
                    value={title}
                  />
                </label>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 sm:col-span-2">
                  Description <span className="text-red-500">*</span>
                  <textarea
                    className="mt-2 min-h-36 w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm leading-relaxed text-slate-900 outline-none transition-all hover:bg-white focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
                    maxLength={10000}
                    onChange={(event) => setDescription(event.target.value)}
                    required
                    value={description}
                  />
                </label>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Category <span className="text-red-500">*</span>
                  <select
                    className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 text-sm font-medium text-slate-900 outline-none transition-all hover:bg-white focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
                    onChange={(event) => setCategory(event.target.value as AnnouncementCategory | "")}
                    required
                    value={category}
                  >
                    <option value="">Choose a category</option>
                    {announcementCategories.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Publication date <span className="text-red-500">*</span>
                  <input
                    className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 text-sm text-slate-900 outline-none transition-all hover:bg-white focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
                    onChange={(event) => {
                      setPublicationDate(event.target.value);
                      setCurrentTime(Date.now());
                    }}
                    required
                    type="datetime-local"
                    value={publicationDate}
                  />
                </label>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 sm:col-span-2">
                  Expiry date <span className="font-normal text-slate-400">(optional)</span>
                  <input
                    className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 text-sm text-slate-900 outline-none transition-all hover:bg-white focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
                    onChange={(event) => setExpiryDate(event.target.value)}
                    type="datetime-local"
                    value={expiryDate}
                  />
                  <span className="mt-1.5 block text-xs font-normal text-slate-500">
                    Leave empty if this announcement should not expire automatically.
                  </span>
                </label>
                <div className="sm:col-span-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Announcement Image <span className="text-red-500">*</span>
                  </p>
                  {imageUrl ? (
                    <div className="mt-2 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-[14rem_1fr] sm:items-center">
                      <div className="relative aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-200 shadow-xs">
                        <Image alt={`Preview of ${title || "announcement"}`} className="object-cover" fill sizes="224px" src={previewUrl || imageUrl} unoptimized />
                      </div>
                      <div>
                        <p className="break-all text-xs font-bold text-slate-900">{imageName || "Current announcement image"}</p>
                        {uploading && (
                          <p className="mt-1 text-xs text-primary font-semibold" role="status">
                            Uploading image to Cloudinary…
                          </p>
                        )}
                        {previewUrl && !uploading && !imageUrl && (
                          <p className="mt-1 text-xs text-red-600">Upload failed. Replace the image and try again.</p>
                        )}
                        <div className="mt-3 flex flex-wrap items-start gap-2.5">
                          <ImageUploadDropzone
                            className="min-w-44 flex-1"
                            compact
                            disabled={uploading}
                            label="Replace image or drop a new one here"
                            onFile={(file) => void uploadImage(file)}
                            onSelectAsset={(asset) => { setImageUrl(asset.secureUrl); setImageName(asset.publicId.split("/").at(-1) ?? "Selected image"); setPreviewUrl(""); }}
                            uploading={uploading}
                          />
                          <button
                            className="h-10 rounded-xl border border-red-200 bg-red-50 px-3.5 text-xs font-bold text-red-700 transition hover:bg-red-100"
                            disabled={uploading}
                            onClick={() => {
                              setImageUrl("");
                              setImageName("");
                              setPreviewUrl("");
                            }}
                            type="button"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <ImageUploadDropzone
                      className="mt-2"
                      disabled={uploading}
                      label="Drag and drop an image here or click to browse"
                      onFile={(file) => void uploadImage(file)}
                      onSelectAsset={(asset) => { setImageUrl(asset.secureUrl); setImageName(asset.publicId.split("/").at(-1) ?? "Selected image"); setPreviewUrl(""); }}
                      uploading={uploading}
                    />
                  )}
                  {imageUrl && !isCloudinaryImageUrl(imageUrl) && (
                    <p className="mt-2 rounded-2xl border border-primary/20 bg-primary/5 p-3 text-xs text-primary">
                      This image is not stored in Cloudinary. Replace it with a new upload before saving.
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
                  {error}
                </p>
              )}

              <div className="sticky bottom-0 z-20 -mx-6 sm:-mx-8 -mb-6 border-t border-slate-100 bg-slate-50/90 px-6 sm:px-8 py-4 backdrop-blur-md flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
                <button
                  className="w-full sm:w-auto h-11 px-5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                  disabled={saving || uploading}
                  onClick={() => setModalOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="w-full sm:w-auto h-11 px-5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
                  disabled={saving || uploading || !imageUrl}
                  name="action"
                  type="submit"
                  value={editing?.details.status ?? "DRAFT"}
                >
                  {saving ? "Saving…" : editing ? "Save Changes" : "Save Draft"}
                </button>
                {Date.parse(publicationDate) > currentTime ? (
                  <button
                    className="w-full sm:w-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-hover px-5 text-sm font-bold text-white shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all disabled:opacity-50"
                    disabled={saving || uploading || !imageUrl}
                    name="action"
                    type="submit"
                    value="SCHEDULED"
                  >
                    <CalendarClock aria-hidden="true" className="size-4" />
                    {saving ? "Saving…" : "Schedule"}
                  </button>
                ) : (
                  <button
                    className="w-full sm:w-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-hover px-5 text-sm font-bold text-white shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all disabled:opacity-50"
                    disabled={saving || uploading || !imageUrl}
                    name="action"
                    type="submit"
                    value="PUBLISHED"
                  >
                    <Check aria-hidden="true" className="size-4" />
                    {saving ? "Saving…" : editing ? "Save & Publish" : "Publish Now"}
                  </button>
                )}
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
