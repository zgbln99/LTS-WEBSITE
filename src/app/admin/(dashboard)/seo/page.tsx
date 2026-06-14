import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireRole } from "@/auth";
import { SeoForm } from "@/components/admin/seo-form";
import { getSeoSettings } from "@/server/site-settings";
import { SEO_PAGES } from "@/server/seo";
import { locales, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = { title: "SEO" };

const localeLabels: Record<string, string> = {
  de: "Deutsch",
  en: "English",
  pl: "Polski",
  tr: "Türkçe",
  uk: "Українська"
};

export default async function SeoAdminPage({
  searchParams
}: {
  searchParams: Promise<{ seite?: string; sprache?: string }>;
}) {
  const session = await requireRole(["SUPER_ADMIN", "MARKETING", "EDITOR"]);
  if (!session) redirect("/admin");

  const params = await searchParams;
  const page =
    SEO_PAGES.find((entry) => entry.key === params.seite) ?? SEO_PAGES[0];
  const locale = (
    locales.includes(params.sprache as never) ? params.sprache : "de"
  ) as Locale;

  const t = await getTranslations({ locale, namespace: page.namespace });
  const seo = await getSeoSettings();
  const stored = seo[page.key]?.[locale] ?? {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-night-900">
          SEO
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-mist-500">
          Browser-Titel und Meta-Beschreibung je Unterseite und Sprache. Die
          Startseite wird unter Einstellungen gepflegt.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {SEO_PAGES.map((entry) => (
          <Link
            key={entry.key}
            href={`/admin/seo?seite=${entry.key}&sprache=${locale}`}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium",
              entry.key === page.key
                ? "bg-night-950 text-white"
                : "bg-white text-night-900 shadow-card hover:bg-mist-100"
            )}
          >
            {entry.label}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {locales.map((entry) => (
          <Link
            key={entry}
            href={`/admin/seo?seite=${page.key}&sprache=${entry}`}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium",
              entry === locale
                ? "bg-accent-500 text-white"
                : "bg-white text-night-900 shadow-card hover:bg-mist-100"
            )}
          >
            {localeLabels[entry]}
          </Link>
        ))}
      </div>

      <SeoForm
        key={`${page.key}-${locale}`}
        pageKey={page.key}
        locale={locale}
        initialTitle={stored.title ?? ""}
        initialDescription={stored.description ?? ""}
        defaultTitle={t("title")}
        defaultDescription={t("description")}
      />
    </div>
  );
}
