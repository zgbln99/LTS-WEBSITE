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
import type { Locale } from "@/i18n/routing";

function formatSalary(min: number | null, max: number | null) {
  if (min && max && min !== max) {
    return `${min.toLocaleString("de-DE")}-${max.toLocaleString("de-DE")} EUR`;
  }
  if (min || max) return `${(min ?? max)!.toLocaleString("de-DE")} EUR`;
  return "";
}

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
    salary: formatSalary(job.salaryMin, job.salaryMax),
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
