import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Check,
  Euro,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Phone
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
import type { Locale } from "@/i18n/routing";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/sections/page-hero";
import { ApplicationForm } from "@/components/forms/application-form";
import { getJobBySlug } from "@/server/content";
import { getGeneralSettings } from "@/server/site-settings";
import { localizedUrl, pageMetadata, SITE_URL } from "@/lib/seo";
import { htmlToPlainText, looksLikeHtml } from "@/lib/richtext";
import { formatSalaryRange } from "@/lib/salary";
import { JsonLdScript, breadcrumbSchema } from "@/lib/schema";
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
    htmlToPlainText(job.translation.description).slice(0, 155)
  );
}

export default async function JobDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const job = await getJobBySlug(locale, slug);
  if (!job) notFound();

  const t = await getTranslations("career");
  const tCommon = await getTranslations("common");
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
  const profile = (job.translation.profile as string[] | null) ?? [];
  const salaryRange = formatSalaryRange(job.salaryMin, job.salaryMax, {
    from: t("jobs.salaryFrom"),
    to: t("jobs.salaryTo")
  });
  const salary = salaryRange ? `${salaryRange} ${job.salaryNote}` : null;

  // URL, Datumswerte und eine vollständige HTML-Beschreibung für Google for
  // Jobs zusammenstellen. Google zeigt das description-Feld an, daher werden
  // Profil, Anforderungen und Benefits mit hineingenommen.
  const jobUrl = localizedUrl(locale, {
    pathname: "/karriere/stelle/[slug]",
    params: { slug }
  });
  const datePosted = job.publishedAt ?? job.createdAt;
  // Ohne Ablaufdatum bleibt die Anzeige 90 Tage gültig (sonst droht Google,
  // sie als abgelaufen zu entfernen).
  const validThrough =
    job.validThrough ??
    new Date(datePosted.getTime() + 90 * 24 * 60 * 60 * 1000);

  const escapeText = (value: string) =>
    value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const listSection = (heading: string, items: string[]) =>
    items.length
      ? `<h3>${escapeText(heading)}</h3><ul>${items
          .map((item) => `<li>${escapeText(item)}</li>`)
          .join("")}</ul>`
      : "";
  const schemaDescription = [
    job.translation.description,
    listSection(t("jobs.profileTitle"), profile),
    listSection(t("jobs.requirementsTitle"), requirements),
    listSection(t("benefitsTitle"), benefits)
  ]
    .filter(Boolean)
    .join("");
  const qualifications = [...profile, ...requirements];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.translation.title,
    description: schemaDescription,
    url: jobUrl,
    datePosted: datePosted.toISOString(),
    validThrough: validThrough.toISOString(),
    employmentType: googleEmploymentType,
    directApply: true,
    identifier: {
      "@type": "PropertyValue",
      name: company.legalName,
      value: job.id
    },
    industry: "Logistik und Transport",
    ...(qualifications.length
      ? { qualifications: qualifications.join(" · ") }
      : {}),
    ...(benefits.length ? { jobBenefits: benefits.join(" · ") } : {}),
    ...(job.licenseCategory
      ? { skills: `Führerscheinklasse ${job.licenseCategory}` }
      : {}),
    hiringOrganization: {
      "@type": "Organization",
      name: company.legalName,
      sameAs: localizedUrl(locale, "/"),
      url: localizedUrl(locale, "/"),
      logo: `${SITE_URL}/logo.png`
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.locationCity,
        ...(job.locationRegion ? { addressRegion: job.locationRegion } : {}),
        ...(job.postalCode ? { postalCode: job.postalCode } : {}),
        addressCountry: job.country === "Deutschland" ? "DE" : job.country
      }
    },
    ...(job.salaryMin || job.salaryMax
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: job.salaryCurrency,
            value: {
              "@type": "QuantitativeValue",
              // Bei Spanne min/max, bei nur einem Wert "ab"/"bis" als Minimum
              // bzw. Maximum abbilden.
              ...(job.salaryMin && job.salaryMax && job.salaryMin !== job.salaryMax
                ? { minValue: job.salaryMin, maxValue: job.salaryMax }
                : job.salaryMin
                  ? { minValue: job.salaryMin }
                  : { maxValue: job.salaryMax }),
              unitText: job.salaryPeriod
            }
          }
        }
      : {})
  };

  const breadcrumb = breadcrumbSchema([
    { name: general.siteName || "LTS Logistik", url: localizedUrl(locale, "/") },
    { name: tCommon("nav.career"), url: localizedUrl(locale, "/karriere") },
    { name: job.translation.title, url: jobUrl }
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JsonLdScript(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JsonLdScript(breadcrumb) }}
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
                  {looksLikeHtml(job.translation.description) ? (
                    <div
                      className="text-base leading-relaxed text-night-800 sm:text-lg [&_a]:text-accent-600 [&_a:hover]:underline [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-night-900 [&_h2:first-child]:mt-0 [&_h3]:mt-6 [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-night-900 [&_li]:ml-1 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_p]:mt-4 [&_p:first-child]:mt-0 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6"
                      dangerouslySetInnerHTML={{
                        __html: job.translation.description
                      }}
                    />
                  ) : (
                    <div className="whitespace-pre-wrap text-base leading-relaxed text-night-800 sm:text-lg">
                      {job.translation.description}
                    </div>
                  )}
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

              {profile.length > 0 ? (
                <Reveal>
                  <div className="rounded-3xl bg-white p-7 shadow-card sm:p-10">
                    <h2 className="font-display text-xl font-bold text-night-900">
                      {t("jobs.profileTitle")}
                    </h2>
                    <ul className="mt-5 space-y-3">
                      {profile.map((item) => (
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

            {/* Direktkontakt, Bewerbungsformular und Firmenangaben.
                Läuft auf dem Desktop mit (sticky), ohne Lücken. */}
            <Reveal delay={0.1} className="lg:col-span-2">
              <div className="space-y-5 lg:sticky lg:top-28">
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

                {/* Firmenlogo und Firmenangaben */}
                <div className="rounded-3xl bg-night-950 p-6 sm:p-7">
                  <Logo name={general.siteName} />
                  <p className="mt-4 font-display text-base font-bold text-white">
                    {company.legalName}
                  </p>
                  <address className="mt-2 space-y-0.5 text-sm not-italic leading-relaxed text-mist-300">
                    <p>{company.address.street}</p>
                    <p>
                      {company.address.zip} {company.address.city}
                    </p>
                    <p>{company.address.district}</p>
                  </address>
                  <div className="mt-4 space-y-2 text-sm">
                    <a
                      href={company.phoneHref}
                      className="flex items-center gap-2 text-mist-300 transition-colors hover:text-white"
                    >
                      <Phone className="h-4 w-4 shrink-0 text-accent-400" />
                      {company.phone}
                    </a>
                    <a
                      href={`mailto:${company.email}`}
                      className="flex items-center gap-2 text-mist-300 transition-colors hover:text-white"
                    >
                      <Mail className="h-4 w-4 shrink-0 text-accent-400" />
                      {company.email}
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  );
}
