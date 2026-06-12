"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Library, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Vordefinierte Stock-Motive als schnelle Auswahl
const STOCK_IMAGES = [
  "https://images.unsplash.com/photo-1591768793355-74d04bb6608f?q=80&w=2400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1616432043562-3671ea2e5242?q=80&w=2400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=2400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?q=80&w=2400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?q=80&w=2400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=2400&auto=format&fit=crop"
];

// Bildfeld für den Page-Builder: Upload, Mediathek, Stock und URL.
export function ImageField({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [library, setLibrary] = useState<string[] | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);

  useEffect(() => {
    if (!showLibrary || library !== null) return;
    fetch("/api/admin/upload")
      .then((response) => response.json())
      .then((payload) => setLibrary(payload.images ?? []))
      .catch(() => setLibrary([]));
  }, [showLibrary, library]);

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
            ? "Datei zu groß (max. 8 MB)."
            : "Upload fehlgeschlagen."
        );
        return;
      }
      const payload = await response.json();
      onChange(payload.url);
      setLibrary(null);
    } catch {
      setError("Upload fehlgeschlagen.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Vorschau */}
      {value ? (
        <div className="relative overflow-hidden rounded-lg border border-mist-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-28 w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 rounded-full bg-night-950/80 px-2.5 py-1 text-xs font-medium text-white hover:bg-night-950"
          >
            Entfernen
          </button>
        </div>
      ) : (
        <div className="flex h-20 items-center justify-center rounded-lg border-2 border-dashed border-mist-300 text-xs text-mist-400">
          Kein Bild
        </div>
      )}

      {/* Aktionen */}
      <div className="flex gap-1.5">
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-night-950 px-3 py-2 text-xs font-semibold text-white hover:bg-night-800 disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ImagePlus className="h-3.5 w-3.5" />
          )}
          Hochladen
        </button>
        <button
          type="button"
          onClick={() => setShowLibrary((open) => !open)}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold",
            showLibrary
              ? "border-night-950 bg-night-950 text-white"
              : "border-mist-300 text-night-900 hover:border-night-900"
          )}
        >
          <Library className="h-3.5 w-3.5" />
          Mediathek
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) upload(file);
          event.target.value = "";
        }}
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      {/* Mediathek + Stockbilder */}
      {showLibrary ? (
        <div className="space-y-2 rounded-lg border border-mist-200 p-2">
          {library === null ? (
            <p className="py-2 text-center text-xs text-mist-400">Lädt...</p>
          ) : (
            <>
              {library.length > 0 ? (
                <>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-mist-400">
                    Hochgeladene Bilder
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {library.map((url) => (
                      <button
                        key={url}
                        type="button"
                        onClick={() => onChange(url)}
                        className={cn(
                          "overflow-hidden rounded-md border-2",
                          value === url
                            ? "border-accent-500"
                            : "border-transparent hover:border-mist-300"
                        )}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt=""
                          className="h-14 w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </>
              ) : null}
              <p className="text-[10px] font-semibold uppercase tracking-wider text-mist-400">
                Stock-Motive
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {STOCK_IMAGES.map((url) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => onChange(url)}
                    className={cn(
                      "overflow-hidden rounded-md border-2",
                      value === url
                        ? "border-accent-500"
                        : "border-transparent hover:border-mist-300"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-14 w-full object-cover" />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      ) : null}

      {/* Direkte URL */}
      <input
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder="oder Bild-URL einfügen"
        className="w-full rounded-lg border border-mist-300 px-3 py-2 text-xs outline-none focus:border-accent-500"
      />
    </div>
  );
}
