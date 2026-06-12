import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { locales, routing, type AppPathname, type Locale } from "@/i18n/routing";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ltslogistik.de";

type Href =
  | AppPathname
  | { pathname: AppPathname; params?: Record<string, string> };

export function localizedUrl(locale: Locale, href: Href) {
  return `${SITE_URL}${getPathname({ locale, href: href as never })}`;
}

export function buildAlternates(locale: Locale, href: Href) {
  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[l] = localizedUrl(l, href);
  }
  languages["x-default"] = localizedUrl(routing.defaultLocale, href);

  return {
    canonical: localizedUrl(locale, href),
    languages
  };
}

export function pageMetadata(
  locale: Locale,
  href: Href,
  title: string,
  description: string
): Metadata {
  return {
    title,
    description,
    alternates: buildAlternates(locale, href),
    openGraph: {
      title: `${title} | LTS Logistik`,
      description,
      url: localizedUrl(locale, href),
      siteName: "LTS Logistik",
      locale,
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | LTS Logistik`,
      description
    }
  };
}
