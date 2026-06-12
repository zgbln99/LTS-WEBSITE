"use client";

import { useState } from "react";

// Firmenlogo mit Fallback: Wenn public/logo.png fehlt oder nicht lädt,
// wird ein Text-Logo im Markenrot angezeigt statt eines kaputten Bildes.
export function Logo() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="flex items-center gap-2">
        <span className="flex h-8 items-center rounded-lg bg-accent-500 px-2.5 font-display text-sm font-extrabold text-white">
          LTS
        </span>
        <span className="font-display text-base font-bold text-night-900">
          Logistik
        </span>
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="LTS Logistik GmbH"
      className="h-7 w-auto"
      onError={() => setFailed(true)}
    />
  );
}
