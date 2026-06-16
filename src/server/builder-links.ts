import type { Data } from "@measured/puck";
import { getPathname } from "@/i18n/navigation";
import { locales, routing, type Locale } from "@/i18n/routing";
import { getServiceKeyBySlug, getServiceSlug } from "@/data/services";

// Felder im Builder, die interne Links enthalten.
const LINK_KEYS = new Set(["href", "primaryHref", "secondaryHref"]);

// Lokalisierter Pfad eines internen Pathnames (z.B. "/leistungen/[slug]" -> de).
function localized(pathname: string, locale: Locale): string {
  const entry = (
    routing.pathnames as Record<string, string | Record<string, string>>
  )[pathname];
  if (!entry) return pathname;
  return typeof entry === "string" ? entry : entry[locale] ?? pathname;
}

// Rückwärts-Tabelle: lokalisierter (statischer) Pfad -> internes Pathname.
function staticReverseMap(locale: Locale): Map<string, string> {
  const map = new Map<string, string>();
  for (const pathname of Object.keys(routing.pathnames)) {
    if (pathname.includes("[")) continue;
    map.set(localized(pathname, locale), pathname);
  }
  return map;
}

// Rechnet einen internen Link von der im Präfix erkannten Sprache auf die
// Zielsprache um (statische Routen + Leistungs-Detailseiten). Externe Links,
// Anker und unbekannte dynamische Routen bleiben unverändert.
export function relocalizeHref(href: string, target: Locale): string {
  if (!href || !href.startsWith("/")) return href;
  const parts = href.split("/");
  const first = parts[1];
  if (!locales.includes(first as Locale)) return href;
  const source = first as Locale;
  if (source === target) return href;

  const localizedPath = "/" + parts.slice(2).join("/");
  const pathOnly = localizedPath.split(/[?#]/)[0];

  // 1) Statische Route
  const staticInternal = staticReverseMap(source).get(pathOnly);
  if (staticInternal) {
    return getPathname({ locale: target, href: staticInternal as never });
  }

  // 2) Leistungs-Detailseite /<leistungen>/<slug>
  const base = localized("/leistungen/[slug]", source).replace("/[slug]", "");
  if (base && pathOnly.startsWith(base + "/")) {
    const slug = pathOnly.slice(base.length + 1).split("/")[0];
    const key = getServiceKeyBySlug(source, slug);
    if (key) {
      return getPathname({
        locale: target,
        href: {
          pathname: "/leistungen/[slug]",
          params: { slug: getServiceSlug(target, key) }
        } as never
      });
    }
  }

  // 3) Unbekannt: unverändert lassen (kein Risiko eines 404).
  return href;
}

// Rechnet alle internen Links einer Builder-Seite auf die Zielsprache um.
export function relocalizePageLinks(data: Data, target: Locale): Data {
  const clone = JSON.parse(JSON.stringify(data)) as Data;
  const walk = (node: unknown) => {
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (node && typeof node === "object") {
      const record = node as Record<string, unknown>;
      for (const key of Object.keys(record)) {
        const value = record[key];
        if (typeof value === "string") {
          if (LINK_KEYS.has(key) && value.trim()) {
            record[key] = relocalizeHref(value, target);
          }
        } else {
          walk(value);
        }
      }
    }
  };
  walk(clone);
  return clone;
}
