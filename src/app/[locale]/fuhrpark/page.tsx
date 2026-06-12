import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/sections/page-hero";
import { StatBar } from "@/components/sections/stat-bar";
import { CtaBanner } from "@/components/sections/cta-banner";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.fleet" });
  return pageMetadata(locale, "/fuhrpark", t("title"), t("description"));
}

export default async function FleetPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("fleetPage");
  const tHome = await getTranslations("home");

  const categories = t.raw("categories") as {
    name: string;
    specs: string;
    text: string;
  }[];

  return (
    <>
      <PageHero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        description={t("hero.description")}
      />
      <StatBar />

      <section className="bg-mist-50 py-16 sm:py-24">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => (
              <Reveal key={category.name} delay={(index % 3) * 0.07}>
                <div className="flex h-full flex-col rounded-3xl border border-mist-200 bg-white p-6 shadow-card sm:p-8">
                  <h2 className="font-display text-xl font-bold text-night-900">
                    {category.name}
                  </h2>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-accent-600">
                    {category.specs}
                  </p>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-mist-500">
                    {category.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-8 text-sm text-mist-500">{t("note")}</p>
        </Container>
      </section>

      <CtaBanner
        title={tHome("contactCta.title")}
        description={tHome("contactCta.description")}
        primaryLabel={tHome("contactCta.primary")}
        secondaryLabel={tHome("contactCta.secondary")}
      />
    </>
  );
}
