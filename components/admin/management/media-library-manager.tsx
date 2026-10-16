"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { ExternalLink, FileAudio2, FileImage, FileText, FileVideo2, Upload } from "lucide-react";
import { authGet, authUpload } from "@/lib/api/church-api";

type MediaAsset = {
  public_id: string;
  secure_url: string;
  bytes: number;
  format?: string;
  resource_type: string;
  created_at?: string;
};

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaLibraryManager() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
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

  async function uploadFile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedFile) return;
    setUploading(true);
    setError("");
    setNotice("");
    try {
      const form = new FormData();
      form.set("file", selectedFile);
      await authUpload<MediaAsset>("/media/upload", form);
      setSelectedFile(null);
      if (inputRef.current) inputRef.current.value = "";
      setNotice("Media uploaded to Cloudinary.");
      await loadAssets();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not upload this file.");
    } finally {
      setUploading(false);
    }
  }

  return <div>
    <header className="border-b border-slate-200 pb-5">
      <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Church · Admin workspace</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900">Media library</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500 font-normal">Upload and reuse images, audio, video, and PDF files stored in Cloudinary.</p>
    </header>

    {error && <p className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{error}</p>}
    {notice && <p className="mt-5 border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">{notice}</p>}

    <section className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-7" aria-labelledby="upload-media-title">
      <h2 className="font-display text-lg font-bold text-slate-900" id="upload-media-title">Upload a file</h2>
      <p className="mt-1 text-sm text-slate-500 font-normal">Accepted: JPEG, PNG, WebP, GIF, MP3, WAV, OGG, MP4, WebM, and PDF. Maximum 15 MB.</p>
      <form className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={uploadFile}>
        <label className="block flex-1 text-sm font-medium text-slate-700">Choose a file
          <input accept="image/jpeg,image/png,image/webp,image/gif,audio/mpeg,audio/wav,audio/ogg,video/mp4,video/webm,application/pdf" className="mt-2 block min-h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm file:mr-3 file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-semibold" onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} ref={inputRef} type="file" />
        </label>
        <button className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-sm hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 transition" disabled={!selectedFile || uploading} type="submit"><Upload aria-hidden="true" className="mr-2 size-4" />{uploading ? "Uploading…" : "Upload to library"}</button>
      </form>
      {selectedFile && <p className="mt-3 text-xs text-slate-500">Selected: {selectedFile.name} · {formatBytes(selectedFile.size)}</p>}
    </section>

    <section className="mt-8" aria-labelledby="recent-media-title">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div><h2 className="font-display text-xl font-bold text-slate-900" id="recent-media-title">Recent files</h2><p className="mt-1 text-sm text-slate-500">Showing the most recent 100 files in the church media folder.</p></div>
        <button className="min-h-10 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-white transition" onClick={() => void loadAssets()} type="button">Refresh</button>
      </div>
      {loading ? <p className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading media…</p> : assets.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {assets.map((asset) => {
          const isImage = asset.resource_type === "image";
          const Icon = asset.resource_type === "video" ? FileVideo2 : asset.resource_type === "raw" ? FileText : FileAudio2;
          return <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:shadow-md" key={`${asset.resource_type}-${asset.public_id}`}>
            {isImage ? <div aria-label={asset.public_id} className="aspect-video bg-slate-100 bg-cover bg-center" role="img" style={{ backgroundImage: `url("${asset.secure_url}")` }} /> : <div className="grid aspect-video place-items-center bg-slate-50 text-primary"><Icon aria-hidden="true" className="size-12" /></div>}
            <div className="p-4"><h3 className="truncate font-display text-sm font-bold text-slate-900" title={asset.public_id}>{asset.public_id.split("/").at(-1)}</h3><p className="mt-1 text-xs uppercase text-slate-500">{asset.format ?? asset.resource_type} · {formatBytes(asset.bytes)}</p><div className="mt-3 flex items-center justify-between gap-3"><time className="text-xs text-slate-500">{asset.created_at ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(asset.created_at)) : ""}</time><a className="inline-flex min-h-9 items-center gap-1.5 text-xs font-semibold text-primary hover:underline" href={asset.secure_url} rel="noreferrer" target="_blank">Open file <ExternalLink aria-hidden="true" className="size-3.5" /></a></div></div>
          </article>;
        })}
      </div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><FileImage aria-hidden="true" className="mx-auto size-9 text-slate-400" /><h3 className="mt-3 font-display text-lg font-bold text-slate-900">No media uploaded</h3><p className="mt-1 text-sm text-slate-500">Uploaded files will appear here.</p></div>}
    </section>
  </div>;
}
