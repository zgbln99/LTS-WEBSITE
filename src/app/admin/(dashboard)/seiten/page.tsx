import Link from "next/link";
import { redirect } from "next/navigation";
import { PencilRuler } from "lucide-react";
import { requireRole } from "@/auth";
import { prisma } from "@/server/db";
import { safeQuery } from "@/server/safe";
import { AdminCard } from "@/components/admin/admin-ui";
import { BUILDER_PAGES } from "@/builder/defaults";
import { getServices } from "@/data/services";
import { locales } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = { title: "Seiten-Editor" };

export default async function PagesAdminPage() {
  const session = await requireRole(["SUPER_ADMIN", "MARKETING", "EDITOR"]);
  if (!session) redirect("/admin");

  const pages = await safeQuery(() =>
    prisma.page.findMany({ include: { translations: true } })
  );

  const statusFor = (key: string, locale: string) => {
    const page = pages?.find((entry) => entry.key === key);
    const translation = page?.translations.find(
      (entry) => entry.locale === locale
    );
    if (!translation) return "standard";
    const hasContent =
      typeof translation.content === "object" &&
      translation.content !== null &&
      Array.isArray((translation.content as { content?: unknown[] }).content) &&
      ((translation.content as { content: unknown[] }).content.length ?? 0) > 0;
    const hasDraft = translation.draft !== null;
    if (hasContent && hasDraft) return "entwurf";
    if (hasContent) return "online";
    if (hasDraft) return "entwurf";
    return "standard";
  };

  const badgeStyles: Record<string, string> = {
    standard: "bg-mist-100 text-mist-500",
    entwurf: "bg-accent-500/10 text-accent-600",
    online: "bg-mint-400/15 text-mint-500"
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-night-900">
          Seiten-Editor
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-mist-500">
          Visueller Editor: Abschnitte verschieben, Texte formatieren, Bilder
          und Buttons ändern, je Sprache. "Standard" bedeutet, die Seite nutzt
          noch das eingebaute Layout; nach dem ersten Veröffentlichen zählt
          Ihre Version.
        </p>
      </div>

      {/* Hinweis: globale Elemente werden über Website-Texte gepflegt */}
      <div className="rounded-2xl bg-night-950 px-5 py-4 text-sm text-mist-300">
        Cookie-Banner, Navigation, Fußzeile und Formular-Beschriftungen
        bearbeiten Sie unter{" "}
        <Link href="/admin/texte" className="font-semibold text-white underline">
          Website-Texte
        </Link>{" "}
        (z.B. nach "Cookies" suchen).
      </div>

      {(
        [
          ["haupt", "Hauptseiten"],
          ["leistungen", "Leistungen"],
          ["rechtliches", "Rechtliches"]
        ] as const
      ).map(([group, groupLabel]) => (
        <div key={group} className="space-y-3">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-mist-400">
            {groupLabel}
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {Object.entries(BUILDER_PAGES)
              .filter(([, page]) => page.group === group)
              .map(([key, page]) => (
          <AdminCard key={key}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold text-night-900">
                  {page.serviceKey
                    ? `Leistung: ${
                        getServices("de").find(
                          (service) => service.key === page.serviceKey
                        )?.name ?? page.serviceKey
                      }`
                    : page.label}
                </h2>
                <p className="text-xs text-mist-400">{page.route}</p>
              </div>
              <Link
                href={`/admin/seiten/${key}?sprache=de`}
                className="flex items-center gap-2 rounded-full bg-accent-500 px-5 py-2 text-sm font-medium text-white hover:bg-accent-600"
              >
                <PencilRuler className="h-4 w-4" />
                Bearbeiten
              </Link>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {locales.map((locale) => {
                const state = statusFor(key, locale);
                return (
                  <Link
                    key={locale}
                    href={`/admin/seiten/${key}?sprache=${locale}`}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-semibold uppercase",
                      badgeStyles[state]
                    )}
                    title={
                      state === "online"
                        ? "Eigene Version online"
                        : state === "entwurf"
                          ? "Entwurf vorhanden"
                          : "Standard-Layout"
                    }
                  >
                    {locale} · {state}
                  </Link>
                );
              })}
            </div>
          </AdminCard>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
