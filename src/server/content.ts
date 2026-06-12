import { prisma } from "@/server/db";
import { safeQuery } from "@/server/safe";

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
