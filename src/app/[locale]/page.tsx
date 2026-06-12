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

  const countries = t.raw("coverage.countries") as string[];

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

      {/* Europakarte / Abdeckung */}
      <section className="bg-night-950 py-16 sm:py-24">
        <Container>
          <SectionHeading
            dark
            eyebrow={t("coverage.eyebrow")}
            title={t("coverage.title")}
            description={t("coverage.description")}
          />
          <div className="mt-10">
            <EuropeMap markers={mapMarkers} />
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-3xl bg-night-900 p-6 sm:p-8">
                <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-mist-400">
                  {t("coverage.locationsTitle")}
                </h3>
                <ul className="mt-5 grid grid-cols-2 gap-3">
                  {cities.map((location) => (
                    <li
                      key={location.city}
                      className="flex items-center gap-2 text-sm text-mist-200"
                    >
                      <MapPin className="h-4 w-4 shrink-0 text-accent-400" />
                      {location.city}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="h-full rounded-3xl bg-night-900 p-6 sm:p-8">
                <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-mist-400">
                  {t("coverage.countriesTitle")}
                </h3>
                <div className="mt-5 flex flex-wrap gap-2">
                  {countries.map((country) => (
                    <span
                      key={country}
                      className="rounded-full border border-white/15 px-4 py-2 text-sm text-mist-200"
                    >
                      {country}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
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
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {testimonials.map((item, index) => (
              <Reveal key={`${item.name}-${index}`} delay={index * 0.08}>
                <figure className="flex h-full flex-col rounded-3xl bg-mist-50 p-6 sm:p-8">
                  <Quote className="h-7 w-7 text-accent-500" aria-hidden />
                  <blockquote className="mt-4 flex-1 text-base leading-relaxed text-night-800">
                    {item.quote}
                  </blockquote>
                  <figcaption className="mt-6">
                    <div className="font-display text-sm font-bold text-night-900">
                      {item.name}
                    </div>
                    <div className="text-sm text-mist-500">{item.role}</div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
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
