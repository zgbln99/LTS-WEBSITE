"use client";

import { ShieldOff } from "lucide-react";
import { anonymizeApplication } from "@/server/actions/admin";

export function AnonymizeButton({ id }: { id: string }) {
  return (
    <form
      action={anonymizeApplication}
      onSubmit={(event) => {
        if (
          !window.confirm(
            "Personenbezogene Daten dieser Bewerbung unwiderruflich anonymisieren?"
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="inline-flex items-center gap-1.5 rounded-full border border-mist-300 px-4 py-2 text-sm font-medium text-night-900 hover:border-red-400 hover:text-red-600"
      >
        <ShieldOff className="h-4 w-4" />
        Anonymisieren
      </button>
    </form>
  );
}
