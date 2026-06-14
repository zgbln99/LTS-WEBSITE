import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { getSeoSettings } from "@/server/site-settings";

type Locale = Parameters<typeof pageMetadata>[0];
type Href = Parameters<typeof pageMetadata>[1];

// Im Admin-Panel pflegbare Seiten (feste Unterseiten, ohne Rechtstexte mit noindex).
export const SEO_PAGES = [
  { key: "unternehmen", label: "Über uns", namespace: "meta.about", href: "/unternehmen" },
  { key: "leistungen", label: "Leistungen", namespace: "meta.services", href: "/leistungen" },
  { key: "fuhrpark", label: "Fuhrpark", namespace: "meta.fleet", href: "/fuhrpark" },
  { key: "karriere", label: "Karriere", namespace: "meta.career", href: "/karriere" },
  {
    key: "lkw-fahrer",
    label: "LKW-Fahrer",
    namespace: "meta.driver",
    href: "/karriere/lkw-fahrer"
  },
  { key: "wissen", label: "Wissen", namespace: "meta.knowledge", href: "/wissen" },
  { key: "kontakt", label: "Kontakt", namespace: "meta.contact", href: "/kontakt" }
] as const;

// Liefert Seiten-Metadaten und berücksichtigt dabei die im Panel
// hinterlegten SEO-Überschreibungen (Titel / Beschreibung).
export async function seoMetadata(
  pageKey: string,
  locale: Locale,
  href: Href,
  fallbackTitle: string,
  fallbackDescription: string
): Promise<Metadata> {
  const seo = await getSeoSettings();
  const override = seo[pageKey]?.[locale];
  return pageMetadata(
    locale,
    href,
    override?.title || fallbackTitle,
    override?.description || fallbackDescription
  );
}
