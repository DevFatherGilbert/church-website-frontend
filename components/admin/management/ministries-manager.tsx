"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Archive, ArrowUpRight, Check, Eye, HeartHandshake, ImagePlus, LoaderCircle, Pencil, Plus, Search, Sparkles, Trash2, X } from "lucide-react";
import { authGet, authMutation, authUpload, type Ministry } from "@/lib/api/church-api";
import { useConfirmation } from "@/components/admin/confirmation-dialog";
import { ImageUploadDropzone } from "@/components/admin/management/image-upload-dropzone";
import {
  ActionSuccessPopup,
  RecordSuccessBadge,
  useActionSuccess,
} from "./action-success-popup";

type MinistryStatus = "draft" | "published" | "archived";
type MinistryForm = {
  name: string;
  slug: string;
  description: string;
  targetAudience: string;
  meetingSchedule: string;
  location: string;
  leader: string;
  imageUrl: string;
  contactEmail: string;
  contactPhone: string;
  ctaLabel: string;
  ctaUrl: string;
  seoTitle: string;
  seoDescription: string;
  status: MinistryStatus;
};

const emptyForm: MinistryForm = {
  name: "", slug: "", description: "", targetAudience: "", meetingSchedule: "", location: "",
  leader: "", imageUrl: "", contactEmail: "", contactPhone: "", ctaLabel: "", ctaUrl: "",
  seoTitle: "", seoDescription: "", status: "draft",
};

function toForm(record: Ministry): MinistryForm {
  return {
    name: record.name ?? "", slug: record.slug ?? "", description: record.description ?? "",
    targetAudience: record.targetAudience ?? "", meetingSchedule: record.meetingSchedule ?? "",
    location: record.location ?? "", leader: record.leader ?? "", imageUrl: record.imageUrl ?? "",
    contactEmail: record.contactEmail ?? "", contactPhone: record.contactPhone ?? "",
    ctaLabel: record.ctaLabel ?? "", ctaUrl: record.ctaUrl ?? "", seoTitle: record.seoTitle ?? "",
    seoDescription: record.seoDescription ?? "", status: record.status ?? "draft",
  };
}

