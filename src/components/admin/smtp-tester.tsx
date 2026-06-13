"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, CheckCircle2, Send } from "lucide-react";
import { Field, Input } from "@/components/ui/field";
import { testSmtpAction, type SmtpTestResult } from "@/server/actions/smtp";

export function SmtpTester({
  configured,
  defaultRecipient
}: {
  configured: boolean;
  defaultRecipient: string;
}) {
  const [recipient, setRecipient] = useState(defaultRecipient);
  const [result, setResult] = useState<SmtpTestResult | null>(null);
  const [pending, startTransition] = useTransition();

  const run = () =>
    startTransition(async () => {
      setResult(null);
      const outcome = await testSmtpAction(recipient);
      setResult(outcome);
    });

  return (
    <div className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
      <h2 className="font-display text-base font-bold text-night-900">
        Testmail senden
      </h2>
      <p className="mt-1 text-sm text-mist-500">
        Prüft Verbindung und Login und sendet anschließend eine Testnachricht.
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        <Field
          label="Empfänger"
          htmlFor="smtp-recipient"
          className="flex-1"
        >
          <Input
            id="smtp-recipient"
            type="email"
            value={recipient}
            onChange={(event) => setRecipient(event.target.value)}
            placeholder="name@firma.de"
            disabled={!configured || pending}
          />
        </Field>
        <button
          type="button"
          onClick={run}
          disabled={!configured || pending || recipient.trim() === ""}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-600 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {pending ? "Wird gesendet ..." : "Test starten"}
        </button>
      </div>

      {result ? (
        <div
          className={
            result.ok
              ? "mt-4 flex items-start gap-3 rounded-xl bg-mint-400/10 px-4 py-3 text-sm text-night-900"
              : "mt-4 flex items-start gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
          }
          role="status"
        >
          {result.ok ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-mint-500" />
          ) : (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <span>{result.message}</span>
        </div>
      ) : null}
    </div>
  );
}
