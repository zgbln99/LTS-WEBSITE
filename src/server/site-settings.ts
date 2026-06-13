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
  recruitingPhone: string;
  recruitingWhatsapp: string;
}

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
    recruitingPhone: stored?.recruitingPhone || "",
    recruitingWhatsapp: stored?.recruitingWhatsapp || ""
  };
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
