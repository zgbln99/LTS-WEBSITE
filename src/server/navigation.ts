import { getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getNavSettings, type NavLink } from "@/server/site-settings";

// Standard-Navigationspunkte (entsprechen dem bisherigen Kopfmenü).
const DEFAULT_NAV: { key: string; href: Parameters<typeof getPathname>[0]["href"] }[] = [
  { key: "about", href: "/unternehmen" },
  { key: "services", href: "/leistungen" },
  { key: "fleet", href: "/fuhrpark" },
  { key: "career", href: "/karriere" },
  { key: "knowledge", href: "/wissen" },
  { key: "contact", href: "/kontakt" }
];

// Standard-Navigation einer Sprache (Beschriftung + lokalisierter Pfad).
export async function getDefaultNavigation(locale: Locale): Promise<NavLink[]> {
  const t = await getTranslations({ locale, namespace: "common" });
  return DEFAULT_NAV.map((entry) => ({
    label: t(`nav.${entry.key}`),
    href: getPathname({ locale, href: entry.href })
  }));
}

// Aktive Navigation: eigene Punkte aus dem Admin oder der Standard.
export async function getNavigation(locale: Locale): Promise<NavLink[]> {
  const custom = await getNavSettings(locale);
  if (custom && custom.length > 0) return custom;
  return getDefaultNavigation(locale);
}