function slugFromName(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function dateLabel(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}

function statusLabel(status?: string) {
  return status === "published" ? "Published" : status === "archived" ? "Archived" : "Draft";
}

export function MinistriesManager() {
  const confirm = useConfirmation();
  const [records, setRecords] = useState<Ministry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editing, setEditing] = useState<Ministry | null>(null);
  const [form, setForm] = useState<MinistryForm>(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [localImagePreview, setLocalImagePreview] = useState("");
  const { successData, showSuccess, dismissSuccess, recentlyUpdatedId } = useActionSuccess();

  const load = useCallback(async () => {
    const result = await authGet<{ items: Ministry[]; total: number }>("/admin/ministries");
    setRecords(result.items ?? []);
  }, []);

  useEffect(() => {
    let active = true;
    authGet<{ items: Ministry[]; total: number }>("/admin/ministries").then(
      (result) => { if (active) setRecords(result.items ?? []); },
      (cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : "Ministries could not be loaded."); },
    ).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filteredRecords = useMemo(() => {
    const term = query.trim().toLowerCase();
    return records.filter((record) =>
      (statusFilter === "all" || record.status === statusFilter)
      && (!term || `${record.name} ${record.slug} ${record.description}`.toLowerCase().includes(term)),
    );
  }, [query, records, statusFilter]);

  function update<K extends keyof MinistryForm>(key: K, value: MinistryForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setSlugTouched(false);
    setLocalImagePreview("");
    setError("");
    setNotice("");
    setPreviewOpen(false);
    setModalOpen(true);
  }

  function openEdit(record: Ministry) {
    setEditing(record);
    setForm(toForm(record));
    setSlugTouched(true);
    setLocalImagePreview("");
    setError("");
    setNotice("");
    setPreviewOpen(false);
    setModalOpen(true);
  }

  async function uploadImage(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setError("Choose a JPEG, PNG, WebP, or GIF image.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError("The image must be 15 MB or smaller.");
      return;
    }
    setError("");
    setUploading(true);
    const preview = URL.createObjectURL(file);
    setLocalImagePreview(preview);
    try {
      const body = new FormData();
      body.set("file", file);
      const uploaded = await authUpload<{ url: string }>("/media/upload?purpose=ministries", body);
      if (!uploaded?.url) throw new Error("The backend did not return an image URL.");
      update("imageUrl", uploaded.url);
      setLocalImagePreview("");
      URL.revokeObjectURL(preview);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The image could not be uploaded.");
      URL.revokeObjectURL(preview);
      setLocalImagePreview("");
    } finally {
      setUploading(false);
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (uploading) return;
    if (!form.imageUrl) {
      setError("Upload a featured image before saving the ministry.");
      return;
    }
    if (form.status === "published" && !await confirm({ title: editing?.status === "published" ? "Save live ministry changes?" : "Publish this ministry?", description: `“${form.name.trim() || "This ministry"}” will be visible to visitors.`, confirmLabel: editing?.status === "published" ? "Save live changes" : "Publish ministry" })) return;
    if (form.status === "archived" && (!editing || editing.status !== "archived") && !await confirm({ title: "Archive this ministry?", description: `“${form.name.trim() || "This ministry"}” will be removed from active ministry listings.`, confirmLabel: "Archive ministry", tone: "danger" })) return;
    if (form.status === "draft" && editing?.status === "published" && !await confirm({ title: "Unpublish this ministry?", description: `“${form.name.trim() || "This ministry"}” will be removed from the public website and saved as a draft.`, confirmLabel: "Save as draft", tone: "danger" })) return;
    setSaving(true);
    setError("");
    const body = Object.fromEntries(Object.entries(form).map(([key, value]) => [
      key,
      typeof value === "string" && value.trim() === "" && !["name", "slug", "description", "targetAudience", "meetingSchedule", "location", "imageUrl", "status"].includes(key)
        ? null
        : typeof value === "string" ? value.trim() : value,
    ]));
    try {
      await authMutation(editing ? `/admin/ministries/${editing.id}` : "/admin/ministries", editing ? "PATCH" : "POST", body);
      const ministryName = form.name.trim() || "Ministry";
      setModalOpen(false);
      showSuccess({
        id: editing?.id,
        name: ministryName,
        action: form.status === "published" ? "published" : "saved",
        message:
          form.status === "published"
            ? `“${ministryName}” is now published and visible to website visitors.`
            : `“${ministryName}” details saved successfully.`,
      });
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The ministry could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(record: Ministry, status: MinistryStatus) {
    if ((status !== "draft" || record.status === "published") && !await confirm({ title: status === "published" ? "Publish this ministry?" : status === "archived" ? "Archive this ministry?" : "Unpublish this ministry?", description: status === "published" ? `“${record.name}” will be visible to visitors.` : status === "archived" ? `“${record.name}” will be removed from active ministry listings.` : `“${record.name}” will be removed from the public website and saved as a draft.`, confirmLabel: status === "published" ? "Publish ministry" : status === "archived" ? "Archive ministry" : "Unpublish", tone: status === "published" ? "primary" : "danger" })) return;
    setError("");
    setNotice("");
    try {
      await authMutation(`/admin/ministries/${record.id}`, "PATCH", { status });
      showSuccess({
        id: record.id,
        name: record.name,
        action: status === "published" ? "published" : "updated",
        message: status === "published" ? `“${record.name}” was published.` : `Status changed to ${status}.`,
      });
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Publication status could not be changed.");
    }
  }

  async function remove(record: Ministry) {
    if (!await confirm({ title: "Delete this ministry?", description: `“${record.name}” will be permanently deleted. This action cannot be undone.`, confirmLabel: "Delete ministry", tone: "danger" })) return;
    setError("");
    setNotice("");
    try {
      await authMutation(`/admin/ministries/${record.id}`, "DELETE");
      showSuccess({
        id: record.id,
        name: record.name,
        action: "deleted",
        message: `“${record.name}” was deleted.`,
      });
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The ministry could not be deleted.");
    }
  }
  const imageSource = localImagePreview || form.imageUrl;

  return (
    <div className="space-y-6">
      <ActionSuccessPopup data={successData} onDismiss={dismissSuccess} />
      <header className="flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Church · Admin</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground">Ministries</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">Create and publish ministry profiles for the public website.</p>
        </div>
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-md transition hover:bg-primary-hover active:scale-[0.98]"
          onClick={openNew}
          type="button"
        >
          <Plus aria-hidden="true" className="mr-2 size-4" /> Add ministry
        </button>
      </header>

      {error && !modalOpen && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800" role="status">
          {notice}
        </p>
      )}

      <section className="admin-card overflow-hidden" aria-label="Ministry management">
        <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <h2 className="font-display text-base font-bold text-foreground">All ministries</h2>
            <p className="mt-0.5 text-xs text-muted">
              {records.length} {records.length === 1 ? "ministry" : "ministries"}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative w-full sm:w-64">
              <span className="sr-only">Search ministries</span>
              <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input
                className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search ministries…"
                type="search"
                value={query}
              />
            </div>
            <label className="sr-only" htmlFor="ministry-status-filter">
              Filter by status
            </label>
            <select
              className="h-11 rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              id="ministry-status-filter"
              onChange={(event) => setStatusFilter(event.target.value)}
              value={statusFilter}
            >
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 p-8 text-sm text-muted">
            <LoaderCircle className="size-4 animate-spin text-primary" aria-hidden="true" /> Loading ministries…
          </div>
        ) : filteredRecords.length ? (
          <div className="divide-y divide-border">
            {filteredRecords.map((record) => {
              const isHighlighted = recentlyUpdatedId === record.id || successData?.name === record.name;
              return (
                <article
                  className={`flex flex-col gap-4 p-5 transition duration-300 sm:flex-row sm:items-center sm:p-6 ${
                    isHighlighted ? "bg-emerald-50/70 ring-2 ring-emerald-500/40 rounded-2xl" : "hover:bg-surface-strong/50"
                  }`}
                  key={record.id}
                >
                  <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl border border-border bg-surface-strong sm:w-36">
                    {record.imageUrl ? (
                      <Image alt={`${record.name} featured image`} className="object-cover" fill sizes="(max-width: 640px) 100vw, 144px" src={record.imageUrl} unoptimized />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted">
                        <ImagePlus aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-base font-bold text-foreground">{record.name}</h3>
                      <RecordSuccessBadge
                        action={successData?.action === "published" ? "published" : "saved"}
                        isCurrent={isHighlighted}
                      />
                      <span
                        className={`admin-badge ${
                          record.status === "published"
                            ? "admin-badge-published"
                            : record.status === "archived"
                              ? "admin-badge-archived"
                              : "admin-badge-draft"
                        }`}
                      >
                        {statusLabel(record.status)}
                      </span>
                    </div>
                  <p className="mt-1 text-xs text-muted">
                    /{record.slug} · Created {dateLabel(record.createdAt)} · Updated {dateLabel(record.updatedAt)}
                  </p>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{record.description}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  {record.status === "published" ? (
                    <button
                      className="min-h-10 rounded-xl border border-border bg-surface px-3.5 text-xs font-semibold text-foreground transition hover:bg-surface-strong"
                      onClick={() => void changeStatus(record, "draft")}
                      type="button"
                    >
                      Unpublish
                    </button>
                  ) : record.status === "archived" ? (
                    <button
                      className="min-h-10 rounded-xl border border-border bg-surface px-3.5 text-xs font-semibold text-foreground transition hover:bg-surface-strong"
                      onClick={() => void changeStatus(record, "draft")}
                      type="button"
                    >
                      Restore draft
                    </button>
                  ) : (
                    <button
                      className="min-h-10 rounded-xl bg-emerald-700 px-3.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-800"
                      onClick={() => void changeStatus(record, "published")}
                      type="button"
                    >
                      Publish
                    </button>
                  )}
                  {record.status !== "archived" && (
                    <button
                      aria-label={`Archive ${record.name}`}
                      className="inline-flex size-10 items-center justify-center rounded-xl border border-border bg-surface text-muted transition hover:border-primary/40 hover:text-primary"
                      onClick={() => void changeStatus(record, "archived")}
                      title="Archive"
                      type="button"
                    >
                      <Archive aria-hidden="true" className="size-4" />
                    </button>
                  )}
                  {record.status === "published" && (
                    <Link
                      aria-label={`View ${record.name}`}
                      className="inline-flex size-10 items-center justify-center rounded-xl border border-border bg-surface text-muted transition hover:border-primary/40 hover:text-primary"
                      href={`/ministries/${record.slug}`}
                      target="_blank"
                    >
                      <ArrowUpRight aria-hidden="true" className="size-4" />
                    </Link>
                  )}
                  <button
                    aria-label={`Edit ${record.name}`}
                    className="inline-flex size-10 items-center justify-center rounded-xl border border-border bg-surface text-muted transition hover:border-primary/40 hover:text-primary"
                    onClick={() => openEdit(record)}
                    type="button"
                  >
                    <Pencil aria-hidden="true" className="size-4" />
                  </button>
                  <button
                    aria-label={`Delete ${record.name}`}
                    className="inline-flex size-10 items-center justify-center rounded-xl border border-border bg-surface text-muted transition hover:border-red-300 hover:text-red-700"
                    onClick={() => void remove(record)}
                    type="button"
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                  </button>
                </div>
              </article>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-strong text-muted">
              <Search aria-hidden="true" className="size-5" />
            </div>
            <h3 className="mt-4 font-display text-base font-bold text-foreground">
              {records.length ? "No ministries match these filters" : "No ministries yet"}
            </h3>
            <p className="mt-1 text-sm text-muted">
              {records.length ? "Try a different search or status." : "Add an approved ministry profile to begin."}
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
            aria-labelledby="ministry-editor-title"
            aria-modal="true"
            className="relative flex flex-col max-h-[92vh] w-full max-w-4xl rounded-3xl border border-slate-200/90 bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            role="dialog"
          >
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 sm:px-8 py-5 backdrop-blur-md">
              <div className="flex items-center gap-3.5 min-w-0 pr-4">
                <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 text-primary border border-primary/20 shadow-xs">
                  <HeartHandshake className="size-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 truncate" id="ministry-editor-title">
                      {editing ? `Edit: ${editing.name}` : "Create New Ministry"}
                    </h2>
                    <span className="hidden sm:inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                      {editing ? "Editing" : "New"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs sm:text-sm text-slate-500 truncate">
                    Enter confirmed ministry details for website visitors.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!previewOpen && (
                  <button
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                    onClick={() => setPreviewOpen(true)}
                    type="button"
                  >
                    <Eye aria-hidden="true" className="size-3.5" /> Preview
                  </button>
                )}
                <button
                  aria-label="Close ministry editor"
                  className="grid size-10 place-items-center rounded-2xl border border-slate-200/80 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-all duration-200 hover:rotate-90"
                  disabled={saving || uploading}
                  onClick={() => setModalOpen(false)}
                  type="button"
                >
                  <X aria-hidden="true" className="size-4" />
                </button>
              </div>
            </div>
            {error && (
              <p className="mx-6 sm:mx-8 mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
                {error}
              </p>
            )}
            {previewOpen ? (
              <div className="overflow-y-auto px-6 sm:px-8 py-6 space-y-6 flex-1 text-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900">Visitor Preview Mode</h3>
                    <p className="mt-0.5 text-xs text-slate-500">Review how this profile will appear to visitors before publishing.</p>
                  </div>
                  <button
                    className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    onClick={() => setPreviewOpen(false)}
                    type="button"
                  >
                    Back to Editor
                  </button>
                </div>
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md">
                  <div className="relative aspect-[16/7] bg-slate-100">
                    {imageSource && (
                      <Image alt={`${form.name || "Ministry"} featured image preview`} className="object-cover" fill sizes="(max-width: 768px) 100vw, 768px" src={imageSource} unoptimized />
                    )}
                  </div>
                  <div className="space-y-4 p-6 sm:p-8">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary">Ministry</p>
                    <h3 className="font-display text-3xl font-bold text-slate-900">{form.name || "Ministry Name"}</h3>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
                      {form.description || "The ministry description will appear here."}
                    </p>
                    <dl className="grid gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-2">
                      {[
                        ["Who it serves", form.targetAudience],
                        ["Meeting schedule", form.meetingSchedule],
                        ["Location", form.location],
                        ["Leader", form.leader],
                      ]
                        .filter(([, value]) => value)
                        .map(([label, value]) => (
                          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3" key={label}>
                            <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</dt>
                            <dd className="mt-0.5 font-medium text-slate-900">{value}</dd>
                          </div>
                        ))}
                    </dl>
                    <a
                      className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-md transition hover:bg-primary-hover"
                      href={form.ctaUrl || "/contact"}
                    >
                      {form.ctaLabel || "Contact the Church"}
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <form className="overflow-y-auto px-6 sm:px-8 py-6 space-y-6 flex-1 text-slate-900" onSubmit={save}>
                <section className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <HeartHandshake className="size-4 text-primary" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">1. Ministry Profile</h3>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Ministry name <span className="text-red-500">*</span>
                      <input
                        autoFocus
                        className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 text-sm text-slate-900 outline-none transition-all hover:bg-white focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
                        maxLength={160}
                        onChange={(event) => {
                          const name = event.target.value;
                          setForm((current) => ({ ...current, name, ...(!slugTouched ? { slug: slugFromName(name) } : {}) }));
                        }}
                        required
                        value={form.name}
                      />
                    </label>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      URL slug <span className="text-red-500">*</span>
                      <div className="mt-2 flex h-12 items-center rounded-2xl border border-slate-200 bg-slate-50/60 px-4 focus-within:border-primary focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                        <span className="text-xs text-slate-400">/ministries/</span>
                        <input
                          className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none pl-1"
                          maxLength={180}
                          onChange={(event) => {
                            setSlugTouched(true);
                            update("slug", slugFromName(event.target.value));
                          }}
                          pattern="[a-z0-9]+(-[a-z0-9]+)*"
                          required
                          value={form.slug}
                        />
                      </div>
                      <span className="mt-1 block text-[11px] font-normal text-slate-500">Auto-generated from name.</span>
                    </label>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 md:col-span-2">
                      Description <span className="text-red-500">*</span>
                      <textarea
                        className="mt-2 min-h-32 w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm leading-relaxed text-slate-900 outline-none transition-all hover:bg-white focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
                        maxLength={10000}
                        onChange={(event) => update("description", event.target.value)}
                        required
                        value={form.description}
                      />
                    </label>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Target audience <span className="text-red-500">*</span>
                      <input
                        className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 text-sm text-slate-900 outline-none transition-all hover:bg-white focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
                        maxLength={180}
                        onChange={(event) => update("targetAudience", event.target.value)}
                        placeholder="Who this ministry serves"
                        required
                        value={form.targetAudience}
                      />
                    </label>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Meeting schedule <span className="text-red-500">*</span>
                      <input
                        className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 text-sm text-slate-900 outline-none transition-all hover:bg-white focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
                        maxLength={300}
                        onChange={(event) => update("meetingSchedule", event.target.value)}
                        placeholder="Days, times, or frequency"
                        required
                        value={form.meetingSchedule}
                      />
                    </label>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Location <span className="text-red-500">*</span>
                      <input
                        className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 text-sm text-slate-900 outline-none transition-all hover:bg-white focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
                        maxLength={250}
                        onChange={(event) => update("location", event.target.value)}
                        placeholder="Approved meeting location"
                        required
                        value={form.location}
                      />
                    </label>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Ministry leader
                      <input
                        className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 text-sm text-slate-900 outline-none transition-all hover:bg-white focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
                        maxLength={140}
                        onChange={(event) => update("leader", event.target.value)}
                        placeholder="Leader name"
                        value={form.leader ?? ""}
                      />
                    </label>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <ImagePlus className="size-4 text-primary" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">2. Featured Image</h3>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 items-start">
                    <ImageUploadDropzone
                      className="min-h-44"
                      disabled={uploading}
                      label="Choose an image or drag it here"
                      onFile={(file) => void uploadImage(file)}
                      onSelectAsset={(asset) => { update("imageUrl", asset.secureUrl); setLocalImagePreview(""); }}
                      uploading={uploading}
                    />
                    <div className="relative min-h-44 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-xs">
                      {imageSource ? (
                        <>
                          <Image alt="Selected ministry image preview" className="object-cover" fill sizes="(max-width: 640px) 100vw, 400px" src={imageSource} unoptimized />
                          <button
                            aria-label="Remove featured image"
                            className="absolute right-2 top-2 inline-flex size-9 items-center justify-center rounded-xl bg-white/95 text-slate-700 shadow-md backdrop-blur-xs transition hover:bg-red-50 hover:text-red-700"
                            onClick={() => {
                              update("imageUrl", "");
                              setLocalImagePreview("");
                            }}
                            type="button"
                          >
                            <X aria-hidden="true" className="size-4" />
                          </button>
                        </>
                      ) : (
                        <div className="flex h-full min-h-44 items-center justify-center text-xs text-slate-400">Image preview appears here</div>
                      )}
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Sparkles className="size-4 text-primary" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">3. Contact & Call to Action</h3>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Contact email
                      <input
                        className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 text-sm text-slate-900 outline-none transition-all hover:bg-white focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
                        maxLength={254}
                        onChange={(event) => update("contactEmail", event.target.value)}
                        type="email"
                        value={form.contactEmail ?? ""}
                      />
                    </label>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Contact phone
                      <input
                        className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 text-sm text-slate-900 outline-none transition-all hover:bg-white focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
                        maxLength={40}
                        onChange={(event) => update("contactPhone", event.target.value)}
                        type="tel"
                        value={form.contactPhone ?? ""}
                      />
                    </label>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Button label
                      <input
                        className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 text-sm text-slate-900 outline-none transition-all hover:bg-white focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
                        maxLength={80}
                        onChange={(event) => update("ctaLabel", event.target.value)}
                        placeholder="Join this ministry"
                        value={form.ctaLabel ?? ""}
                      />
                    </label>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Button destination
                      <input
                        className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 text-sm text-slate-900 outline-none transition-all hover:bg-white focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
                        maxLength={500}
                        onChange={(event) => update("ctaUrl", event.target.value)}
                        placeholder="https://… or /contact"
                        type="url"
                        value={form.ctaUrl ?? ""}
                      />
                    </label>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Search className="size-4 text-primary" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">4. Search Appearance & Status</h3>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      SEO title
                      <input
                        className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 text-sm text-slate-900 outline-none transition-all hover:bg-white focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
                        maxLength={180}
                        onChange={(event) => update("seoTitle", event.target.value)}
                        value={form.seoTitle ?? ""}
                      />
                    </label>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      SEO description
                      <textarea
                        className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm leading-relaxed text-slate-900 outline-none transition-all hover:bg-white focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
                        maxLength={300}
                        onChange={(event) => update("seoDescription", event.target.value)}
                        value={form.seoDescription ?? ""}
                      />
                    </label>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 md:col-span-2">
                      Publication status <span className="text-red-500">*</span>
                      <select
                        className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 text-sm font-medium text-slate-900 outline-none transition-all hover:bg-white focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
                        onChange={(event) => update("status", event.target.value as MinistryStatus)}
                        value={form.status}
                      >
                        <option value="draft">Save as Draft (Private)</option>
                        <option value="published">Publish (Live on Website)</option>
                        <option value="archived">Archived</option>
                      </select>
                    </label>
                  </div>
                </section>

                <div className="sticky bottom-0 z-20 -mx-6 sm:-mx-8 -mb-6 flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/90 px-6 sm:px-8 py-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
                  <button
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                    onClick={() => setPreviewOpen(true)}
                    type="button"
                  >
                    <Eye aria-hidden="true" className="size-4" /> Live Preview
                  </button>
                  <div className="flex flex-col-reverse gap-3 sm:flex-row">
                    <button
                      className="w-full sm:w-auto h-11 px-5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                      disabled={saving || uploading}
                      onClick={() => setModalOpen(false)}
                      type="button"
                    >
                      Cancel
                    </button>
                    <button
                      className="w-full sm:w-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-hover px-6 text-sm font-bold text-white shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all disabled:opacity-60"
                      disabled={saving || uploading}
                      type="submit"
                    >
                      {saving && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
                      {saving ? "Saving…" : editing ? "Save Changes" : "Create Ministry"}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
