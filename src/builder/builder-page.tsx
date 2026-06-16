import type { Data } from "@measured/puck";
import { getTranslations } from "next-intl/server";
import { BuilderRenderer } from "@/builder/renderer";
import { company } from "@/data/company";
import {
  getPublishedArticles,
  getPublishedJobs,
  getPublishedTestimonials,
  getServiceCities
} from "@/server/content";
import { getPathname } from "@/i18n/navigation";
import { formatSalaryRange } from "@/lib/salary";
import type { Locale } from "@/i18n/routing";

// Serverseitiger Wrapper: lädt die dynamischen Daten (Stellen, Einsatzorte,
// Referenzen) und rendert eine im Page-Builder erstellte Seite.
export async function BuilderPage({
  data,
  locale
}: {
  data: Data;
  locale: string;
}) {
  const t = await getTranslations("career");
  const [jobs, cities, testimonials, publishedArticles] = await Promise.all([
    getPublishedJobs(locale),
    getServiceCities(),
    getPublishedTestimonials(locale),
    getPublishedArticles(locale)
  ]);

  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "long" });
  const articles = publishedArticles.map((article) => ({
    href: getPathname({
      locale: locale as Locale,
      href: {
        pathname: "/wissen/[slug]",
        params: { slug: article.translation.slug }
      }
    }),
    title: article.translation.title,
    excerpt: article.translation.excerpt,
    meta: article.publishedAt ? dateFormatter.format(article.publishedAt) : ""
  }));

  const boardJobs = jobs.map((job) => ({
    id: job.id,
    slug: job.translation.slug,
    title: job.translation.title,
    location: job.locationCity,
    country: job.country,
    system: job.workSystem ?? t(`jobs.employmentTypes.${job.employmentType}`),
    salary: formatSalaryRange(job.salaryMin, job.salaryMax, {
      from: t("jobs.salaryFrom"),
      to: t("jobs.salaryTo")
    }),
    salaryNote: job.salaryNote,
    licenseCategory: job.licenseCategory ?? ""
  }));

  const markers = [
    ...cities.map((city) => ({ city: city.city, lngLat: city.lngLat })),
    { city: "Nuthe-Urstromtal (Zentrale)", lngLat: company.hqLngLat, hq: true }
  ];

  const quotes = testimonials.map((entry) => ({
    quote: entry.quote,
    name: entry.authorName,
    role: [entry.authorRole, entry.authorCompany].filter(Boolean).join(", ")
  }));

  return (
    <BuilderRenderer
      data={data}
      dynamic={{
        locale,
        isEditor: false,
        jobs: boardJobs,
        cities: markers,
        testimonials: quotes,
        articles
      }}
    />
  );
}
