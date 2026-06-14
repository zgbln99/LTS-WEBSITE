"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Puck, type Data } from "@measured/puck";
import "@measured/puck/puck.css";
import { NextIntlClientProvider } from "next-intl";
import { ArrowLeft, Languages, RotateCcw, Save } from "lucide-react";
import { builderConfig } from "@/builder/config";
import {
  DynamicDataProvider,
  type BuilderDynamicData
} from "@/builder/dynamic-data";
import {
  publishPageAction,
  resetPageAction,
  saveDraftAction,
  translatePageAction
} from "@/server/actions/builder";
import { cn } from "@/lib/utils";

const localeLabels: Record<string, string> = {
  de: "DE",
  en: "EN",
  pl: "PL",
  tr: "TR",
  uk: "UK"
};

interface PageEditorProps {
  pageKey: string;
  pageLabel: string;
  locale: string;
  locales: string[];
  initialData: Data;
  messages: Record<string, unknown>;
  dynamic: BuilderDynamicData;
  previewUrl: string;
  translationOn?: boolean;
}

export function PageEditor({
  pageKey,
  pageLabel,
  locale,
  locales,
  initialData,
  messages,
  dynamic,
  previewUrl,
  translationOn
}: PageEditorProps) {
  const latest = useRef<Data>(initialData);
  const dirty = useRef(false);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Automatisches Speichern des Entwurfs alle 10 Sekunden bei Änderungen
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!dirty.current) return;
      dirty.current = false;
      const result = await saveDraftAction(pageKey, locale, latest.current);
      if (result.ok) {
        setStatus(
          `Automatisch gespeichert ${new Date().toLocaleTimeString("de-DE")}`
        );
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [pageKey, locale]);

  const flash = (text: string) => {
    setStatus(text);
    setTimeout(() => setStatus(null), 4000);
  };

  const saveDraft = () =>
    startTransition(async () => {
      const result = await saveDraftAction(pageKey, locale, latest.current);
      flash(result.ok ? "Entwurf gespeichert." : "Fehler beim Speichern.");
    });

  const translateAll = () =>
    startTransition(async () => {
      if (
        !window.confirm(
          `Diese Seite aus ${
            localeLabels[locale] ?? locale.toUpperCase()
          } automatisch in alle anderen Sprachen übersetzen und veröffentlichen?`
        )
      ) {
        return;
      }
      setStatus("Übersetzt ...");
      const result = await translatePageAction(pageKey, locale, latest.current);
      flash(
        result.ok
          ? `In ${result.translated} Sprache(n) übersetzt und veröffentlicht.`
          : result.error === "no-key"
            ? "Kein OpenAI-Schlüssel in den Einstellungen hinterlegt."
            : "Übersetzung fehlgeschlagen."
      );
    });

  const reset = () =>
    startTransition(async () => {
      if (
        !window.confirm(
          "Diese Sprachversion auf das Standard-Layout zurücksetzen? Eigene Änderungen gehen verloren."
        )
      ) {
        return;
      }
      await resetPageAction(pageKey, locale);
      window.location.reload();
    });

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages as never}
      timeZone="Europe/Berlin"
    >
      <DynamicDataProvider value={dynamic}>
        <div className="flex h-dvh flex-col bg-mist-100">
          {/* Eigene Kopfleiste über dem Puck-Editor */}
          <div className="flex flex-wrap items-center gap-3 border-b border-mist-200 bg-night-950 px-4 py-2.5">
            <Link
              href="/admin/seiten"
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-mist-300 hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Alle Seiten
            </Link>
            <span className="font-display text-sm font-bold text-white">
              {pageLabel}
            </span>

            <div className="flex items-center gap-1 rounded-full bg-white/10 p-1">
              {locales.map((entry) => (
                <a
                  key={entry}
                  href={`/admin/seiten/${pageKey}?sprache=${entry}`}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-bold",
                    entry === locale
                      ? "bg-accent-500 text-white"
                      : "text-mist-300 hover:text-white"
                  )}
                >
                  {localeLabels[entry] ?? entry.toUpperCase()}
                </a>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2">
              {status ? (
                <span className="text-xs font-medium text-mint-400">
                  {status}
                </span>
              ) : null}
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-medium text-white hover:bg-white/10"
              >
                Seite ansehen
              </a>
              {translationOn ? (
                <button
                  type="button"
                  onClick={translateAll}
                  disabled={pending}
                  className="flex items-center gap-1.5 rounded-full border border-accent-500 px-4 py-1.5 text-xs font-semibold text-accent-400 hover:bg-accent-500/15 disabled:opacity-50"
                >
                  <Languages className="h-3.5 w-3.5" />
                  In alle Sprachen übersetzen
                </button>
              ) : null}
              <button
                type="button"
                onClick={reset}
                disabled={pending}
                className="flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-1.5 text-xs font-medium text-white hover:bg-white/10 disabled:opacity-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Zurücksetzen
              </button>
              <button
                type="button"
                onClick={saveDraft}
                disabled={pending}
                className="flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-night-900 hover:bg-mist-100 disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                Entwurf speichern
              </button>
            </div>
          </div>

          {/* Puck-Editor (eigener "Veröffentlichen"-Button in der Puck-Leiste) */}
          <div className="min-h-0 flex-1">
            <Puck
              config={builderConfig}
              data={initialData}
              viewports={[
                { width: 390, label: "Smartphone" },
                { width: 820, label: "Tablet" },
                { width: 1440, label: "Desktop" }
              ]}
              onChange={(data) => {
                latest.current = data;
                dirty.current = true;
              }}
              onPublish={async (data) => {
                latest.current = data;
                const result = await publishPageAction(pageKey, locale, data);
                flash(
                  result.ok
                    ? "Veröffentlicht. Die Seite ist jetzt online."
                    : "Fehler beim Veröffentlichen."
                );
              }}
            />
          </div>
        </div>
      </DynamicDataProvider>
    </NextIntlClientProvider>
  );
}
