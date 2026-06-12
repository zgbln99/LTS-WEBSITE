"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Field, Input, Textarea } from "@/components/ui/field";
import {
  resetFooterAction,
  saveFooterAction
} from "@/server/actions/settings";
import type {
  FooterColumn,
  FooterGlobalSettings,
  FooterLocaleSettings
} from "@/server/site-settings";

interface FooterFormProps {
  locale: string;
  initialLocale: Required<FooterLocaleSettings>;
  initialGlobal: Required<FooterGlobalSettings>;
  hasCustom: boolean;
}

export function FooterForm({
  locale,
  initialLocale,
  initialGlobal,
  hasCustom
}: FooterFormProps) {
  const [tagline, setTagline] = useState(initialLocale.tagline);
  const [columns, setColumns] = useState<FooterColumn[]>(
    initialLocale.columns
  );
  const [global, setGlobal] = useState(initialGlobal);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const updateColumn = (index: number, column: FooterColumn) => {
    setColumns((current) =>
      current.map((entry, i) => (i === index ? column : entry))
    );
  };

  const save = () =>
    startTransition(async () => {
      const result = await saveFooterAction(
        locale,
        { tagline, columns },
        global
      );
      setStatus(result.ok ? "Gespeichert. Änderungen sind online." : "Fehler beim Speichern.");
      setTimeout(() => setStatus(null), 4000);
    });

  const reset = () =>
    startTransition(async () => {
      if (!window.confirm("Fußzeile dieser Sprache auf Standard zurücksetzen?")) {
        return;
      }
      await resetFooterAction(locale);
      window.location.reload();
    });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
        <h2 className="mb-4 font-display text-base font-bold text-night-900">
          Texte ({locale.toUpperCase()})
        </h2>
        <Field label="Slogan unter dem Logo" htmlFor="footer-tagline">
          <Textarea
            id="footer-tagline"
            value={tagline}
            onChange={(event) => setTagline(event.target.value)}
          />
        </Field>
      </div>

      {columns.map((column, columnIndex) => (
        <div
          key={columnIndex}
          className="rounded-2xl bg-white p-5 shadow-card sm:p-6"
        >
          <h2 className="mb-4 font-display text-base font-bold text-night-900">
            Linkspalte {columnIndex + 1} ({locale.toUpperCase()})
          </h2>
          <Field label="Spaltentitel" htmlFor={`col-title-${columnIndex}`}>
            <Input
              id={`col-title-${columnIndex}`}
              value={column.title}
              onChange={(event) =>
                updateColumn(columnIndex, {
                  ...column,
                  title: event.target.value
                })
              }
            />
          </Field>
          <div className="mt-4 space-y-2">
            {column.links.map((link, linkIndex) => (
              <div key={linkIndex} className="flex gap-2">
                <Input
                  value={link.label}
                  placeholder="Beschriftung"
                  onChange={(event) =>
                    updateColumn(columnIndex, {
                      ...column,
                      links: column.links.map((entry, i) =>
                        i === linkIndex
                          ? { ...entry, label: event.target.value }
                          : entry
                      )
                    })
                  }
                />
                <Input
                  value={link.href}
                  placeholder="/de/karriere oder https://..."
                  onChange={(event) =>
                    updateColumn(columnIndex, {
                      ...column,
                      links: column.links.map((entry, i) =>
                        i === linkIndex
                          ? { ...entry, href: event.target.value }
                          : entry
                      )
                    })
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    updateColumn(columnIndex, {
                      ...column,
                      links: column.links.filter((_, i) => i !== linkIndex)
                    })
                  }
                  className="shrink-0 rounded-lg p-2.5 text-mist-400 hover:bg-red-50 hover:text-red-600"
                  title="Link entfernen"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                updateColumn(columnIndex, {
                  ...column,
                  links: [...column.links, { label: "", href: "" }]
                })
              }
              className="flex items-center gap-1.5 rounded-full border border-mist-300 px-4 py-2 text-xs font-medium text-night-900 hover:border-night-900"
            >
              <Plus className="h-3.5 w-3.5" />
              Link hinzufügen
            </button>
          </div>
        </div>
      ))}

      <div className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
        <h2 className="mb-1 font-display text-base font-bold text-night-900">
          Kontakt und Social Media
        </h2>
        <p className="mb-4 text-xs text-mist-400">
          Gilt für alle Sprachen gemeinsam.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Telefon" htmlFor="footer-phone">
            <Input
              id="footer-phone"
              value={global.phone}
              onChange={(event) =>
                setGlobal({ ...global, phone: event.target.value })
              }
            />
          </Field>
          <Field label="E-Mail" htmlFor="footer-email">
            <Input
              id="footer-email"
              value={global.email}
              onChange={(event) =>
                setGlobal({ ...global, email: event.target.value })
              }
            />
          </Field>
          <Field label="Facebook-URL" htmlFor="footer-fb">
            <Input
              id="footer-fb"
              value={global.facebook}
              onChange={(event) =>
                setGlobal({ ...global, facebook: event.target.value })
              }
            />
          </Field>
          <Field label="LinkedIn-URL" htmlFor="footer-li">
            <Input
              id="footer-li"
              value={global.linkedin}
              onChange={(event) =>
                setGlobal({ ...global, linkedin: event.target.value })
              }
            />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Adresse (eine Zeile pro Zeile)" htmlFor="footer-address">
            <Textarea
              id="footer-address"
              value={global.addressLines.join("\n")}
              onChange={(event) =>
                setGlobal({
                  ...global,
                  addressLines: event.target.value.split("\n")
                })
              }
            />
          </Field>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="rounded-full bg-accent-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-600 disabled:opacity-50"
        >
          Speichern und veröffentlichen
        </button>
        {hasCustom ? (
          <button
            type="button"
            onClick={reset}
            disabled={pending}
            className="rounded-full border border-mist-300 px-5 py-2.5 text-sm font-medium text-night-900 hover:border-night-900 disabled:opacity-50"
          >
            Auf Standard zurücksetzen
          </button>
        ) : null}
        {status ? (
          <span className="text-sm font-medium text-mint-500">{status}</span>
        ) : null}
      </div>
    </div>
  );
}
