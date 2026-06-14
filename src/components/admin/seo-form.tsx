"use client";

import { useState, useTransition } from "react";
import { Field, Input, Textarea } from "@/components/ui/field";
import { saveSeoAction } from "@/server/actions/settings";

export function SeoForm({
  pageKey,
  locale,
  initialTitle,
  initialDescription,
  defaultTitle,
  defaultDescription
}: {
  pageKey: string;
  locale: string;
  initialTitle: string;
  initialDescription: string;
  defaultTitle: string;
  defaultDescription: string;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [note, setNote] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const save = () =>
    startTransition(async () => {
      const result = await saveSeoAction(pageKey, locale, {
        title,
        description
      });
      setNote(result.ok ? "Gespeichert." : "Fehler beim Speichern.");
      setTimeout(() => setNote(null), 4000);
    });

  return (
    <div className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
      <p className="mb-4 text-sm text-mist-500">
        Leer lassen = automatischer Standardtext. Der Website-Name wird bei
        Unterseiten automatisch angehängt.
      </p>
      <div className="space-y-4">
        <Field label="Browser-Titel / SEO-Titel" htmlFor="seo-title">
          <Input
            id="seo-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={defaultTitle}
          />
        </Field>
        <Field label="Meta-Beschreibung" htmlFor="seo-desc">
          <Textarea
            id="seo-desc"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={defaultDescription}
            className="min-h-24"
          />
          <span className="text-xs text-mist-400">
            {description.length} Zeichen (empfohlen: 120-160)
          </span>
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
  );
}
