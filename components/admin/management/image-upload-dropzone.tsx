"use client";

import { useRef, useState, type DragEvent } from "react";
import { ImagePlus } from "lucide-react";
import type { MediaAsset } from "@/lib/api/church-api";
import { MediaLibraryPicker } from "@/components/admin/management/media-library-picker";

type ImageUploadDropzoneProps = {
  onFile: (file: File) => void;
  onSelectAsset?: (asset: MediaAsset) => void;
  label: string;
  helperText?: string;
  disabled?: boolean;
  uploading?: boolean;
  compact?: boolean;
  className?: string;
};

const acceptedImageTypes = "image/jpeg,image/png,image/webp,image/gif";

export function ImageUploadDropzone({
  onFile,
  onSelectAsset,
  label,
  helperText = "JPEG, PNG, WebP, or GIF · up to 15 MB",
  disabled = false,
  uploading = false,
  compact = false,
  className = "",
}: ImageUploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    const file = event.dataTransfer.files[0];
    if (file) onFile(file);
  }

  return (
    <div className={className}>
      <input
        accept={acceptedImageTypes}
        className="sr-only"
        disabled={disabled}
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file) onFile(file);
          event.currentTarget.value = "";
        }}
        ref={inputRef}
        tabIndex={-1}
        type="file"
      />
      <button
        aria-label={label}
        className={`flex w-full items-center justify-center rounded-xl border-2 border-dashed text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60 ${
          compact ? "min-h-11 gap-2 px-3 py-2 text-xs" : "min-h-36 flex-col px-4 py-6 text-sm"
        } ${
          dragging
            ? "border-primary bg-primary/10 text-primary"
            : "border-border bg-surface text-muted hover:border-primary/50 hover:bg-primary/5"
        }`}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragging(false);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        type="button"
      >
        <ImagePlus aria-hidden="true" className={compact ? "size-4 shrink-0" : "size-7"} />
        <span className="font-semibold">
          {uploading ? "Uploading image…" : dragging ? "Drop image to upload" : label}
        </span>
        {!compact && <span className="text-xs">{helperText}</span>}
      </button>
      {compact && <p className="mt-1 text-[11px] text-muted">{helperText}</p>}
      {onSelectAsset && <MediaLibraryPicker onSelect={onSelectAsset} />}
    </div>
  );
}
