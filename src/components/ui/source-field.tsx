"use client";

import { useEffect, useRef } from "react";

// Liest die Herkunft (utm_source oder src) aus der URL und legt sie in ein
// verstecktes Feld. So lässt sich auswerten, welcher Kanal (QR-Code, Flyer,
// Jobbörse) eine Bewerbung gebracht hat. Ohne JavaScript bleibt es leer.
export function SourceField({ name = "src" }: { name?: string }) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const src = params.get("utm_source") || params.get("src") || "";
    if (ref.current && src) {
      ref.current.value = src.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 40);
    }
  }, []);

  return <input ref={ref} type="hidden" name={name} defaultValue="" />;
}
