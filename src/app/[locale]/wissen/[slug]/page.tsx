import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/sections/page-hero";
import { articleParagraphs, getArticleBySlug } from "@/server/content";
import { localizedUrl, pageMetadata } from "@/lib/seo";
import { JsonLdScript } from "@/lib/schema";
import { company } from "@/data/company";

export const revalidate = 120;

export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getArticleBySlug(locale, slug);
  if (!article) return {};
  return pageMetadata(
    locale,
    { pathname: "/wissen/[slug]", params: { slug } },
    article.translation.seoTitle ?? article.translation.title,
    article.translation.seoDescription ?? article.translation.excerpt
  );
}

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const article = await getArticleBySlug(locale, slug);
  if (!article) notFound();

  const t = await getTranslations("knowledge");
  const paragraphs = articleParagraphs(article.translation.content);
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "long" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.translation.title,
    description: article.translation.excerpt,
    datePublished: article.publishedAt?.toISOString(),
    inLanguage: locale,
    mainEntityOfPage: localizedUrl(locale, {
      pathname: "/wissen/[slug]",
      params: { slug }
    }),
    author: {
      "@type": "Organization",
      name: article.author?.name ?? company.legalName
    },
    publisher: { "@type": "Organization", name: company.legalName }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JsonLdScript(jsonLd) }}
      />

      <PageHero
        eyebrow={t("hero.eyebrow")}
        title={article.translation.title}
        description={article.translation.excerpt}
      >
        <p className="mt-6 text-sm text-mist-400">
          {article.publishedAt
            ? dateFormatter.format(article.publishedAt)
            : ""}
          {article.translation.readingTimeMin
            ? ` · ${t("minRead", { min: article.translation.readingTimeMin })}`
            : ""}
        </p>
      </PageHero>

      <section className="bg-mist-50 py-16 sm:py-24">
        <Container className="max-w-3xl">
          <article className="space-y-6">
            {paragraphs.map((paragraph) => (
              <p
                key={paragraph.slice(0, 40)}
                className="text-base leading-relaxed text-night-800 sm:text-lg"
              >
                {paragraph}
              </p>
            ))}
          </article>
          <Link
            href="/wissen"
            className="mt-12 inline-flex items-center gap-2 text-sm font-semibold text-accent-600 hover:text-accent-500"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("backToList")}
          </Link>
        </Container>
      </section>
    </>
  );
}
