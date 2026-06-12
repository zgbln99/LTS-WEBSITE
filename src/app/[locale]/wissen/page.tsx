import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BookOpen, Newspaper, Scale, Snowflake, type LucideIcon } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { PageHero } from "@/components/sections/page-hero";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.knowledge" });
  return pageMetadata(locale, "/wissen", t("title"), t("description"));
}

const categoryIcons: LucideIcon[] = [Snowflake, Scale, BookOpen, Newspaper];

export default async function KnowledgePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("knowledge");
  const categories = t.raw("categories") as { name: string; text: string }[];

  return (
    <>
      <PageHero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        description={t("hero.description")}
      />
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
          <p className="mt-10 max-w-2xl text-sm leading-relaxed text-mist-500">
            {t("comingSoon")}
          </p>
        </Container>
      </section>
    </>
  );
}
