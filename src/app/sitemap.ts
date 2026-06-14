import type { MetadataRoute } from "next";
import { locales, routing, type AppPathname } from "@/i18n/routing";
import { getServiceSlug, serviceOrder } from "@/data/services";
import { localizedUrl } from "@/lib/seo";
import { getServiceCities } from "@/server/content";
import { slugify } from "@/lib/slug";
import { prisma } from "@/server/db";
import { safeQuery } from "@/server/safe";

const staticPages: { pathname: AppPathname; priority: number }[] = [
  { pathname: "/", priority: 1 },
  { pathname: "/unternehmen", priority: 0.8 },
  { pathname: "/leistungen", priority: 0.9 },
  { pathname: "/fuhrpark", priority: 0.7 },
  { pathname: "/karriere", priority: 0.8 },
  { pathname: "/karriere/lkw-fahrer", priority: 0.9 },
  { pathname: "/wissen", priority: 0.6 },
  { pathname: "/kontakt", priority: 0.7 }
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  // Veröffentlichte Stellenanzeigen je Sprache (mit hreflang-Alternativen).
  const jobs =
    (await safeQuery(() =>
      prisma.jobPosting.findMany({
        where: {
          status: "PUBLISHED",
          OR: [{ validThrough: null }, { validThrough: { gte: new Date() } }]
        },
        include: { translations: true }
      })
    )) ?? [];

  for (const job of jobs) {
    const slugByLocale = new Map(
      job.translations.map((tr) => [tr.locale, tr.slug])
    );
    const availableLocales = locales.filter((l) => slugByLocale.has(l));
    for (const locale of availableLocales) {
      const slug = slugByLocale.get(locale)!;
      entries.push({
        url: localizedUrl(locale, {
          pathname: "/karriere/stelle/[slug]",
          params: { slug }
        }),
        lastModified: job.updatedAt,
        changeFrequency: "daily",
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            availableLocales.map((l) => [
              l,
              localizedUrl(l, {
                pathname: "/karriere/stelle/[slug]",
                params: { slug: slugByLocale.get(l)! }
              })
            ])
          )
        }
      });
    }
  }

  // Einsatzort-Landingpages (LKW-Fahrer Jobs in {Stadt}) je Sprache.
  const cities = await getServiceCities();
  for (const city of cities) {
    const stadt = slugify(city.city);
    for (const locale of locales) {
      const href = {
        pathname: "/karriere/orte/[stadt]" as const,
        params: { stadt }
      };
      entries.push({
        url: localizedUrl(locale, href),
        changeFrequency: "weekly",
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, localizedUrl(l, href)])
          )
        }
      });
    }
  }

  return entries;
}

export const revalidate = 3600;

// Standardlocale wird von next-intl auf /de geprefixt, daher keine Sonderbehandlung nötig.
void routing;
