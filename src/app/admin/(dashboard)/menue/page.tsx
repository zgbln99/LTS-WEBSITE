import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/auth";
import { NavForm } from "@/components/admin/nav-form";
import { getNavSettings } from "@/server/site-settings";
import { getDefaultNavigation } from "@/server/navigation";
import { locales, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = { title: "Menü / Navigation" };

const localeLabels: Record<string, string> = {
  de: "Deutsch",
  en: "English",
  pl: "Polski",
  tr: "Türkçe",
  uk: "Українська"
};

export default async function MenuAdminPage({
  searchParams
}: {
  searchParams: Promise<{ sprache?: string }>;
}) {
  const session = await requireRole(["SUPER_ADMIN", "MARKETING", "EDITOR"]);
  if (!session) redirect("/admin");

  const params = await searchParams;
  const locale = (
    locales.includes(params.sprache as never) ? params.sprache : "de"
  ) as Locale;

  const custom = await getNavSettings(locale);
  const initialItems = custom ?? (await getDefaultNavigation(locale));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-night-900">
          Menü / Navigation
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-mist-500">
          Punkte und Reihenfolge des Kopfmenüs je Sprache. Ohne eigene Punkte
          wird das Standardmenü angezeigt. Änderungen erscheinen sofort.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {locales.map((entry) => (
          <Link
            key={entry}
            href={`/admin/menue?sprache=${entry}`}
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

      <NavForm
        key={locale}
        locale={locale}
        initialItems={initialItems}
        hasCustom={Boolean(custom)}
      />
    </div>
  );
}
