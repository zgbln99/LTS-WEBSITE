"use client";

import { useMemo, useState, useTransition } from "react";
import { Code, FileText, LayoutTemplate } from "lucide-react";
import { Field, Input, Textarea } from "@/components/ui/field";
import { saveEmailTemplate } from "@/server/actions/settings";
import { cn } from "@/lib/utils";

const SAMPLE: Record<string, string> = {
  name: "Max Mustermann",
  reference: "BEW-25ABCDE"
};

function interpolate(value: string) {
  return value.replace(/\{(\w+)\}/g, (_, key) => SAMPLE[key] ?? `{${key}}`);
}

// Schlichtes, an den Absender gerichtetes Standard-HTML als Startpunkt.
function defaultHtml(body: string) {
  const paragraphs = (body || "Guten Tag {name},\n\nvielen Dank für Ihre Nachricht.")
    .split(/\n\s*\n/)
    .map(
      (p) =>
        `      <p style="margin:0 0 14px;color:#0b0f1a;font-size:15px;line-height:1.65">${p.replace(/\n/g, "<br/>")}</p>`
    )
    .join("\n");
  return `<!doctype html>
<html>
  <body style="margin:0;background:#f7f8fa;font-family:Arial,Helvetica,sans-serif">
    <div style="max-width:600px;margin:0 auto;padding:32px 16px">
      <div style="background:#0b101d;border-radius:16px 16px 0 0;padding:22px 28px">
        <span style="color:#ffffff;font-size:18px;font-weight:bold">LTS Logistik</span>
      </div>
      <div style="background:#ffffff;border-radius:0 0 16px 16px;padding:28px">
${paragraphs}
        <p style="margin:24px 0 0;color:#6b7585;font-size:13px">LTS Logistik GmbH · Hennickendorfer Str. 1 · 14947 Nuthe-Urstromtal</p>
      </div>
    </div>
  </body>
</html>`;
}

export function EmailTemplateForm({
  templateKey,
  locale,
  initialSubject,
  initialBody,
  initialHtml,
  defaultSubject,
  defaultBody
}: {
  templateKey: string;
  locale: string;
  initialSubject: string;
  initialBody: string;
  initialHtml: string;
  defaultSubject: string;
  defaultBody: string;
}) {
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [html, setHtml] = useState(initialHtml);
  const [tab, setTab] = useState<"text" | "html">(initialHtml ? "html" : "text");
  const [note, setNote] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const previewSubject = useMemo(
    () => interpolate(subject || defaultSubject),
    [subject, defaultSubject]
  );
  // Vorschau: eigenes HTML wenn vorhanden, sonst Text im Marken-Layout.
  const previewHtml = useMemo(() => {
    const source = html.trim() ? html : defaultHtml(body || defaultBody);
    return interpolate(source);
  }, [html, body, defaultBody]);

  const save = () =>
    startTransition(async () => {
      const result = await saveEmailTemplate(templateKey, locale, {
        subject,
        body,
        html
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

        <div className="mt-5 flex items-center gap-1 rounded-xl bg-mist-100 p-1">
          <button
            type="button"
            onClick={() => setTab("text")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
              tab === "text" ? "bg-white text-night-900 shadow-sm" : "text-mist-500"
            )}
          >
            <FileText className="h-4 w-4" />
            Textversion
          </button>
          <button
            type="button"
            onClick={() => setTab("html")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
              tab === "html" ? "bg-white text-night-900 shadow-sm" : "text-mist-500"
            )}
          >
            <Code className="h-4 w-4" />
            HTML-Version
          </button>
        </div>

        <p className="mt-3 text-xs text-mist-500">
          Platzhalter: <code className="rounded bg-mist-100 px-1">{"{name}"}</code>{" "}
          und <code className="rounded bg-mist-100 px-1">{"{reference}"}</code>.
        </p>

        {tab === "text" ? (
          <div className="mt-3">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={defaultBody}
              className="min-h-64 font-mono text-xs"
              aria-label="Textversion"
            />
            <p className="mt-1.5 text-xs text-mist-400">
              Wird als reiner Text verschickt und als Grundlage genutzt, wenn
              keine eigene HTML-Version gesetzt ist.
            </p>
          </div>
        ) : (
          <div className="mt-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-mist-400">
                Vollständiges E-Mail-HTML (inline Styles empfohlen).
              </span>
              <button
                type="button"
                onClick={() => setHtml(defaultHtml(body || defaultBody))}
                className="inline-flex items-center gap-1.5 rounded-lg border border-mist-300 px-2.5 py-1 text-xs font-semibold text-night-900 hover:bg-mist-100"
              >
                <LayoutTemplate className="h-3.5 w-3.5" />
                Standard-HTML einfügen
              </button>
            </div>
            <Textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              placeholder="Leer = automatisches Marken-Layout aus der Textversion"
              spellCheck={false}
              className="min-h-72 bg-night-950 font-mono text-xs text-mint-300"
              aria-label="HTML-Version"
            />
            {html.trim() ? (
              <button
                type="button"
                onClick={() => setHtml("")}
                className="mt-1.5 text-xs font-medium text-accent-600 hover:underline"
              >
                HTML entfernen (zurück zum Standard-Layout)
              </button>
            ) : null}
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
