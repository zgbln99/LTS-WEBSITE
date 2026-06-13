"use client";

import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { resendNotificationAction } from "@/server/actions/notifications";

export function ResendButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState<string | null>(null);

  const resend = () =>
    startTransition(async () => {
      const result = await resendNotificationAction(id);
      setNote(
        result.ok
          ? "Erneut gesendet."
          : "Versand erneut fehlgeschlagen."
      );
      setTimeout(() => setNote(null), 4000);
    });

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={resend}
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-lg border border-mist-300 px-3 py-1.5 text-xs font-semibold text-night-900 transition-colors hover:bg-mist-100 disabled:opacity-50"
      >
        <RefreshCw className={pending ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
        {pending ? "Sendet ..." : "Erneut senden"}
      </button>
      {note ? <span className="text-xs text-mist-500">{note}</span> : null}
    </span>
  );
}
