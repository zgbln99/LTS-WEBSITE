import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireRole } from "@/auth";
import { FooterForm } from "@/components/admin/footer-form";
import { getFooterSettings } from "@/server/site-settings";
import { getPathname } from "@/i18n/navigation";
import { getServices } from "@/data/services";
import { company } from "@/data/company";
import { locales, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = { title: "Fußzeile" };

const localeLabels: Record<string, string> = {
  de: "Deutsch",
  en: "English",
  pl: "Polski",
  tr: "Türkçe",
  uk: "Українська"
};

export default async function FooterAdminPage({
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

  const t = await getTranslations({ locale, namespace: "common" });
  const settings = await getFooterSettings(locale);

  // Vorbelegung: gespeicherte Werte oder der aktuelle Standard
  const defaultColumns = [
    {
      title: t("footer.company"),
      links: [
        { label: t("nav.about"), href: getPathname({ locale, href: "/unternehmen" }) },
        { label: t("nav.fleet"), href: getPathname({ locale, href: "/fuhrpark" }) },
        { label: t("nav.career"), href: getPathname({ locale, href: "/karriere" }) },
        { label: t("nav.knowledge"), href: getPathname({ locale, href: "/wissen" }) },
        { label: t("nav.contact"), href: getPathname({ locale, href: "/kontakt" }) }
      ]
    },
    {
      title: t("footer.services"),
      links: getServices(locale)
        .slice(0, 5)
        .map((service) => ({
          label: service.name,
          href: getPathname({
            locale,
            href: {
              pathname: "/leistungen/[slug]",
              params: { slug: service.slug }
            }
          })
        }))
    }
  ];

  const defaultLegalLinks = [
    { label: t("footer.imprint"), href: getPathname({ locale, href: "/impressum" }) },
    { label: t("footer.privacy"), href: getPathname({ locale, href: "/datenschutz" }) },
    { label: t("footer.cookies"), href: getPathname({ locale, href: "/cookie-richtlinie" }) }
  ];

  const initialLocale = {
    tagline: settings.locale?.tagline ?? t("footer.tagline"),
    columns:
      settings.locale?.columns && settings.locale.columns.length > 0
        ? settings.locale.columns
        : defaultColumns,
    legalLinks:
      settings.locale?.legalLinks && settings.locale.legalLinks.length > 0
        ? settings.locale.legalLinks
        : defaultLegalLinks
  };

  const initialGlobal = {
    phone: settings.global?.phone ?? company.phone,
    email: settings.global?.email ?? company.email,
    addressLines: settings.global?.addressLines ?? [
      t("footer.headquarters"),
      company.address.street,
      `${company.address.zip} ${company.address.city}`,
      company.address.district
    ],
    facebook: settings.global?.facebook ?? company.social.facebook,
    linkedin: settings.global?.linkedin ?? company.social.linkedin
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-night-900">
          Fußzeile
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-mist-500">
          Slogan und Linkspalten je Sprache, Kontaktdaten und Social Media
          global. Änderungen erscheinen sofort auf allen Seiten.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {locales.map((entry) => (
          <Link
            key={entry}
            href={`/admin/fusszeile?sprache=${entry}`}
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

      <FooterForm
        key={locale}
        locale={locale}
        initialLocale={initialLocale}
        initialGlobal={initialGlobal}
        hasCustom={Boolean(settings.locale)}
      />
    </div>
  );
}
