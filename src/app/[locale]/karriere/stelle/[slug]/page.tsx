import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Check, Euro, MapPin, Clock } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/sections/page-hero";
import { ApplicationForm } from "@/components/forms/application-form";
import { getJobBySlug } from "@/server/content";
import { localizedUrl, pageMetadata } from "@/lib/seo";
import { JsonLdScript } from "@/lib/schema";
import { company } from "@/data/company";
import type { jobCategoryKeys } from "@/lib/forms";

export const revalidate = 120;

export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const job = await getJobBySlug(locale, slug);
  if (!job) return {};
  return pageMetadata(
    locale,
    { pathname: "/karriere/stelle/[slug]", params: { slug } },
    `${job.translation.title} in ${job.locationCity}`,
    job.translation.description.slice(0, 155)
  );
}

export default async function JobDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const job = await getJobBySlug(locale, slug);
  if (!job) notFound();

  const t = await getTranslations("career");
  const employmentLabel = t(`jobs.employmentTypes.${job.employmentType}`);
  const requirements = (job.translation.requirements as string[]) ?? [];
  const benefits = (job.translation.benefits as string[]) ?? [];
  const salary =
    job.salaryMin || job.salaryMax
      ? `${
          job.salaryMin && job.salaryMax && job.salaryMin !== job.salaryMax
            ? `${job.salaryMin.toLocaleString("de-DE")}-${job.salaryMax.toLocaleString("de-DE")}`
            : ((job.salaryMin ?? job.salaryMax) as number).toLocaleString("de-DE")
        } EUR ${job.salaryNote}`
      : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.translation.title,
    description: job.translation.description,
    datePosted: job.publishedAt?.toISOString(),
    validThrough: job.validThrough?.toISOString(),
    employmentType: job.employmentType,
    hiringOrganization: {
      "@type": "Organization",
      name: company.legalName,
      sameAs: localizedUrl(locale, "/")
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.locationCity,
        addressCountry: "DE"
      }
    },
    ...(job.salaryMin
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: "EUR",
            value: {
              "@type": "QuantitativeValue",
              minValue: job.salaryMin,
              maxValue: job.salaryMax ?? job.salaryMin,
              unitText: "MONTH"
            }
          }
        }
      : {})
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JsonLdScript(jsonLd) }}
      />

      <PageHero eyebrow={t("hero.eyebrow")} title={job.translation.title}>
        <div className="mt-6 flex flex-wrap gap-3 text-sm text-mist-300">
          {job.licenseCategory ? (
            <span className="flex items-center gap-1.5 rounded-full bg-accent-500 px-3.5 py-1.5 font-bold text-white">
              {t("board.categoryPrefix")} {job.licenseCategory}
            </span>
          ) : null}
          <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5">
            <MapPin className="h-4 w-4 text-accent-400" />
            {job.locationCity}, {job.country}
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5">
            <Clock className="h-4 w-4 text-accent-400" />
            {job.workSystem ?? employmentLabel}
          </span>
          {salary ? (
            <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5">
              <Euro className="h-4 w-4 text-accent-400" />
              {salary}
            </span>
          ) : null}
        </div>
      </PageHero>

      <section className="bg-mist-50 py-16 sm:py-24">
        <Container>
          <div className="grid items-start gap-8 lg:grid-cols-2">
            <div className="space-y-10">
              <Reveal>
                <div className="whitespace-pre-wrap text-base leading-relaxed text-night-800">
                  {job.translation.description}
                </div>
              </Reveal>

              {requirements.length > 0 ? (
                <Reveal>
                  <div>
                    <h2 className="font-display text-xl font-bold text-night-900">
                      {t("jobs.requirementsTitle")}
                    </h2>
                    <ul className="mt-4 space-y-2.5">
                      {requirements.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-base text-night-800">
                          <Check className="mt-1 h-4 w-4 shrink-0 text-accent-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ) : null}

              {benefits.length > 0 ? (
                <Reveal>
                  <div>
                    <h2 className="font-display text-xl font-bold text-night-900">
                      {t("benefitsTitle")}
                    </h2>
                    <ul className="mt-4 space-y-2.5">
                      {benefits.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-base text-night-800">
                          <Check className="mt-1 h-4 w-4 shrink-0 text-mint-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ) : null}
            </div>

            <Reveal delay={0.1}>
              <div className="rounded-3xl bg-white p-6 shadow-card sm:p-10">
                <h2 className="mb-6 font-display text-2xl font-bold text-night-900">
                  {t("apply.title")}
                </h2>
                <ApplicationForm
                  presetCategory={
                    job.category.key as (typeof jobCategoryKeys)[number]
                  }
                />
              </div>
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  );
}
