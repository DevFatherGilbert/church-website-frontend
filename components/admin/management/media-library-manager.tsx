"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent, type FormEvent } from "react";
import { ExternalLink, FileAudio2, FileImage, FileText, FileVideo2, Search, Trash2, Upload, X } from "lucide-react";
import { authGet, authMutation, authUploadWithProgress, type MediaAsset } from "@/lib/api/church-api";
import { useConfirmation } from "@/components/admin/confirmation-dialog";

type Filter = "all" | "image" | "video" | "raw";

function formatBytes(bytes: string | number) {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value < 0) return "Unknown size";
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function fileLabel(asset: MediaAsset) {
  return asset.publicId.split("/").at(-1) || asset.publicId;
}

function isAudioAsset(asset: MediaAsset) {
  return asset.resourceType === "video" && ["mp3", "wav", "ogg", "aac", "m4a"].includes((asset.format ?? "").toLowerCase());
}

export function MediaLibraryManager() {
  const confirm = useConfirmation();
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDialogElement>(null);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<MediaAsset | null>(null);
  const [altDrafts, setAltDrafts] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [savingAlt, setSavingAlt] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadAssets = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setAssets(await authGet<MediaAsset[]>("/media"));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load the media library.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => { void loadAssets(); }, 0);
    return () => clearTimeout(timeoutId);
  }, [loadAssets]);

  useEffect(() => {
    const dialog = previewRef.current;
    if (!preview || !dialog) return;
    dialog.showModal();
    return () => { if (dialog.open) dialog.close(); };
  }, [preview]);

  const visibleAssets = useMemo(() => assets.filter((asset) => {
    const matchesFilter = filter === "all" || asset.resourceType === filter;
    const matchesSearch = `${asset.publicId} ${asset.format ?? ""} ${asset.altText} ${asset.folder}`.toLowerCase().includes(search.trim().toLowerCase());
    return matchesFilter && matchesSearch;
  }), [assets, filter, search]);

  function selectFile(file?: File) {
    if (!file) return;
    const acceptedTypes = [
      "image/jpeg", "image/png", "image/webp", "image/gif",
      "audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/aac", "audio/m4a", "audio/x-m4a",
      "video/mp4", "video/webm", "application/pdf",
    ];
    if (!acceptedTypes.includes(file.type)) {
      setError("Choose a supported image, audio, video, or PDF file.");
      setSelectedFile(null);
      return;
    }
    const maxSize = file.type.startsWith("image/") ? 15 : 50;
    if (file.size > maxSize * 1024 * 1024) {
      setError(`This file must be ${maxSize} MB or smaller.`);
      setSelectedFile(null);
      return;
    }
    setError("");
    setNotice("");
    setSelectedFile(file);
  }

  function dropFile(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    if (!uploading) selectFile(event.dataTransfer.files[0]);
  }

  async function uploadFile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedFile) return;
    setUploading(true);
    setUploadProgress(0);
    setError("");
    setNotice("");
    try {
      const form = new FormData();
      form.set("file", selectedFile);
      const purpose = selectedFile.type.startsWith("image/") ? "image" : "general";
      await authUploadWithProgress(`/media/upload?purpose=${purpose}`, form, setUploadProgress);
      setUploadProgress(100);
      setSelectedFile(null);
      setNotice("Media uploaded to Cloudinary and added to your library.");
      await loadAssets();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not upload this file.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function saveAltText(asset: MediaAsset) {
    const altText = altDrafts[asset.id] ?? asset.altText;
    setSavingAlt(asset.id);
    setError("");
    setNotice("");
    try {
      const updated = await authMutation<MediaAsset>(`/media/${asset.id}/alt-text`, "PATCH", { altText });
      setAssets((current) => current.map((item) => item.id === asset.id ? updated : item));
      setAltDrafts((current) => { const next = { ...current }; delete next[asset.id]; return next; });
      setNotice("Alternative text saved.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save alternative text.");
    } finally {
      setSavingAlt(null);
    }
  }

  async function deleteAsset(asset: MediaAsset) {
    const approved = await confirm({
      title: "Delete this media file?",
      description: `“${fileLabel(asset)}” will be removed from Cloudinary. Files referenced by church content are protected and cannot be deleted.`,
      confirmLabel: "Delete media",
      tone: "danger",
    });
    if (!approved) return;
    setDeleting(asset.id);
    setError("");
    setNotice("");
    try {
      await authMutation(`/media/${asset.id}`, "DELETE");
      setAssets((current) => current.filter((item) => item.id !== asset.id));
      setNotice("Media deleted from Cloudinary.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete this media file.");
    } finally {
      setDeleting(null);
    }
  }

  return <div className="mx-auto max-w-6xl">
    <header className="border-b border-border pb-5">
      <p className="text-xs font-bold uppercase tracking-wider text-primary">Church · Admin workspace</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground">Media library</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">Upload, preview, search, and reuse Cloudinary images, audio, video, and PDF files. Media used on the website is protected from deletion.</p>
    </header>

    {error && <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{error}</p>}
    {notice && <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">{notice}</p>}

    <section className="mt-6 rounded-2xl border border-border bg-surface p-5 shadow-xs sm:p-7" aria-labelledby="upload-media-title">
      <h2 className="font-display text-lg font-bold text-foreground" id="upload-media-title">Upload a file</h2>
      <p className="mt-1 text-sm text-muted">Images: JPEG, PNG, WebP, or GIF up to 15 MB. Audio, video, and PDF files up to 50 MB.</p>
      <form className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={(event) => void uploadFile(event)}>
        <label
          className={`block flex-1 rounded-xl border-2 border-dashed p-4 text-sm transition ${dragging ? "border-primary bg-primary/10" : "border-border bg-surface-strong/40"}`}
          onDragEnter={(event) => { event.preventDefault(); if (!uploading) setDragging(true); }}
          onDragLeave={(event) => { event.preventDefault(); setDragging(false); }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={dropFile}
        >
          <span className="font-semibold text-foreground">{dragging ? "Drop a file to select it" : "Choose a file or drag it here"}</span>
          <input accept="image/jpeg,image/png,image/webp,image/gif,audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/aac,audio/m4a,audio/x-m4a,video/mp4,video/webm,application/pdf" className="mt-2 block min-h-11 w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-sm file:mr-3 file:border-0 file:bg-surface-strong file:px-3 file:py-1.5 file:text-sm file:font-semibold" disabled={uploading} onChange={(event) => { selectFile(event.target.files?.[0]); event.currentTarget.value = ""; }} ref={inputRef} type="file" />
        </label>
        <button className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground shadow-xs transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50" disabled={!selectedFile || uploading} type="submit"><Upload aria-hidden="true" className="mr-2 size-4" />{uploading ? `Uploading ${uploadProgress}%` : "Upload to library"}</button>
      </form>
      {uploading && <div aria-label={`Upload progress ${uploadProgress}%`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={uploadProgress} className="mt-4 h-2 overflow-hidden rounded-full bg-surface-strong" role="progressbar"><div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${uploadProgress}%` }} /></div>}
      {selectedFile && <p className="mt-3 text-xs text-muted">Selected: {selectedFile.name} · {formatBytes(selectedFile.size)}</p>}
    </section>

    <section className="mt-8" aria-labelledby="recent-media-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h2 className="font-display text-xl font-bold text-foreground" id="recent-media-title">Recent files</h2><p className="mt-1 text-sm text-muted">Showing up to 100 recent files in the church media folders.</p></div>
        <button className="min-h-10 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-foreground transition hover:bg-surface-strong" onClick={() => void loadAssets()} type="button">Refresh</button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
        <label className="relative block"><span className="sr-only">Search media</span><Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" /><input className="min-h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" onChange={(event) => setSearch(event.target.value)} placeholder="Search name, folder, format, or alt text" value={search} /></label>
        <label className="sr-only" htmlFor="media-type-filter">Filter by file type</label><select className="min-h-11 rounded-xl border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" id="media-type-filter" onChange={(event) => setFilter(event.target.value as Filter)} value={filter}><option value="all">All file types</option><option value="image">Images</option><option value="video">Audio &amp; video</option><option value="raw">PDF files</option></select>
      </div>

      {loading ? <p className="mt-5 rounded-2xl border border-border bg-surface p-8 text-sm text-muted" role="status">Loading media…</p>
        : visibleAssets.length ? <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleAssets.map((asset) => {
            const isImage = asset.resourceType === "image";
            const Icon = asset.resourceType === "video" ? FileVideo2 : asset.resourceType === "raw" ? FileText : FileAudio2;
            const dirtyAlt = (altDrafts[asset.id] ?? asset.altText) !== asset.altText;
            return <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-surface shadow-xs" key={asset.id}>
              <button aria-label={`Preview ${fileLabel(asset)}`} className="relative block aspect-video w-full bg-surface-strong text-primary" onClick={() => setPreview(asset)} type="button">
                {isImage ? <img alt={asset.altText || fileLabel(asset)} className="size-full object-cover" loading="lazy" src={asset.secureUrl} /> : <span className="grid size-full place-items-center"><Icon aria-hidden="true" className="size-12" /></span>}
                <span className="absolute bottom-2 right-2 rounded-full bg-slate-950/75 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">Preview</span>
              </button>
              <div className="min-w-0 p-4">
                <h3 className="truncate font-display text-sm font-bold text-foreground" title={asset.publicId}>{fileLabel(asset)}</h3>
                <p className="mt-1 truncate text-xs text-muted" title={asset.folder}>{asset.format?.toUpperCase() || asset.resourceType} · {formatBytes(asset.bytes)}{asset.width && asset.height ? ` · ${asset.width} × ${asset.height}` : ""}</p>
                <p className="mt-1 text-[11px] text-muted">{asset.createdAt ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(asset.createdAt)) : ""}</p>
                {isImage && <div className="mt-3"><label className="block text-xs font-semibold text-muted">Alternative text<input className="mt-1 min-h-10 w-full rounded-xl border border-border bg-surface px-3 text-xs font-normal text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" maxLength={500} onChange={(event) => setAltDrafts((current) => ({ ...current, [asset.id]: event.target.value }))} placeholder="Describe the image" value={altDrafts[asset.id] ?? asset.altText} /></label><button className="mt-2 min-h-9 rounded-lg border border-primary/30 px-3 text-xs font-semibold text-primary transition hover:bg-primary/5 disabled:opacity-50" disabled={!dirtyAlt || savingAlt === asset.id} onClick={() => void saveAltText(asset)} type="button">{savingAlt === asset.id ? "Saving…" : "Save alt text"}</button></div>}
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
                  <a className="inline-flex min-h-9 min-w-0 items-center gap-1.5 truncate text-xs font-semibold text-primary hover:underline" href={asset.secureUrl} rel="noreferrer" target="_blank">Open file <ExternalLink aria-hidden="true" className="size-3.5 shrink-0" /></a>
                  <button aria-label={`Delete ${fileLabel(asset)}`} className="grid size-9 shrink-0 place-items-center rounded-lg border border-red-200 text-red-700 transition hover:bg-red-50 disabled:opacity-50" disabled={deleting === asset.id} onClick={() => void deleteAsset(asset)} type="button"><Trash2 aria-hidden="true" className="size-4" /></button>
                </div>
              </div>
            </article>;
          })}
        </div>
          : <div className="mt-5 rounded-2xl border border-dashed border-border bg-surface p-10 text-center sm:p-12"><FileImage aria-hidden="true" className="mx-auto size-9 text-muted" /><h3 className="mt-3 font-display text-lg font-bold text-foreground">{assets.length ? "No files match your search" : "No media uploaded"}</h3><p className="mt-1 text-sm text-muted">{assets.length ? "Try another name or file type." : "Uploaded files will appear here."}</p></div>}
    </section>

    {preview && <dialog aria-labelledby="media-preview-title" className="m-auto max-h-[92dvh] w-[min(94vw,60rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/70" onClose={() => setPreview(null)} ref={previewRef}>
      <div className="flex max-h-[92dvh] flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-3 sm:px-5"><div className="min-w-0"><h2 className="truncate font-semibold" id="media-preview-title">{fileLabel(preview)}</h2><p className="text-xs text-slate-500">{preview.format?.toUpperCase() || preview.resourceType} · {formatBytes(preview.bytes)}</p></div><button aria-label="Close preview" className="grid size-10 shrink-0 place-items-center rounded-lg border border-slate-200 hover:bg-slate-50" onClick={() => previewRef.current?.close()} type="button"><X aria-hidden="true" className="size-4" /></button></header>
        <div className="grid min-h-48 flex-1 place-items-center overflow-auto bg-slate-950 p-2 sm:p-5">
          {preview.resourceType === "image" ? <img alt={preview.altText || fileLabel(preview)} className="max-h-[70dvh] max-w-full object-contain" src={preview.secureUrl} />
            : preview.resourceType === "video" && isAudioAsset(preview) ? <audio className="w-full max-w-xl" controls src={preview.secureUrl}>Your browser does not support audio playback.</audio>
              : preview.resourceType === "video" ? <video className="max-h-[70dvh] max-w-full" controls playsInline src={preview.secureUrl}>Your browser does not support video playback.</video>
                : <div className="text-center text-white"><FileText aria-hidden="true" className="mx-auto size-12" /><p className="mt-3 text-sm">Preview this document in a new tab.</p><a className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-slate-900" href={preview.secureUrl} rel="noreferrer" target="_blank">Open PDF <ExternalLink aria-hidden="true" className="size-4" /></a></div>}
        </div>
      </div>
    </dialog>}
  </div>;
}
