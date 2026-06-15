import { prisma } from "@/server/db";
import { safeQuery } from "@/server/safe";
import { company } from "@/data/company";

export interface MapLocation {
  city: string;
  region: string | null;
  lngLat: [number, number];
  hq?: boolean;
}

// Einsatzorte aus der Datenbank, Fallback auf die statische Liste.
export async function getServiceCities(): Promise<MapLocation[]> {
  const cities = await safeQuery(() =>
    prisma.serviceCity.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" }
    })
  );
  if (cities && cities.length > 0) {
    return cities.map((city) => ({
      city: city.name,
      region: city.region,
      lngLat: [city.lng, city.lat] as [number, number]
    }));
  }
  return company.locations.map((location) => ({
    city: location.city,
    region: location.region,
    lngLat: location.lngLat
  }));
}

// Öffentliche Inhalte mit Fallback auf Deutsch, wenn eine Übersetzung fehlt.

export function pickTranslation<T extends { locale: string }>(
  translations: T[],
  locale: string
): T | null {
  return (
    translations.find((entry) => entry.locale === locale) ??
    translations.find((entry) => entry.locale === "de") ??
    translations[0] ??
    null
  );
}

export async function getPublishedJobs(locale: string) {
  const jobs = await safeQuery(() =>
    prisma.jobPosting.findMany({
      where: {
        status: "PUBLISHED",
        OR: [{ validThrough: null }, { validThrough: { gte: new Date() } }]
      },
      orderBy: { publishedAt: "desc" },
      include: { translations: true, category: true }
    })
  );
  if (!jobs) return [];
  return jobs
    .map((job) => {
      const translation = pickTranslation(job.translations, locale);
      if (!translation) return null;
      return { ...job, translation };
    })
    .filter((job) => job !== null);
}

export async function getJobBySlug(locale: string, slug: string) {
  const translation = await safeQuery(() =>
    prisma.jobPostingTranslation.findFirst({
      where: { slug },
      include: {
        jobPosting: { include: { translations: true, category: true } }
      }
    })
  );
  if (!translation || translation.jobPosting.status !== "PUBLISHED") {
    return null;
  }
  const job = translation.jobPosting;
  const localized = pickTranslation(job.translations, locale);
  if (!localized) return null;
  return { ...job, translation: localized };
}

export async function getPublishedArticles(locale: string) {
  const articles = await safeQuery(() =>
    prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 50,
      include: { translations: true, author: true }
    })
  );
  if (!articles) return [];
  return articles
    .map((article) => {
      const translation = pickTranslation(article.translations, locale);
      if (!translation) return null;
      return { ...article, translation };
    })
    .filter((article) => article !== null);
}

export async function getArticleBySlug(locale: string, slug: string) {
  const translation = await safeQuery(() =>
    prisma.blogPostTranslation.findFirst({
      where: { slug },
      include: {
        blogPost: { include: { translations: true, author: true } }
      }
    })
  );
  if (!translation || translation.blogPost.status !== "PUBLISHED") {
    return null;
  }
  const article = translation.blogPost;
  const localized = pickTranslation(article.translations, locale);
  if (!localized) return null;
  return { ...article, translation: localized };
}

export async function getPublishedTestimonials(locale: string) {
  const testimonials = await safeQuery(() =>
    prisma.testimonial.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
      take: 6,
      include: { translations: true }
    })
  );
  if (!testimonials) return [];
  return testimonials
    .map((testimonial) => {
      const translation = pickTranslation(testimonial.translations, locale);
      if (!translation) return null;
      return { ...testimonial, quote: translation.quote };
    })
    .filter((testimonial) => testimonial !== null);
}

export function articleParagraphs(content: unknown): string[] {
  if (
    content &&
    typeof content === "object" &&
    "paragraphs" in content &&
    Array.isArray((content as { paragraphs: unknown }).paragraphs)
  ) {
    return (content as { paragraphs: string[] }).paragraphs;
  }
  return [];
}

// HTML-Inhalt eines Artikels. Neue Artikel speichern formatiertes HTML;
// ältere (nur Absätze) werden hier in <p>-Blöcke umgewandelt.
export function articleHtml(content: unknown): string {
  if (
    content &&
    typeof content === "object" &&
    "html" in content &&
    typeof (content as { html: unknown }).html === "string"
  ) {
    return (content as { html: string }).html;
  }
  return articleParagraphs(content)
    .map((paragraph) => `<p>${paragraph}</p>`)
    .join("");
}

// Optionales Titelbild eines Artikels (im content-JSON hinterlegt).
export function articleImage(content: unknown): string {
  if (
    content &&
    typeof content === "object" &&
    "image" in content &&
    typeof (content as { image: unknown }).image === "string"
  ) {
    return (content as { image: string }).image;
  }
  return "";
}
