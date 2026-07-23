"use client";

import { useState } from "react";
import { Forward } from "lucide-react";
import { forwardApplication } from "@/server/actions/admin";

// Bewerbung an eine E-Mail-Adresse weiterleiten (mit Download-Links).
export function ForwardApplication({
  id,
  defaultEmail = ""
}: {
  id: string;
  defaultEmail?: string;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-mist-300 px-4 py-2 text-sm font-medium text-night-900 hover:border-accent-400 hover:text-accent-600"
      >
        <Forward className="h-4 w-4" />
        Weiterleiten
      </button>
    );
  }

  return (
    <form
      action={forwardApplication}
      className="flex flex-wrap items-center gap-2"
    >
      <input type="hidden" name="id" value={id} />
      <input
        name="email"
        type="email"
        required
        defaultValue={defaultEmail}
        placeholder="E-Mail-Adresse"
        className="rounded-lg border border-mist-300 px-3 py-2 text-sm outline-none focus:border-accent-500"
      />
      <button
        type="submit"
        className="rounded-full bg-accent-500 px-4 py-2 text-sm font-medium text-white hover:bg-accent-600"
      >
        Senden
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-sm text-mist-500 hover:text-night-900"
      >
        Abbrechen
      </button>
    </form>
  );
}
