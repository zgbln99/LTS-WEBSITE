import Link from "next/link";
import { redirect } from "next/navigation";
import { Languages, RotateCcw, Search } from "lucide-react";
import { requireRole } from "@/auth";
import { prisma } from "@/server/db";
import { safeQuery } from "@/server/safe";
import {
  resetTextOverride,
  saveTextOverride,
  translateTextOverride
} from "@/server/actions/content";
import { flattenMessages } from "@/server/text-overrides";
import { isTranslationConfigured } from "@/server/translate";
import { AdminCard } from "@/components/admin/admin-ui";
import { locales } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = { title: "Website-Texte" };

const localeLabels: Record<string, string> = {
  de: "Deutsch",
  en: "English",
  pl: "Polski",
  tr: "Türkçe",
  uk: "Українська"
};

const PAGE_SIZE = 30;

export default async function TextsAdminPage({
  searchParams
}: {
  searchParams: Promise<{ sprache?: string; q?: string; seite?: string }>;
}) {
  const session = await requireRole(["SUPER_ADMIN", "MARKETING", "EDITOR"]);
  if (!session) redirect("/admin");

  const translationOn = await isTranslationConfigured();

  const params = await searchParams;
  const locale = locales.includes(params.sprache as never)
    ? (params.sprache as string)
    : "de";
  const query = (params.q ?? "").trim().toLowerCase();
  const page = Math.max(1, Number.parseInt(params.seite ?? "1", 10) || 1);

  // Standardtexte aus der Sprachdatei einlesen und abflachen
  // (per import, damit die Dateien im Docker-Standalone-Build enthalten sind)
  const messages = (await import(`../../../../../messages/${locale}.json`))
    .default;
  const allTexts = flattenMessages(messages);

  const overrides = await safeQuery(() =>
    prisma.textOverride.findMany({ where: { locale } })
  );
  const overrideMap = new Map(
    (overrides ?? []).map((row) => [row.key, row.value])
  );

  const filtered = query
    ? allTexts.filter(
        (entry) =>
          entry.key.toLowerCase().includes(query) ||
          entry.value.toLowerCase().includes(query) ||
          (overrideMap.get(entry.key) ?? "").toLowerCase().includes(query)
      )
    : allTexts;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const buildHref = (overridesParams: Record<string, string>) => {
    const search = new URLSearchParams({
      sprache: locale,
      ...(query ? { q: params.q ?? "" } : {}),
      ...overridesParams
    });
    return `/admin/texte?${search.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-night-900">
          Website-Texte
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-mist-500">
          Alle Texte der Website lassen sich hier je Sprache überschreiben.
          Leeres Feld speichern oder Zurücksetzen stellt den Standardtext
          wieder her. Änderungen sind nach wenigen Sekunden online.
        </p>
      </div>

      {/* Sprachwahl */}
      <div className="flex flex-wrap gap-2">
        {locales.map((entry) => (
          <Link
            key={entry}
            href={`/admin/texte?sprache=${entry}${query ? `&q=${encodeURIComponent(params.q ?? "")}` : ""}`}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium",
              entry === locale
                ? "bg-night-950 text-white"
                : "bg-white text-night-900 shadow-card hover:bg-mist-100"
            )}
          >
            {localeLabels[entry]}
          </Link>
        ))}
      </div>

      {/* Suche */}
      <form action="/admin/texte" method="get" className="flex gap-2">
        <input type="hidden" name="sprache" value={locale} />
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-400" />
          <input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Suchen: z.B. hero, Karriere, Anrufen..."
            className="w-full rounded-xl border border-mist-300 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-accent-500"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-accent-500 px-6 text-sm font-medium text-white hover:bg-accent-600"
        >
          Suchen
        </button>
      </form>

      <p className="text-sm text-mist-500">
        {filtered.length} Texte{query ? ` für "${params.q}"` : ""} · Seite{" "}
        {page} von {totalPages}
      </p>

      <div className="space-y-3">
        {visible.map((entry) => {
          const override = overrideMap.get(entry.key);
          return (
            <AdminCard key={entry.key}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <code className="rounded bg-mist-100 px-2 py-1 text-xs text-mist-500">
                  {entry.key}
                </code>
                {override !== undefined ? (
                  <span className="rounded-full bg-accent-500/10 px-2.5 py-1 text-xs font-semibold text-accent-600">
                    Angepasst
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-xs text-mist-400">
                Standard: {entry.value}
              </p>
              <form action={saveTextOverride} className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="key" value={entry.key} />
                <textarea
                  name="value"
                  rows={2}
                  defaultValue={override ?? entry.value}
                  className="min-h-11 flex-1 resize-y rounded-xl border border-mist-300 bg-white px-4 py-2.5 text-sm text-night-900 outline-none focus:border-accent-500"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="rounded-full bg-night-950 px-5 py-2 text-sm font-medium text-white hover:bg-night-800"
                  >
                    Speichern
                  </button>
                  {translationOn ? (
                    <button
                      type="submit"
                      formAction={translateTextOverride}
                      title="In alle Sprachen übersetzen"
                      className="flex items-center gap-1.5 rounded-full border border-accent-500 px-4 py-2 text-sm font-medium text-accent-600 hover:bg-accent-500/10"
                    >
                      <Languages className="h-3.5 w-3.5" />
                      Übersetzen
                    </button>
                  ) : null}
                  {override !== undefined ? (
                    <button
                      type="submit"
                      formAction={resetTextOverride}
                      title="Auf Standard zurücksetzen"
                      className="flex items-center gap-1.5 rounded-full border border-mist-300 px-4 py-2 text-sm font-medium text-night-900 hover:border-night-900"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Zurücksetzen
                    </button>
                  ) : null}
                </div>
              </form>
            </AdminCard>
          );
        })}
      </div>

      {/* Seiten */}
      {totalPages > 1 ? (
        <div className="flex items-center gap-2">
          {page > 1 ? (
            <Link
              href={buildHref({ seite: String(page - 1) })}
              className="rounded-full border border-mist-300 px-4 py-2 text-sm font-medium hover:border-night-900"
            >
              Zurück
            </Link>
          ) : null}
          {page < totalPages ? (
            <Link
              href={buildHref({ seite: String(page + 1) })}
              className="rounded-full border border-mist-300 px-4 py-2 text-sm font-medium hover:border-night-900"
            >
              Weiter
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
