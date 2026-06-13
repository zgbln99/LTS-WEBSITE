"use client";

import { useState } from "react";

// Firmenlogo mit Fallback: Wenn public/logo.png fehlt oder nicht lädt,
// wird ein Text-Logo im Markenrot angezeigt statt eines kaputten Bildes.
// Der Name stammt aus den Einstellungen (Website-Name).
export function Logo({ name = "LTS Logistik" }: { name?: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    const [first, ...rest] = name.split(" ");
    const remainder = rest.join(" ");
    return (
      <span className="flex items-center gap-2">
        <span className="flex h-8 items-center rounded-lg bg-accent-500 px-2.5 font-display text-sm font-extrabold text-white">
          {first}
        </span>
        {remainder ? (
          <span className="font-display text-base font-bold text-white">
            {remainder}
          </span>
        ) : null}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt={name}
      width={140}
      height={36}
      decoding="async"
      className="h-9 w-auto"
      onError={() => setFailed(true)}
    />
  );
}
