import type { Metadata } from "next";
import { getPublishedPageData } from "@/server/builder";
import { BuilderPage } from "@/builder/builder-page";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/sections/page-hero";
import { StatBar } from "@/components/sections/stat-bar";
import { CtaBanner } from "@/components/sections/cta-banner";
import { seoMetadata } from "@/server/seo";
import { cn } from "@/lib/utils";

// Bilder je Fahrzeugkategorie (Reihenfolge wie in messages fleetPage.categories)
const categoryImages = [
  "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1591768793355-74d04bb6608f?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=1600&auto=format&fit=crop"
];

export const revalidate = 300;

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.fleet" });
  return seoMetadata("fuhrpark", locale, "/fuhrpark", t("title"), t("description"));
}

export default async function FleetPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Im Seiten-Editor veröffentlichte Version hat Vorrang vor dem Code-Layout
  const builderData = await getPublishedPageData("fuhrpark", locale);
  if (builderData) {
    return <BuilderPage data={builderData} locale={locale} />;
  }

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
        image="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2400&auto=format&fit=crop"
      />
      <StatBar />

      <section className="bg-mist-50 py-16 sm:py-24">
        <Container>
          {/* 2+3-Raster ohne Lücken: erste zwei Karten breit, drei darunter */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {categories.map((category, index) => (
              <Reveal
                key={category.name}
                delay={(index % 3) * 0.07}
                className={cn(
                  index < 2 ? "lg:col-span-3" : "lg:col-span-2",
                  index === 4 && "sm:col-span-2 lg:col-span-2"
                )}
              >
                <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-mist-200 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
                  <div className={cn("relative overflow-hidden", index < 2 ? "h-56" : "h-44")}>
                    <Image
                      src={categoryImages[index % categoryImages.length]}
                      alt={category.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-night-950/60 to-transparent" />
                    <h2 className="absolute bottom-4 left-5 font-display text-xl font-bold text-white sm:text-2xl">
                      {category.name}
                    </h2>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-xs font-semibold uppercase tracking-wide text-accent-600">
                      {category.specs}
                    </p>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-mist-500">
                      {category.text}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
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
