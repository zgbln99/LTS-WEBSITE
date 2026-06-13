"use client";

import { useEffect, useRef } from "react";

// Setzt beim Laden des Formulars einen Zeitstempel. Der Server prüft beim
// Absenden, ob das Formular verdächtig schnell ausgefüllt wurde (Bot-Schutz
// ohne externe Dienste wie reCAPTCHA). Ohne JavaScript bleibt das Feld leer
// und es wird nicht blockiert.
export function TimeTrapField({ name = "renderedAt" }: { name?: string }) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.value = String(Date.now());
  }, []);

  return (
    <input
      ref={ref}
      type="hidden"
      name={name}
      defaultValue=""
      aria-hidden
      tabIndex={-1}
    />
  );
}
