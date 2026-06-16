"use client";

import { Trash2 } from "lucide-react";
import { deleteApplication } from "@/server/actions/admin";

export function DeleteApplicationButton({ id }: { id: string }) {
  return (
    <form
      action={deleteApplication}
      onSubmit={(event) => {
        if (
          !window.confirm(
            "Diesen Kandidaten endgültig löschen? Dateien und Verlauf werden " +
              "unwiderruflich entfernt."
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="inline-flex items-center gap-1.5 rounded-full border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:border-red-500 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
        Löschen
      </button>
    </form>
  );
}
