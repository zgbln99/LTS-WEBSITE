import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/sections/page-hero";
import { articleHtml, articleImage, getArticleBySlug } from "@/server/content";
import { localizedUrl, pageMetadata } from "@/lib/seo";
import { JsonLdScript } from "@/lib/schema";
import { company } from "@/data/company";

export const dynamic = "force-dynamic";

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
  const html = articleHtml(article.translation.content);
  const coverImage = articleImage(article.translation.content);
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
          {coverImage ? (
            <div className="mb-10 overflow-hidden rounded-3xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverImage}
                alt={article.translation.title}
                className="w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          ) : null}
          <article
            className="space-y-5 text-base leading-relaxed text-night-800 sm:text-lg [&_a]:text-accent-600 [&_a:hover]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-accent-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-night-900 [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-night-900 [&_li]:ml-1 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6"
            dangerouslySetInnerHTML={{ __html: html }}
          />
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
