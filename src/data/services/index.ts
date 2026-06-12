import type { Locale } from "@/i18n/routing";
import type { ServiceContent, ServiceKey } from "./types";
import { de } from "./de";
import { en } from "./en";
import { pl } from "./pl";
import { tr } from "./tr";
import { uk } from "./uk";

export type { ServiceContent, ServiceKey } from "./types";

const content: Record<Locale, Record<ServiceKey, ServiceContent>> = {
  de,
  en,
  pl,
  tr,
  uk
};

export const serviceOrder: ServiceKey[] = [
  "refrigerated",
  "national",
  "international",
  "express",
  "forwarding",
  "dedicated",
  "contract",
  "disposal"
];

export const serviceMeta: Record<
  ServiceKey,
  { icon: string; image: string }
> = {
  national: {
    icon: "truck",
    image:
      "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=1600&auto=format&fit=crop"
  },
  international: {
    icon: "globe",
    image:
      "https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=1600&auto=format&fit=crop"
  },
  express: {
    icon: "zap",
    image:
      "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?q=80&w=1600&auto=format&fit=crop"
  },
  refrigerated: {
    icon: "snowflake",
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1600&auto=format&fit=crop"
  },
  forwarding: {
    icon: "network",
    image:
      "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?q=80&w=1600&auto=format&fit=crop"
  },
  dedicated: {
    icon: "handshake",
    image:
      "https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?q=80&w=1600&auto=format&fit=crop"
  },
  contract: {
    icon: "file-check",
    image:
      "https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=1600&auto=format&fit=crop"
  },
  disposal: {
    icon: "recycle",
    image:
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=1600&auto=format&fit=crop"
  }
};

export function getServices(locale: Locale) {
  return serviceOrder.map((key) => ({
    key,
    ...serviceMeta[key],
    ...content[locale][key]
  }));
}

export function getServiceBySlug(locale: Locale, slug: string) {
  const entry = (Object.keys(content[locale]) as ServiceKey[]).find(
    (key) => content[locale][key].slug === slug
  );
  if (!entry) return null;
  return { key: entry, ...serviceMeta[entry], ...content[locale][entry] };
}

export function getServiceKeyBySlug(locale: Locale, slug: string) {
  return (
    (Object.keys(content[locale]) as ServiceKey[]).find(
      (key) => content[locale][key].slug === slug
    ) ?? null
  );
}

export function getServiceSlug(locale: Locale, key: ServiceKey) {
  return content[locale][key].slug;
}

export function getAllServiceParams() {
  return (Object.keys(content) as Locale[]).flatMap((locale) =>
    serviceOrder.map((key) => ({
      locale,
      slug: content[locale][key].slug
    }))
  );
}
