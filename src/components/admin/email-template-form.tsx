"use client";

import { useMemo, useState, useTransition } from "react";
import { Code2 } from "lucide-react";
import { Field, Input, Textarea } from "@/components/ui/field";
import { RichTextField } from "@/builder/rich-text-field";
import { saveEmailTemplate } from "@/server/actions/settings";
import { brandedEmail, textToHtml } from "@/lib/email-frame";

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
  initialBodyHtml,
  initialHtml,
  defaultSubject,
  defaultBody
}: {
  templateKey: string;
  locale: string;
  initialSubject: string;
  initialBodyHtml: string;
  initialHtml: string;
  defaultSubject: string;
  defaultBody: string;
}) {
  const defaultBodyHtml = useMemo(() => textToHtml(defaultBody), [defaultBody]);
  const [subject, setSubject] = useState(initialSubject);
  const [bodyHtml, setBodyHtml] = useState(initialBodyHtml || defaultBodyHtml);
  const [html, setHtml] = useState(initialHtml);
  const [advanced, setAdvanced] = useState(Boolean(initialHtml));
  const [note, setNote] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const previewSubject = interpolate(subject || defaultSubject);
  const previewHtml = useMemo(() => {
    const source = html.trim()
      ? html
      : brandedEmail(bodyHtml || defaultBodyHtml);
    return interpolate(source);
  }, [html, bodyHtml, defaultBodyHtml]);

  const save = () =>
    startTransition(async () => {
      const result = await saveEmailTemplate(templateKey, locale, {
        subject,
        bodyHtml,
        html: advanced ? html : ""
      });
      setNote(result.ok ? "Gespeichert." : "Fehler beim Speichern.");
      setTimeout(() => setNote(null), 4000);
    });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
        <Field label="Betreff" htmlFor="tpl-subject">
          <Input
            id="tpl-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={defaultSubject}
          />
        </Field>

        <p className="mt-4 text-xs text-mist-500">
          Platzhalter: <code className="rounded bg-mist-100 px-1">{"{name}"}</code>{" "}
          und <code className="rounded bg-mist-100 px-1">{"{reference}"}</code>.
        </p>

        {advanced ? (
          <div className="mt-3">
            <Textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              placeholder="Vollständiges E-Mail-HTML"
              spellCheck={false}
              className="min-h-72 bg-night-950 font-mono text-xs text-mint-300"
              aria-label="Komplettes HTML"
            />
            <button
              type="button"
              onClick={() => {
                setHtml("");
                setAdvanced(false);
              }}
              className="mt-2 text-xs font-medium text-accent-600 hover:underline"
            >
              Zurück zum visuellen Editor
            </button>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            <label className="text-sm font-medium text-night-900">Inhalt</label>
            <RichTextField value={bodyHtml} onChange={setBodyHtml} />
            <button
              type="button"
              onClick={() => {
                setAdvanced(true);
                if (!html) setHtml(brandedEmail(bodyHtml || defaultBodyHtml));
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-mist-500 hover:text-night-900"
            >
              <Code2 className="h-3.5 w-3.5" />
              Erweitert: komplettes HTML bearbeiten
            </button>
          </div>
        )}

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
        <div className="overflow-hidden rounded-2xl border border-mist-200 bg-white">
          <div className="border-b border-mist-200 px-5 py-3 text-sm">
            <span className="text-mist-400">Betreff: </span>
            <span className="font-semibold text-night-900">{previewSubject}</span>
          </div>
          <iframe
            title="E-Mail-Vorschau"
            srcDoc={previewHtml}
            className="h-[560px] w-full bg-[#f7f8fa]"
            sandbox=""
          />
        </div>
      </div>
    </div>
  );
}
