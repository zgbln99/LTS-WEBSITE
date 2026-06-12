import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, MapPin, Quote } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { HomeHero } from "@/components/sections/home-hero";
import { StatBar } from "@/components/sections/stat-bar";
import { ServicesGrid } from "@/components/sections/services-grid";
import { CtaBanner } from "@/components/sections/cta-banner";
import { EuropeMap } from "@/components/sections/europe-map";
import { pageMetadata } from "@/lib/seo";
import { company } from "@/data/company";
import { cn } from "@/lib/utils";
import { getPublishedTestimonials, getServiceCities } from "@/server/content";

export const revalidate = 300;

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.home" });
  return pageMetadata(locale, "/", t("title"), t("description"));
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const tCommon = await getTranslations("common");
  const tFleet = await getTranslations("fleetPage");

  const hasMap = Boolean(process.env.NEXT_PUBLIC_MAPBOX_TOKEN);

  // Einsatzorte aus dem Admin-Panel (Fallback: statische Liste)
  const cities = await getServiceCities();
  const mapMarkers = [
    ...cities.map((city) => ({ city: city.city, lngLat: city.lngLat })),
    { city: "Nuthe-Urstromtal (Zentrale)", lngLat: company.hqLngLat, hq: true }
  ];

  // Testimonials aus der Datenbank, mit Fallback auf die Beispieltexte
  const dbTestimonials = await getPublishedTestimonials(locale);
  const testimonials =
    dbTestimonials.length > 0
      ? dbTestimonials.map((entry) => ({
          quote: entry.quote,
          name: entry.authorName,
          role: [entry.authorRole, entry.authorCompany]
            .filter(Boolean)
            .join(", ")
        }))
      : (t.raw("testimonials.items") as {
          quote: string;
          name: string;
          role: string;
        }[]);
  const fleetCategories = (
    tFleet.raw("categories") as { name: string; specs: string; text: string }[]
  ).slice(0, 4);

  return (
    <>
      <HomeHero />
      <StatBar />

      {/* Leistungen */}
      <section className="bg-mist-50 py-16 sm:py-24">
        <Container>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow={t("services.eyebrow")}
              title={t("services.title")}
              description={t("services.description")}
            />
            <Button asChild variant="outline" className="shrink-0">
              <Link href="/leistungen">{tCommon("cta.allServices")}</Link>
            </Button>
          </div>
          <div className="mt-10">
            <ServicesGrid
              locale={locale}
              limit={4}
              ctaLabel={tCommon("cta.learnMore")}
            />
          </div>
        </Container>
      </section>

      {/* Einsatzgebiet: vollflächige Karte mit schwebenden Karten */}
      <section className="bg-night-950 py-16 sm:py-24">
        <Container>
          {hasMap ? (
            <>
              {/* Mobil: Überschrift über der Karte */}
              <div className="mb-6 lg:hidden">
                <SectionHeading
                  dark
                  eyebrow={t("coverage.eyebrow")}
                  title={t("coverage.title")}
                  description={t("coverage.description")}
                />
              </div>

              <div className="relative overflow-hidden rounded-[2rem] border border-white/10">
                <EuropeMap
                  markers={mapMarkers}
                  className="h-[26rem] rounded-none sm:h-[34rem] lg:h-[40rem]"
                />

                {/* Schwebende Titel-Karte (Desktop) */}
                <div className="pointer-events-none absolute left-6 top-6 hidden max-w-xl lg:block">
                  <div className="pointer-events-auto rounded-3xl glass border border-white/10 p-7">
                    <span className="inline-flex items-center rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent-400">
                      {t("coverage.eyebrow")}
                    </span>
                    <h2 className="mt-3 font-display text-3xl font-extrabold text-white">
                      {t("coverage.title")}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-mist-300">
                      {t("coverage.description")}
                    </p>
                  </div>
                </div>

                {/* Schwebende Einsatzorte-Karte (Desktop) */}
                <div className="pointer-events-none absolute bottom-6 left-6 right-6 hidden lg:block">
                  <div className="pointer-events-auto inline-block max-w-3xl rounded-3xl glass border border-white/10 p-5">
                    <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-mist-400">
                      {t("coverage.locationsTitle")}
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {cities.map((location) => (
                        <span
                          key={location.city}
                          className="flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-sm text-white"
                        >
                          <MapPin className="h-3.5 w-3.5 text-accent-400" />
                          {location.city}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobil: Einsatzorte unter der Karte */}
              <div className="mt-5 rounded-3xl bg-night-900 p-5 lg:hidden">
                <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-mist-400">
                  {t("coverage.locationsTitle")}
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {cities.map((location) => (
                    <span
                      key={location.city}
                      className="flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-sm text-white"
                    >
                      <MapPin className="h-3.5 w-3.5 text-accent-400" />
                      {location.city}
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <SectionHeading
                dark
                eyebrow={t("coverage.eyebrow")}
                title={t("coverage.title")}
                description={t("coverage.description")}
              />
              <Reveal>
                <div className="mt-10 rounded-3xl bg-night-900 p-6 sm:p-8">
                  <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-mist-400">
                    {t("coverage.locationsTitle")}
                  </h3>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {cities.map((location) => (
                      <span
                        key={location.city}
                        className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm text-white"
                      >
                        <MapPin className="h-4 w-4 text-accent-400" />
                        {location.city}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            </>
          )}
        </Container>
      </section>

      {/* Fuhrpark Teaser */}
      <section className="bg-mist-50 py-16 sm:py-24">
        <Container>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow={t("fleet.eyebrow")}
              title={t("fleet.title")}
              description={t("fleet.description")}
            />
            <Button asChild variant="outline" className="shrink-0">
              <Link href="/fuhrpark">{t("fleet.cta")}</Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {fleetCategories.map((category, index) => (
              <Reveal key={category.name} delay={index * 0.08}>
                <div className="h-full rounded-3xl border border-mist-200 bg-white p-6 shadow-card">
                  <h3 className="font-display text-lg font-bold text-night-900">
                    {category.name}
                  </h3>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-accent-600">
                    {category.specs}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-mist-500">
                    {category.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Referenzen */}
      <section className="bg-white py-16 sm:py-24">
        <Container>
          <SectionHeading
            align="center"
            eyebrow={t("testimonials.eyebrow")}
            title={t("testimonials.title")}
          />
          <div className="mt-12 grid items-start gap-4 lg:grid-cols-3">
            {testimonials.map((item, index) => {
              const featured = index % 3 === 1;
              return (
                <Reveal key={`${item.name}-${index}`} delay={index * 0.08}>
                  <figure
                    className={cn(
                      "flex h-full flex-col rounded-3xl p-6 sm:p-8",
                      featured
                        ? "bg-night-950 shadow-card-hover lg:-mt-4 lg:mb-4"
                        : "border border-mist-200 bg-mist-50"
                    )}
                  >
                    <Quote
                      className={cn(
                        "h-7 w-7",
                        featured ? "text-accent-400" : "text-accent-500"
                      )}
                      aria-hidden
                    />
                    <blockquote
                      className={cn(
                        "mt-4 flex-1 text-base leading-relaxed",
                        featured ? "text-mist-200" : "text-night-800"
                      )}
                    >
                      {item.quote}
                    </blockquote>
                    <figcaption className="mt-6">
                      <div
                        className={cn(
                          "font-display text-sm font-bold",
                          featured ? "text-white" : "text-night-900"
                        )}
                      >
                        {item.name}
                      </div>
                      <div
                        className={cn(
                          "text-sm",
                          featured ? "text-mist-400" : "text-mist-500"
                        )}
                      >
                        {item.role}
                      </div>
                    </figcaption>
                  </figure>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Karriere */}
      <section className="bg-white pb-16 sm:pb-24">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-night-900 to-night-800 px-6 py-14 sm:px-12 sm:py-16 lg:px-20">
              <div
                className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-mint-400/10 blur-3xl"
                aria-hidden
              />
              <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-xl">
                  <span className="inline-flex items-center rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-mint-400">
                    {t("career.eyebrow")}
                  </span>
                  <h2 className="mt-4 font-display text-3xl font-extrabold text-white sm:text-4xl">
                    {t("career.title")}
                  </h2>
                  <p className="mt-3 text-base leading-relaxed text-mist-300">
                    {t("career.description")}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-3">
                  <Button asChild size="lg" variant="light">
                    <Link href="/karriere">
                      {t("career.cta")}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline-light">
                    <Link href="/karriere/lkw-fahrer">
                      {t("career.driverCta")}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      <CtaBanner
        title={t("contactCta.title")}
        description={t("contactCta.description")}
        primaryLabel={t("contactCta.primary")}
        secondaryLabel={t("contactCta.secondary")}
      />
    </>
  );
}
