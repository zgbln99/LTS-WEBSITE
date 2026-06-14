import type { Metadata } from "next";
import { getPublishedPageData } from "@/server/builder";
import { BuilderPage } from "@/builder/builder-page";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/sections/page-hero";
import { ServicesGrid } from "@/components/sections/services-grid";
import { CtaBanner } from "@/components/sections/cta-banner";
import { seoMetadata } from "@/server/seo";

export const revalidate = 300;

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.services" });
  return seoMetadata("leistungen", locale, "/leistungen", t("title"), t("description"));
}

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const builderData = await getPublishedPageData("leistungen", locale);
  if (builderData) {
    return <BuilderPage data={builderData} locale={locale} />;
  }

  const t = await getTranslations("servicesPage");
  const tCommon = await getTranslations("common");

  return (
    <>
      <PageHero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        description={t("hero.description")}
        image="https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=2400&auto=format&fit=crop"
      />
      <section className="bg-mist-50 py-16 sm:py-24">
        <Container>
          <ServicesGrid locale={locale} ctaLabel={tCommon("cta.learnMore")} />
        </Container>
      </section>
      <CtaBanner
        primaryHref="/kontakt"
        title={t("cta.title")}
        description={t("cta.description")}
        primaryLabel={t("cta.primary")}
        secondaryLabel={t("cta.secondary")}
      />
    </>
  );
}
