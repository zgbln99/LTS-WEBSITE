import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Check, Euro, MapPin, Clock, MessageCircle, Phone } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/sections/page-hero";
import { ApplicationForm } from "@/components/forms/application-form";
import { getJobBySlug } from "@/server/content";
import { getGeneralSettings } from "@/server/site-settings";
import { localizedUrl, pageMetadata, SITE_URL } from "@/lib/seo";
import { JsonLdScript } from "@/lib/schema";
import { company } from "@/data/company";
import type { jobCategoryKeys } from "@/lib/forms";

export const dynamic = "force-dynamic";

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
  const general = await getGeneralSettings();
  const employmentLabel = t(`jobs.employmentTypes.${job.employmentType}`);

  // Direktkontakt für Fahrer (WhatsApp / Anruf zur Fuhrparkleitung)
  const waNumber = general.recruitingWhatsapp.replace(/[^\d]/g, "");
  const waHref = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(
        t("directContact.presetMessage") + job.translation.title
      )}`
    : null;
  const callNumber = general.recruitingPhone.replace(/[^\d+]/g, "");
  const callHref = callNumber ? `tel:${callNumber}` : null;

  // Employment-Type auf von Google akzeptierte Werte abbilden
  const googleEmploymentType =
    {
      FULL_TIME: "FULL_TIME",
      PART_TIME: "PART_TIME",
      MINI_JOB: "PART_TIME",
      APPRENTICESHIP: "OTHER"
    }[job.employmentType] ?? "FULL_TIME";
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
    employmentType: googleEmploymentType,
    directApply: true,
    identifier: {
      "@type": "PropertyValue",
      name: company.legalName,
      value: job.id
    },
    industry: "Logistik und Transport",
    hiringOrganization: {
      "@type": "Organization",
      name: company.legalName,
      sameAs: localizedUrl(locale, "/"),
      logo: `${SITE_URL}/logo.png`
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.locationCity,
        ...(job.locationRegion ? { addressRegion: job.locationRegion } : {}),
        addressCountry: "DE"
      }
    },
    ...(job.salaryMin
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: job.salaryCurrency,
            value: {
              "@type": "QuantitativeValue",
              minValue: job.salaryMin,
              maxValue: job.salaryMax ?? job.salaryMin,
              unitText: job.salaryPeriod
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

      <PageHero
        eyebrow={t("hero.eyebrow")}
        title={job.translation.title}
        image="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2400&auto=format&fit=crop"
      >
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
          {/* Verdienst-Banner */}
          {salary ? (
            <Reveal>
              <div className="mb-8 flex flex-col gap-5 rounded-3xl bg-gradient-to-br from-accent-500 to-accent-600 p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9">
                <div className="flex items-center gap-5">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20">
                    <Euro className="h-7 w-7 text-white" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-white/80">
                      {t("board.colSalary")}
                    </p>
                    <p className="font-display text-3xl font-extrabold text-white sm:text-4xl">
                      {salary}
                    </p>
                  </div>
                </div>
                <a
                  href="#bewerbung"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-white px-7 text-sm font-semibold text-night-900 shadow-card transition-transform hover:scale-[1.02]"
                >
                  {t("apply.title")}
                </a>
              </div>
            </Reveal>
          ) : null}

          <div className="grid items-start gap-6 lg:grid-cols-5">
            {/* Beschreibung, Anforderungen, Benefits */}
            <div className="space-y-6 lg:col-span-3">
              <Reveal>
                <div className="rounded-3xl bg-white p-7 shadow-card sm:p-10">
                  <div className="whitespace-pre-wrap text-base leading-relaxed text-night-800 sm:text-lg">
                    {job.translation.description}
                  </div>
                </div>
              </Reveal>

              {requirements.length > 0 ? (
                <Reveal>
                  <div className="rounded-3xl bg-white p-7 shadow-card sm:p-10">
                    <h2 className="font-display text-xl font-bold text-night-900">
                      {t("jobs.requirementsTitle")}
                    </h2>
                    <ul className="mt-5 space-y-3">
                      {requirements.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-base text-night-800">
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-500/10">
                            <Check className="h-3.5 w-3.5 text-accent-600" />
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ) : null}

              {benefits.length > 0 ? (
                <Reveal>
                  <div className="rounded-3xl bg-night-950 p-7 sm:p-10">
                    <h2 className="font-display text-xl font-bold text-white">
                      {t("benefitsTitle")}
                    </h2>
                    <ul className="mt-5 space-y-3">
                      {benefits.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-base text-mist-200">
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mint-400/15">
                            <Check className="h-3.5 w-3.5 text-mint-400" />
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ) : null}
            </div>

            {/* Direktkontakt und Bewerbungsformular, auf Desktop mitlaufend */}
            <Reveal delay={0.1} className="lg:col-span-2">
              <div className="lg:sticky lg:top-28 lg:space-y-5">
                {waHref || callHref ? (
                  <div className="rounded-3xl bg-night-950 p-6 sm:p-7">
                    <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-400">
                      {t("directContact.eyebrow")}
                    </span>
                    <h2 className="mt-3 font-display text-xl font-bold text-white">
                      {t("directContact.title")}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-mist-300">
                      {t("directContact.text")}
                    </p>
                    <div className="mt-5 space-y-2.5">
                      {waHref ? (
                        <a
                          href={waHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 text-sm font-semibold text-night-950 transition-transform hover:scale-[1.02]"
                        >
                          <MessageCircle className="h-4 w-4" />
                          {t("directContact.whatsapp")}
                        </a>
                      ) : null}
                      {callHref ? (
                        <a
                          href={callHref}
                          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-night-900 transition-transform hover:scale-[1.02]"
                        >
                          <Phone className="h-4 w-4" />
                          {t("directContact.call")}
                          {general.recruitingPhone ? (
                            <span className="text-mist-500">
                              · {general.recruitingPhone}
                            </span>
                          ) : null}
                        </a>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                <div
                  id="bewerbung"
                  className="rounded-3xl bg-white p-6 shadow-card sm:p-8"
                >
                  <h2 className="mb-6 font-display text-2xl font-bold text-night-900">
                    {t("apply.title")}
                  </h2>
                  <ApplicationForm
                    presetCategory={
                      job.category.key as (typeof jobCategoryKeys)[number]
                    }
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  );
}
