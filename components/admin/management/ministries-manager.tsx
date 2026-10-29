"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Archive, ArrowUpRight, Eye, ImagePlus, LoaderCircle, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { authGet, authMutation, authUpload, type Ministry } from "@/lib/api/church-api";
import { useConfirmation } from "@/components/admin/confirmation-dialog";
import { ImageUploadDropzone } from "@/components/admin/management/image-upload-dropzone";

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
      setModalOpen(false);
      setNotice(editing ? "Ministry changes saved." : "Ministry created.");
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
      setNotice(status === "published" ? "Ministry published." : status === "archived" ? "Ministry archived." : "Ministry unpublished and saved as a draft.");
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
      setNotice("Ministry deleted.");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The ministry could not be deleted.");
    }
  }
  const imageSource = localImagePreview || form.imageUrl;

  return (
    <div className="space-y-6">
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
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300" role="status">
          {notice}
        </p>
      )}

      <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xs" aria-label="Ministry management">
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
            {filteredRecords.map((record) => (
              <article className="flex flex-col gap-4 p-5 transition hover:bg-surface-strong/50 sm:flex-row sm:items-center sm:p-6" key={record.id}>
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
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                        record.status === "published"
                          ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : record.status === "archived"
                            ? "bg-muted/10 text-muted"
                            : "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
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
            ))}
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
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving && !uploading) setModalOpen(false);
          }}
        >
          <section
            aria-labelledby="ministry-editor-title"
            aria-modal="true"
            className="max-h-[96vh] w-full max-w-4xl overflow-y-auto rounded-t-2xl border border-border bg-surface shadow-2xl sm:rounded-2xl"
            role="dialog"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface/95 px-6 py-4 backdrop-blur-sm sm:px-7">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground" id="ministry-editor-title">
                  {editing ? "Edit ministry" : "Create ministry"}
                </h2>
                <p className="mt-0.5 text-xs text-muted">Enter confirmed ministry details for visitors.</p>
              </div>
              <button
                aria-label="Close ministry editor"
                className="inline-flex size-10 items-center justify-center rounded-xl text-muted transition hover:bg-surface-strong hover:text-foreground"
                disabled={saving || uploading}
                onClick={() => setModalOpen(false)}
                type="button"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>
            {error && (
              <p className="mx-5 mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300 sm:mx-7" role="alert">
                {error}
              </p>
            )}
            {previewOpen ? (
              <div className="space-y-6 p-6 sm:p-7">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground">Visitor preview</h3>
                    <p className="mt-0.5 text-xs text-muted">Review the profile before saving or publishing.</p>
                  </div>
                  <button
                    className="min-h-10 rounded-xl border border-border bg-surface px-4 text-xs font-semibold text-foreground transition hover:bg-surface-strong"
                    onClick={() => setPreviewOpen(false)}
                    type="button"
                  >
                    Back to editor
                  </button>
                </div>
                <div className="overflow-hidden rounded-2xl border border-border shadow-md">
                  <div className="relative aspect-[16/7] bg-surface-strong">
                    {imageSource && (
                      <Image alt={`${form.name || "Ministry"} featured image preview`} className="object-cover" fill sizes="(max-width: 768px) 100vw, 768px" src={imageSource} unoptimized />
                    )}
                  </div>
                  <div className="space-y-4 p-6 sm:p-8">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary">Ministry</p>
                    <h3 className="font-display text-3xl font-bold text-foreground">{form.name || "Ministry name"}</h3>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-muted">
                      {form.description || "The ministry description will appear here."}
                    </p>
                    <dl className="grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-2">
                      {[
                        ["Who it serves", form.targetAudience],
                        ["Meeting schedule", form.meetingSchedule],
                        ["Location", form.location],
                        ["Leader", form.leader],
                      ]
                        .filter(([, value]) => value)
                        .map(([label, value]) => (
                          <div key={label}>
                            <dt className="text-xs font-bold uppercase tracking-wider text-muted">{label}</dt>
                            <dd className="mt-0.5 font-medium text-foreground">{value}</dd>
                          </div>
                        ))}
                    </dl>
                    <a
                      className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground shadow-md transition hover:bg-primary-hover"
                      href={form.ctaUrl || "/contact"}
                    >
                      {form.ctaLabel || "Contact the church"}
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <form className="space-y-6 p-6 sm:p-7" onSubmit={save}>
                <section>
                  <h3 className="font-display text-base font-bold text-foreground">Ministry profile</h3>
                  <p className="mt-0.5 text-xs text-muted">Required information shown on ministry pages.</p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                      Ministry name <span className="text-red-500">*</span>
                      <input
                        autoFocus
                        className="mt-1.5 h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        maxLength={160}
                        onChange={(event) => {
                          const name = event.target.value;
                          setForm((current) => ({ ...current, name, ...(!slugTouched ? { slug: slugFromName(name) } : {}) }));
                        }}
                        required
                        value={form.name}
                      />
                    </label>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                      URL slug <span className="text-red-500">*</span>
                      <div className="mt-1.5 flex h-11 items-center rounded-xl border border-border bg-surface px-3.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition">
                        <span className="text-xs text-muted">/ministries/</span>
                        <input
                          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none"
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
                      <span className="mt-1 block text-[11px] font-normal text-muted">Generated from the name. You can edit it.</span>
                    </label>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted md:col-span-2">
                      Description <span className="text-red-500">*</span>
                      <textarea
                        className="mt-1.5 min-h-32 w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-sm leading-relaxed text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        maxLength={10000}
                        onChange={(event) => update("description", event.target.value)}
                        required
                        value={form.description}
                      />
                    </label>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                      Target audience <span className="text-red-500">*</span>
                      <input
                        className="mt-1.5 h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        maxLength={180}
                        onChange={(event) => update("targetAudience", event.target.value)}
                        placeholder="Who this ministry serves"
                        required
                        value={form.targetAudience}
                      />
                    </label>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                      Meeting schedule <span className="text-red-500">*</span>
                      <input
                        className="mt-1.5 h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        maxLength={300}
                        onChange={(event) => update("meetingSchedule", event.target.value)}
                        placeholder="Days, times, or frequency"
                        required
                        value={form.meetingSchedule}
                      />
                    </label>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                      Location <span className="text-red-500">*</span>
                      <input
                        className="mt-1.5 h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        maxLength={250}
                        onChange={(event) => update("location", event.target.value)}
                        placeholder="Approved meeting location"
                        required
                        value={form.location}
                      />
                    </label>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                      Ministry leader
                      <input
                        className="mt-1.5 h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        maxLength={140}
                        onChange={(event) => update("leader", event.target.value)}
                        value={form.leader ?? ""}
                      />
                    </label>
                  </div>
                </section>

                <section>
                  <h3 className="font-display text-base font-bold text-foreground">Featured image</h3>
                  <p className="mt-0.5 text-xs text-muted">Image files are uploaded to the backend media service and stored there.</p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                    <ImageUploadDropzone
                      className="min-h-44"
                      disabled={uploading}
                      label="Choose an image or drag it here"
                      onFile={(file) => void uploadImage(file)}
                      onSelectAsset={(asset) => { update("imageUrl", asset.secureUrl); setLocalImagePreview(""); }}
                      uploading={uploading}
                    />
                    <div className="relative min-h-44 overflow-hidden rounded-xl border border-border bg-surface-strong">
                      {imageSource ? (
                        <>
                          <Image alt="Selected ministry image preview" className="object-cover" fill sizes="(max-width: 640px) 100vw, 400px" src={imageSource} unoptimized />
                          <button
                            aria-label="Remove featured image"
                            className="absolute right-2 top-2 inline-flex size-9 items-center justify-center rounded-full bg-surface/90 text-foreground shadow-md backdrop-blur-xs transition hover:bg-surface"
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
                        <div className="flex h-full min-h-44 items-center justify-center text-xs text-muted">Image preview appears here</div>
                      )}
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="font-display text-base font-bold text-foreground">Contact and call to action</h3>
                  <p className="mt-0.5 text-xs text-muted">Add only contact details approved for public display.</p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                      Contact email
                      <input
                        className="mt-1.5 h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        maxLength={254}
                        onChange={(event) => update("contactEmail", event.target.value)}
                        type="email"
                        value={form.contactEmail ?? ""}
                      />
                    </label>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                      Contact phone
                      <input
                        className="mt-1.5 h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        maxLength={40}
                        onChange={(event) => update("contactPhone", event.target.value)}
                        type="tel"
                        value={form.contactPhone ?? ""}
                      />
                    </label>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                      Button label
                      <input
                        className="mt-1.5 h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        maxLength={80}
                        onChange={(event) => update("ctaLabel", event.target.value)}
                        placeholder="Join this ministry"
                        value={form.ctaLabel ?? ""}
                      />
                    </label>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                      Button destination
                      <input
                        className="mt-1.5 h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        maxLength={500}
                        onChange={(event) => update("ctaUrl", event.target.value)}
                        placeholder="https://… or /contact"
                        type="url"
                        value={form.ctaUrl ?? ""}
                      />
                    </label>
                  </div>
                </section>

                <section>
                  <h3 className="font-display text-base font-bold text-foreground">Search appearance</h3>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                      SEO title
                      <input
                        className="mt-1.5 h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        maxLength={180}
                        onChange={(event) => update("seoTitle", event.target.value)}
                        value={form.seoTitle ?? ""}
                      />
                    </label>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                      SEO description
                      <textarea
                        className="mt-1.5 min-h-11 w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        maxLength={300}
                        onChange={(event) => update("seoDescription", event.target.value)}
                        value={form.seoDescription ?? ""}
                      />
                    </label>
                  </div>
                </section>

                <label className="block max-w-sm text-xs font-bold uppercase tracking-wider text-muted">
                  Publication status
                  <select
                    className="mt-1.5 h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    onChange={(event) => update("status", event.target.value as MinistryStatus)}
                    value={form.status}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                  <span className="mt-1 block text-[11px] font-normal text-muted">Only published ministries are visible to visitors.</span>
                </label>

                <div className="sticky bottom-0 -mx-6 flex flex-col-reverse gap-3 border-t border-border bg-surface/95 px-6 py-4 backdrop-blur sm:-mx-7 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                  <button
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-xs font-semibold text-foreground transition hover:bg-surface-strong"
                    onClick={() => setPreviewOpen(true)}
                    type="button"
                  >
                    <Eye aria-hidden="true" className="size-4" /> Preview
                  </button>
                  <div className="flex flex-col-reverse gap-3 sm:flex-row">
                    <button
                      className="min-h-11 rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-foreground transition hover:bg-surface-strong"
                      disabled={saving || uploading}
                      onClick={() => setModalOpen(false)}
                      type="button"
                    >
                      Cancel
                    </button>
                    <button
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground shadow-md transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={saving || uploading}
                      type="submit"
                    >
                      {saving && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
                      {saving ? "Saving…" : editing ? "Save changes" : "Create ministry"}
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
