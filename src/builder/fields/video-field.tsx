"use client";

import { useRef, useState } from "react";
import { Clapperboard, Loader2 } from "lucide-react";

// Videofeld für den Page-Builder: MP4/WebM hochladen oder URL einfügen.
export function VideoField({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body
      });
      if (!response.ok) {
        setError(
          response.status === 413
            ? "Datei zu groß (max. 64 MB)."
            : "Upload fehlgeschlagen (nur MP4/WebM)."
        );
        return;
      }
      const payload = await response.json();
      onChange(payload.url);
    } catch {
      setError("Upload fehlgeschlagen.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="overflow-hidden rounded-lg border border-mist-200">
          <video
            src={value}
            muted
            loop
            autoPlay
            playsInline
            className="h-28 w-full object-cover"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="w-full bg-night-950 py-1.5 text-xs font-medium text-white hover:bg-night-800"
          >
            Video entfernen
          </button>
        </div>
      ) : null}

      <button
        type="button"
        disabled={uploading}
        onClick={() => fileRef.current?.click()}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-night-950 px-3 py-2 text-xs font-semibold text-white hover:bg-night-800 disabled:opacity-50"
      >
        {uploading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Clapperboard className="h-3.5 w-3.5" />
        )}
        Video hochladen (MP4, max. 64 MB)
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="video/mp4,video/webm"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) upload(file);
          event.target.value = "";
        }}
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <input
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder="oder Video-URL einfügen"
        className="w-full rounded-lg border border-mist-300 px-3 py-2 text-xs outline-none focus:border-accent-500"
      />
      <p className="text-[10px] leading-relaxed text-mist-400">
        Kostenlose LKW-Videos: pexels.com/videos, mixkit.co, coverr.co
        (herunterladen und hier hochladen). Das Bildfeld dient als Vorschau,
        bis das Video geladen ist.
      </p>
    </div>
  );
}
