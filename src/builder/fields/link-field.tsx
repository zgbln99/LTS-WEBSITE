"use client";

import { useDynamicData } from "@/builder/dynamic-data";

// Linkfeld: Auswahl der Website-Seiten oder freie Eingabe (URL, tel:, #anker).
export function LinkField({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { links = [] } = useDynamicData();
  const isKnown = links.some((entry) => entry.href === value);

  return (
    <div className="space-y-1.5">
      <select
        value={isKnown ? value : ""}
        onChange={(event) => {
          if (event.target.value) onChange(event.target.value);
        }}
        className="w-full rounded-lg border border-mist-300 bg-white px-3 py-2 text-xs outline-none focus:border-accent-500"
      >
        <option value="">Seite wählen...</option>
        {links.map((entry) => (
          <option key={entry.href} value={entry.href}>
            {entry.label}
          </option>
        ))}
      </select>
      <input
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder="oder URL / tel:+49... / #anker"
        className="w-full rounded-lg border border-mist-300 px-3 py-2 text-xs outline-none focus:border-accent-500"
      />
    </div>
  );
}
