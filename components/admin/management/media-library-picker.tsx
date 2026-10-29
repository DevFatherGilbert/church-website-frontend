"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ImagePlus, Search, X } from "lucide-react";
import { authGet, type MediaAsset } from "@/lib/api/church-api";

export function MediaLibraryPicker({
  onSelect,
  label = "Choose from media library",
}: {
  onSelect: (asset: MediaAsset) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!open) return;
    void authGet<MediaAsset[]>("/media")
      .then((result) => setAssets(result.filter((asset) => asset.resourceType === "image")))
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Could not load images."))
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    dialog.showModal();
    return () => { if (dialog.open) dialog.close(); };
  }, [open]);

  const matchingAssets = assets.filter((asset) =>
    `${asset.publicId} ${asset.format ?? ""} ${asset.altText}`.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return <>
    <button
      className="mt-2 inline-flex min-h-10 items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3.5 text-xs font-semibold text-primary transition hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      onClick={() => { setLoading(true); setError(""); setOpen(true); }}
      type="button"
    >
      <ImagePlus aria-hidden="true" className="size-4" />{label}
    </button>
    {open && <dialog
      aria-labelledby="media-picker-title"
      className="m-auto max-h-[min(90dvh,60rem)] w-[min(96vw,64rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/60"
      onClose={() => setOpen(false)}
      onClick={(event) => { if (event.target === event.currentTarget) dialogRef.current?.close(); }}
      ref={dialogRef}
    >
      <div className="flex max-h-[min(90dvh,60rem)] flex-col">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div><h2 className="font-display text-lg font-bold" id="media-picker-title">Choose an image</h2><p className="mt-1 text-xs text-slate-500">Select an image already stored in Cloudinary.</p></div>
          <button aria-label="Close media picker" className="grid size-10 shrink-0 place-items-center rounded-lg border border-slate-200 hover:bg-slate-50" onClick={() => dialogRef.current?.close()} type="button"><X aria-hidden="true" className="size-4" /></button>
        </header>
        <div className="border-b border-slate-100 p-4 sm:px-6">
          <label className="relative block"><span className="sr-only">Search images</span><Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input autoFocus className="min-h-11 w-full rounded-xl border border-slate-300 pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, format, or alternative text" value={search} /></label>
        </div>
        <div className="min-h-48 flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? <p className="py-12 text-center text-sm text-slate-500" role="status">Loading your image library…</p>
            : error ? <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">{error}</p>
              : matchingAssets.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {matchingAssets.map((asset) => <button
                  className="group overflow-hidden rounded-xl border border-slate-200 text-left transition hover:border-primary hover:ring-2 hover:ring-primary/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  key={asset.id}
                  onClick={() => { onSelect(asset); dialogRef.current?.close(); }}
                  type="button"
                >
                  <span className="relative block aspect-[4/3] bg-slate-100"><img alt={asset.altText || asset.publicId.split("/").at(-1) || "Uploaded image"} className="size-full object-cover" loading="lazy" src={asset.secureUrl} /><span className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-white/95 text-primary opacity-0 shadow transition group-hover:opacity-100 group-focus-visible:opacity-100"><Check aria-hidden="true" className="size-4" /></span></span>
                  <span className="block truncate px-3 pt-2 text-xs font-semibold" title={asset.publicId}>{asset.publicId.split("/").at(-1)}</span>
                  <span className="block truncate px-3 pb-3 pt-1 text-[11px] text-slate-500">{asset.width && asset.height ? `${asset.width} × ${asset.height} · ` : ""}{asset.format?.toUpperCase() || "IMAGE"}</span>
                </button>)}
              </div>
                : <div className="rounded-xl border border-dashed border-slate-300 px-5 py-12 text-center"><ImagePlus aria-hidden="true" className="mx-auto size-8 text-slate-400" /><p className="mt-3 text-sm font-semibold text-slate-700">{assets.length ? "No images match your search" : "No images are available yet"}</p><p className="mt-1 text-xs text-slate-500">Upload an image to the media library, then choose it here.</p></div>}
        </div>
      </div>
    </dialog>}
  </>;
}
