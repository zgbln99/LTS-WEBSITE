import { unstable_cache } from "next/cache";
import { prisma } from "@/server/db";

export const SETTINGS_CACHE_TAG = "site-settings";

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface FooterLocaleSettings {
  tagline?: string;
  columns?: FooterColumn[];
}

export interface FooterGlobalSettings {
  phone?: string;
  email?: string;
  addressLines?: string[];
  facebook?: string;
  linkedin?: string;
}

export interface GeneralSettings {
  siteName: string;
  slogan: string;
  metaTitle: string;
  metaDescription: string;
  recruitingPhone: string;
  recruitingWhatsapp: string;
}

export interface EmailTemplate {
  subject?: string;
  body?: string;
  bodyHtml?: string;
  html?: string;
}

// templateKey (inquiry|application|contact) -> locale -> { subject, body }
export type EmailTemplates = Record<string, Record<string, EmailTemplate>>;

export interface TranslationSettings {
  deeplKey: string;
  sourceLocale: string;
  autoTranslate: boolean;
}

export interface AnalyticsSettings {
  matomoUrl: string;
  matomoSiteId: string;
  gaId: string;
  pixelId: string;
}

export interface SeoEntry {
  title?: string;
  description?: string;
}

// pageKey -> locale -> { title, description }
export type SeoSettings = Record<string, Record<string, SeoEntry>>;

export interface SmtpSettings {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
  hrRecipient: string;
  inquiriesRecipient: string;
}

const loadSetting = unstable_cache(
  async (key: string) => {
    try {
      const row = await prisma.siteSetting.findUnique({ where: { key } });
      return (row?.value as Record<string, unknown>) ?? null;
    } catch (error) {
      console.error("SiteSetting konnte nicht geladen werden:", error);
      return null;
    }
  },
  ["site-setting"],
  { revalidate: 300, tags: [SETTINGS_CACHE_TAG] }
);

export async function getFooterSettings(locale: string): Promise<{
  locale: FooterLocaleSettings | null;
  global: FooterGlobalSettings | null;
}> {
  const [localeSettings, globalSettings] = await Promise.all([
    loadSetting(`footer:${locale}`),
    loadSetting("footer:global")
  ]);
  return {
    locale: localeSettings as FooterLocaleSettings | null,
    global: globalSettings as FooterGlobalSettings | null
  };
}

// Allgemeine Einstellungen mit sinnvollen Standardwerten.
export async function getGeneralSettings(): Promise<GeneralSettings> {
  const stored = (await loadSetting("general")) as Partial<GeneralSettings> | null;
  return {
    siteName: stored?.siteName || "LTS Logistik",
    slogan: stored?.slogan || "",
    metaTitle: stored?.metaTitle || "",
    metaDescription: stored?.metaDescription || "",
    recruitingPhone: stored?.recruitingPhone || "",
    recruitingWhatsapp: stored?.recruitingWhatsapp || ""
  };
}

// Übersetzungseinstellungen (DeepL). Schlüssel kann aus .env stammen.
export async function getTranslationSettings(): Promise<TranslationSettings> {
  const stored = (await loadSetting(
    "translation"
  )) as Partial<TranslationSettings> | null;
  return {
    deeplKey: stored?.deeplKey || process.env.DEEPL_API_KEY || "",
    sourceLocale: stored?.sourceLocale || "pl",
    autoTranslate: stored?.autoTranslate ?? true
  };
}

// Im Admin angepasste E-Mail-Vorlagen (Bestätigungen an Absender).
export async function getEmailTemplates(): Promise<EmailTemplates> {
  const stored = (await loadSetting("emailTemplates")) as EmailTemplates | null;
  return stored ?? {};
}

// Analyse-Einstellungen: gespeicherte Werte haben Vorrang vor den .env-Variablen.
// Ermöglicht eine selbst gehostete Matomo-Instanz ohne Google.
export async function getAnalyticsSettings(): Promise<AnalyticsSettings> {
  const stored = (await loadSetting(
    "analytics"
  )) as Partial<AnalyticsSettings> | null;
  return {
    matomoUrl: stored?.matomoUrl || process.env.NEXT_PUBLIC_MATOMO_URL || "",
    matomoSiteId:
      stored?.matomoSiteId || process.env.NEXT_PUBLIC_MATOMO_SITE_ID || "",
    gaId: stored?.gaId || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "",
    pixelId: stored?.pixelId || process.env.NEXT_PUBLIC_META_PIXEL_ID || ""
  };
}

// SEO-Überschreibungen je Seite und Sprache (leer = Standardtexte).
export async function getSeoSettings(): Promise<SeoSettings> {
  const stored = (await loadSetting("seo")) as SeoSettings | null;
  return stored ?? {};
}

// SMTP-Einstellungen: gespeicherte Werte haben Vorrang vor den .env-Variablen.
export async function getSmtpSettings(): Promise<SmtpSettings> {
  const stored = (await loadSetting("smtp")) as Partial<SmtpSettings> | null;
  return {
    host: stored?.host || process.env.SMTP_HOST || "",
    port: Number(stored?.port ?? process.env.SMTP_PORT ?? 465),
    secure:
      stored?.secure ?? (process.env.SMTP_SECURE ?? "true") === "true",
    user: stored?.user || process.env.SMTP_USER || "",
    password: stored?.password || process.env.SMTP_PASSWORD || "",
    from:
      stored?.from ||
      process.env.EMAIL_FROM ||
      stored?.user ||
      process.env.SMTP_USER ||
      "",
    hrRecipient:
      stored?.hrRecipient ||
      process.env.EMAIL_INTERNAL_HR ||
      "info@ltslogistik.de",
    inquiriesRecipient:
      stored?.inquiriesRecipient ||
      process.env.EMAIL_INTERNAL_INQUIRIES ||
      "info@ltslogistik.de"
  };
}
