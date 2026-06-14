"use client";

import { useMemo, useState, useTransition } from "react";
import { Field, Input, Textarea } from "@/components/ui/field";
import { saveEmailTemplate } from "@/server/actions/settings";

const SAMPLE: Record<string, string> = {
  name: "Max Mustermann",
  reference: "BEW-25ABCDE"
};

function interpolate(value: string) {
  return value.replace(/\{(\w+)\}/g, (_, key) => SAMPLE[key] ?? `{${key}}`);
}

export function EmailTemplateForm({
  templateKey,
  locale,
  initialSubject,
  initialBody,
  defaultSubject,
  defaultBody
}: {
  templateKey: string;
  locale: string;
  initialSubject: string;
  initialBody: string;
  defaultSubject: string;
  defaultBody: string;
}) {
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [note, setNote] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const previewSubject = useMemo(
    () => interpolate(subject || defaultSubject),
    [subject, defaultSubject]
  );
  const previewBody = useMemo(
    () => interpolate(body || defaultBody),
    [body, defaultBody]
  );

  const save = () =>
    startTransition(async () => {
      const result = await saveEmailTemplate(templateKey, locale, {
        subject,
        body
      });
      setNote(result.ok ? "Gespeichert." : "Fehler beim Speichern.");
      setTimeout(() => setNote(null), 4000);
    });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
        <p className="mb-4 text-sm text-mist-500">
          Platzhalter: <code className="rounded bg-mist-100 px-1">{"{name}"}</code>{" "}
          und <code className="rounded bg-mist-100 px-1">{"{reference}"}</code>.
          Leer lassen = Standardtext.
        </p>
        <div className="space-y-4">
          <Field label="Betreff" htmlFor="tpl-subject">
            <Input
              id="tpl-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={defaultSubject}
            />
          </Field>
          <Field label="Nachricht" htmlFor="tpl-body">
            <Textarea
              id="tpl-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={defaultBody}
              className="min-h-64 font-mono text-xs"
            />
          </Field>
        </div>
        <div className="mt-5 flex items-center gap-4">
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="inline-flex h-11 items-center rounded-xl bg-accent-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-600 disabled:opacity-50"
          >
            {pending ? "Speichert ..." : "Speichern"}
          </button>
          {note ? (
            <span className="text-sm font-medium text-mint-500">{note}</span>
          ) : null}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-mist-400">
          Vorschau
        </p>
        <div className="overflow-hidden rounded-2xl border border-mist-200 bg-mist-50">
          <div className="border-b border-mist-200 bg-white px-5 py-3 text-sm">
            <span className="text-mist-400">Betreff: </span>
            <span className="font-semibold text-night-900">{previewSubject}</span>
          </div>
          <div className="bg-[#f7f8fa] p-5">
            <div className="mx-auto max-w-md overflow-hidden rounded-2xl">
              <div className="bg-night-950 px-6 py-4">
                <span className="text-base font-bold text-white">
                  LTS Logistik
                </span>
              </div>
              <div className="whitespace-pre-wrap bg-white px-6 py-6 text-sm leading-relaxed text-night-800">
                {previewBody}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
