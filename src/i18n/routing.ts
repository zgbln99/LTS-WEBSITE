import { defineRouting } from "next-intl/routing";

export const locales = ["de", "en", "pl", "tr", "uk"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "de",
  localePrefix: "always",
  pathnames: {
    "/": "/",
    "/unternehmen": {
      de: "/unternehmen",
      en: "/about-us",
      pl: "/o-firmie",
      tr: "/hakkimizda",
      uk: "/pro-kompaniyu"
    },
    "/leistungen": {
      de: "/leistungen",
      en: "/services",
      pl: "/uslugi",
      tr: "/hizmetler",
      uk: "/posluhy"
    },
    "/leistungen/[slug]": {
      de: "/leistungen/[slug]",
      en: "/services/[slug]",
      pl: "/uslugi/[slug]",
      tr: "/hizmetler/[slug]",
      uk: "/posluhy/[slug]"
    },
    "/fuhrpark": {
      de: "/fuhrpark",
      en: "/fleet",
      pl: "/flota",
      tr: "/filo",
      uk: "/avtopark"
    },
    "/karriere": {
      de: "/karriere",
      en: "/careers",
      pl: "/kariera",
      tr: "/kariyer",
      uk: "/karyera"
    },
    "/karriere/lkw-fahrer": {
      de: "/karriere/lkw-fahrer",
      en: "/careers/truck-drivers",
      pl: "/kariera/kierowcy",
      tr: "/kariyer/tir-soforleri",
      uk: "/karyera/vodiyi"
    },
    "/karriere/stelle/[slug]": {
      de: "/karriere/stelle/[slug]",
      en: "/careers/job/[slug]",
      pl: "/kariera/oferta/[slug]",
      tr: "/kariyer/ilan/[slug]",
      uk: "/karyera/vakansiya/[slug]"
    },
    "/karriere/orte/[stadt]": {
      de: "/karriere/orte/[stadt]",
      en: "/careers/locations/[stadt]",
      pl: "/kariera/lokalizacje/[stadt]",
      tr: "/kariyer/lokasyonlar/[stadt]",
      uk: "/karyera/lokatsiyi/[stadt]"
    },
    "/karriere/termin": {
      de: "/karriere/termin",
      en: "/careers/appointment",
      pl: "/kariera/spotkanie",
      tr: "/kariyer/randevu",
      uk: "/karyera/zustrich"
    },
    "/wissen": {
      de: "/wissen",
      en: "/knowledge",
      pl: "/baza-wiedzy",
      tr: "/bilgi-merkezi",
      uk: "/baza-znan"
    },
    "/wissen/[slug]": {
      de: "/wissen/[slug]",
      en: "/knowledge/[slug]",
      pl: "/baza-wiedzy/[slug]",
      tr: "/bilgi-merkezi/[slug]",
      uk: "/baza-znan/[slug]"
    },
    "/transportanfrage": {
      de: "/transportanfrage",
      en: "/transport-inquiry",
      pl: "/zapytanie-transportowe",
      tr: "/nakliye-talebi",
      uk: "/zapyt-na-perevezennya"
    },
    "/kontakt": {
      de: "/kontakt",
      en: "/contact",
      pl: "/kontakt",
      tr: "/iletisim",
      uk: "/kontakty"
    },
    "/impressum": "/impressum",
    "/datenschutz": {
      de: "/datenschutz",
      en: "/privacy",
      pl: "/polityka-prywatnosci",
      tr: "/gizlilik",
      uk: "/konfidentsiynist"
    }
  }
});

export type AppPathname = keyof typeof routing.pathnames;
