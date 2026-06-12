import type { MetadataRoute } from "next";
import { locales, routing, type AppPathname } from "@/i18n/routing";
import { getServiceSlug, serviceOrder } from "@/data/services";
import { localizedUrl } from "@/lib/seo";

const staticPages: { pathname: AppPathname; priority: number }[] = [
  { pathname: "/", priority: 1 },
  { pathname: "/unternehmen", priority: 0.8 },
  { pathname: "/leistungen", priority: 0.9 },
  { pathname: "/fuhrpark", priority: 0.7 },
  { pathname: "/karriere", priority: 0.8 },
  { pathname: "/karriere/lkw-fahrer", priority: 0.9 },
  { pathname: "/wissen", priority: 0.6 },
  { pathname: "/transportanfrage", priority: 0.9 },
  { pathname: "/kontakt", priority: 0.7 }
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const page of staticPages) {
    for (const locale of locales) {
      entries.push({
        url: localizedUrl(locale, page.pathname),
        changeFrequency: "weekly",
        priority: page.priority,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, localizedUrl(l, page.pathname)])
          )
        }
      });
    }
  }

  for (const key of serviceOrder) {
    for (const locale of locales) {
      const href = {
        pathname: "/leistungen/[slug]" as const,
        params: { slug: getServiceSlug(locale, key) }
      };
      entries.push({
        url: localizedUrl(locale, href),
        changeFrequency: "monthly",
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [
              l,
              localizedUrl(l, {
                pathname: "/leistungen/[slug]",
                params: { slug: getServiceSlug(l, key) }
              })
            ])
          )
        }
      });
    }
  }

  return entries;
}

export const dynamic = "force-static";

// Standardlocale wird von next-intl auf /de geprefixt, daher keine Sonderbehandlung nötig.
void routing;
