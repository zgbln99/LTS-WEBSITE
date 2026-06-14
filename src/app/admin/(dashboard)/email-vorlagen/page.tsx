import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireRole } from "@/auth";
import { EmailTemplateForm } from "@/components/admin/email-template-form";
import { getEmailTemplates } from "@/server/site-settings";
import { locales, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = { title: "E-Mail-Vorlagen" };

// templateKey -> Beschriftung + Schlüssel der Standardtexte (forms.emails)
const TEMPLATES = [
  { key: "application", label: "Bewerbung", subjectKey: "applicationSubject", bodyKey: "applicationBody" },
  { key: "contact", label: "Kontakt", subjectKey: "contactSubject", bodyKey: "contactBody" },
  { key: "inquiry", label: "Transportanfrage", subjectKey: "inquirySubject", bodyKey: "inquiryBody" }
] as const;

const localeLabels: Record<string, string> = {
  de: "Deutsch",
  en: "English",
  pl: "Polski",
  tr: "Türkçe",
  uk: "Українська"
};

export default async function EmailTemplatesPage({
  searchParams
}: {
  searchParams: Promise<{ vorlage?: string; sprache?: string }>;
}) {
  const session = await requireRole(["SUPER_ADMIN", "MARKETING", "EDITOR"]);
  if (!session) redirect("/admin");

  const params = await searchParams;
  const template =
    TEMPLATES.find((entry) => entry.key === params.vorlage) ?? TEMPLATES[0];
  const locale = (
    locales.includes(params.sprache as never) ? params.sprache : "de"
  ) as Locale;

  const t = await getTranslations({ locale, namespace: "forms.emails" });
  const templates = await getEmailTemplates();
  const stored = templates[template.key]?.[locale] ?? {};
  // Platzhalter im Standardtext sichtbar lassen.
  const tokens = { name: "{name}", reference: "{reference}" };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-night-900">
          E-Mail-Vorlagen
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-mist-500">
          Automatische Bestätigungen an Absender, je Vorlage und Sprache mit
          Live-Vorschau.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TEMPLATES.map((entry) => (
          <Link
            key={entry.key}
            href={`/admin/email-vorlagen?vorlage=${entry.key}&sprache=${locale}`}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium",
              entry.key === template.key
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
            href={`/admin/email-vorlagen?vorlage=${template.key}&sprache=${entry}`}
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

      <EmailTemplateForm
        key={`${template.key}-${locale}`}
        templateKey={template.key}
        locale={locale}
        initialSubject={stored.subject ?? ""}
        initialBodyHtml={stored.bodyHtml ?? ""}
        initialHtml={stored.html ?? ""}
        defaultSubject={t(template.subjectKey, tokens)}
        defaultBody={t(template.bodyKey, tokens)}
      />
    </div>
  );
}
