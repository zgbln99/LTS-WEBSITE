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
