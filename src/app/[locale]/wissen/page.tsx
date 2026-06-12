import type { Metadata } from "next";
import { connection } from "next/server";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BookOpen, Newspaper, Scale, Snowflake, type LucideIcon } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { PageHero } from "@/components/sections/page-hero";
import { pageMetadata } from "@/lib/seo";
import { getPublishedArticles } from "@/server/content";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.knowledge" });
  return pageMetadata(locale, "/wissen", t("title"), t("description"));
}

const categoryIcons: LucideIcon[] = [Snowflake, Scale, BookOpen, Newspaper];

export default async function KnowledgePage({ params }: Props) {
  await connection();
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("knowledge");
  const categories = t.raw("categories") as { name: string; text: string }[];
  const articles = await getPublishedArticles(locale);

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "long"
  });

  return (
    <>
      <PageHero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        description={t("hero.description")}
        image="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2400&auto=format&fit=crop"
      />

      {/* Artikel aus der Datenbank */}
      {articles.length > 0 ? (
        <section className="bg-white py-16 sm:py-24">
          <Container>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article, index) => (
                <Reveal key={article.id} delay={(index % 3) * 0.07}>
                  <Link
                    href={{
                      pathname: "/wissen/[slug]",
                      params: { slug: article.translation.slug }
                    }}
                    className="group flex h-full flex-col rounded-3xl border border-mist-200 bg-mist-50 p-6 transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-card sm:p-8"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-mist-400">
                      {article.publishedAt
                        ? dateFormatter.format(article.publishedAt)
                        : ""}
                      {article.translation.readingTimeMin
                        ? ` · ${t("minRead", { min: article.translation.readingTimeMin })}`
                        : ""}
                    </p>
                    <h2 className="mt-3 font-display text-lg font-bold text-night-900">
                      {article.translation.title}
                    </h2>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-mist-500">
                      {article.translation.excerpt}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-600">
                      {t("readMore")}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      <section className="bg-mist-50 py-16 sm:py-24">
        <Container>
          <SectionHeading title={t("categoriesTitle")} />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category, index) => {
              const Icon = categoryIcons[index % categoryIcons.length];
              return (
                <Reveal key={category.name} delay={(index % 4) * 0.07}>
                  <div className="h-full rounded-3xl bg-white p-6 shadow-card">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500/10 text-accent-600">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 font-display text-lg font-bold text-night-900">
                      {category.name}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-mist-500">
                      {category.text}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
          {articles.length === 0 ? (
            <p className="mt-10 max-w-2xl text-sm leading-relaxed text-mist-500">
              {t("comingSoon")}
            </p>
          ) : null}
        </Container>
      </section>
    </>
  );
}
