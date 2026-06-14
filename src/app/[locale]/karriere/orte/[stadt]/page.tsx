import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/sections/page-hero";
import { JobBoard } from "@/components/career/job-board";
import { getPublishedJobs, getServiceCities } from "@/server/content";
import { buildAlternates, localizedUrl } from "@/lib/seo";
import { JsonLdScript } from "@/lib/schema";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: Locale; stadt: string }> };

async function findCity(stadt: string) {
  const cities = await getServiceCities();
  return cities.find((city) => slugify(city.city) === stadt) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, stadt } = await params;
  const city = await findCity(stadt);
  if (!city) return {};
  const t = await getTranslations({ locale, namespace: "cityLanding" });
  const href = { pathname: "/karriere/orte/[stadt]" as const, params: { stadt } };
  const title = t("title", { city: city.city });
  return {
    title,
    description: t("intro", { city: city.city }).slice(0, 160),
    alternates: buildAlternates(locale, href),
    openGraph: {
      title,
      description: t("intro", { city: city.city }).slice(0, 160),
      url: localizedUrl(locale, href),
      type: "website"
    }
  };
}

export default async function CityLandingPage({ params }: Props) {
  const { locale, stadt } = await params;
  setRequestLocale(locale);
  await connection();

  const city = await findCity(stadt);
  if (!city) notFound();

  const t = await getTranslations({ locale, namespace: "cityLanding" });
  const tCareer = await getTranslations({ locale, namespace: "career" });

  const allCities = await getServiceCities();
  const otherCities = allCities
    .filter((entry) => slugify(entry.city) !== stadt)
    .slice(0, 12);

  const allJobs = await getPublishedJobs(locale);
  const cityJobs = allJobs.filter(
    (job) => slugify(job.locationCity) === stadt
  );
  // Bei fehlenden Stellen direkt vor Ort alle offenen Stellen zeigen.
  const jobs = cityJobs.length > 0 ? cityJobs : allJobs;

  const formatSalary = (min: number | null, max: number | null) => {
    if (min && max && min !== max) {
      return `${min.toLocaleString("de-DE")}-${max.toLocaleString("de-DE")} EUR`;
    }
    if (min || max) return `${(min ?? max)!.toLocaleString("de-DE")} EUR`;
    return "";
  };

  const boardJobs = jobs.map((job) => ({
    id: job.id,
    slug: job.translation.slug,
    title: job.translation.title,
    location: job.locationCity,
    country: job.country,
    system:
      job.workSystem ?? tCareer(`jobs.employmentTypes.${job.employmentType}`),
    salary: formatSalary(job.salaryMin, job.salaryMax),
    salaryNote: job.salaryNote,
    licenseCategory: job.licenseCategory ?? ""
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t("title", { city: city.city }),
    description: t("intro", { city: city.city }),
    url: localizedUrl(locale, {
      pathname: "/karriere/orte/[stadt]",
      params: { stadt }
    })
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JsonLdScript(jsonLd) }}
      />

      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title", { city: city.city })}
        image="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2400&auto=format&fit=crop"
      >
        <p className="mt-4 flex items-center gap-2 text-sm text-mist-300">
          <MapPin className="h-4 w-4 text-accent-400" />
          {city.region ?? city.city}
        </p>
      </PageHero>

      <section className="bg-mist-50 py-16 sm:py-24">
        <Container>
          <p className="mx-auto max-w-3xl text-center text-lg leading-relaxed text-night-700">
            {t("intro", { city: city.city })}
          </p>

          <h2 className="mt-12 font-display text-2xl font-bold text-night-900">
            {t("openJobs", { city: city.city })}
          </h2>
          {cityJobs.length === 0 ? (
            <p className="mt-3 max-w-2xl text-sm text-mist-500">
              {t("noJobs", { city: city.city })}
            </p>
          ) : null}
          <div className="mt-6">
            <JobBoard jobs={boardJobs} />
          </div>

          <div className="mt-8">
            <Link
              href="/karriere"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-600 hover:underline"
            >
              {t("allJobs")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {otherCities.length > 0 ? (
            <div className="mt-12 border-t border-mist-200 pt-8">
              <p className="text-sm font-semibold uppercase tracking-wider text-mist-400">
                {t("eyebrow")}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {otherCities.map((entry) => (
                  <Link
                    key={entry.city}
                    href={{
                      pathname: "/karriere/orte/[stadt]",
                      params: { stadt: slugify(entry.city) }
                    }}
                    className="rounded-full border border-mist-200 bg-white px-3.5 py-1.5 text-sm font-medium text-night-700 transition-colors hover:border-accent-500 hover:text-accent-600"
                  >
                    {entry.city}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </Container>
      </section>

      <section className="bg-night-950 py-16 sm:py-20">
        <Container className="text-center">
          <h2 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
            {t("ctaTitle", { city: city.city })}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-mist-300">
            {t("ctaText", { city: city.city })}
          </p>
          <Reveal className="mt-7">
            <Button asChild size="lg">
              <Link href="/karriere">{t("ctaButton")}</Link>
            </Button>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
