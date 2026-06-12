import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireRole } from "@/auth";
import { PageEditor } from "@/components/admin/page-editor";
import {
  BUILDER_PAGES,
  generateDefaultData,
  isBuilderPageKey
} from "@/builder/defaults";
import { getEditorPageData } from "@/server/builder";
import {
  getPublishedArticles,
  getPublishedJobs,
  getPublishedTestimonials,
  getServiceCities
} from "@/server/content";
import { getPathname } from "@/i18n/navigation";
import { getServices } from "@/data/services";
import { locales, type Locale } from "@/i18n/routing";
import { company } from "@/data/company";

export const dynamic = "force-dynamic";

export const metadata = { title: "Seiten-Editor" };

function formatSalary(min: number | null, max: number | null) {
  if (min && max && min !== max) {
    return `${min.toLocaleString("de-DE")}-${max.toLocaleString("de-DE")} EUR`;
  }
  if (min || max) return `${(min ?? max)!.toLocaleString("de-DE")} EUR`;
  return "";
}

export default async function PageEditorPage({
  params,
  searchParams
}: {
  params: Promise<{ key: string }>;
  searchParams: Promise<{ sprache?: string }>;
}) {
  const session = await requireRole(["SUPER_ADMIN", "MARKETING", "EDITOR"]);
  if (!session) redirect("/admin/login");

  const { key } = await params;
  if (!isBuilderPageKey(key)) notFound();

  const { sprache } = await searchParams;
  const locale = (
    locales.includes(sprache as never) ? sprache : "de"
  ) as Locale;

  const messages = (await import(`../../../../../messages/${locale}.json`))
    .default;

  // Entwurf > veröffentlichte Version > generiertes Standard-Layout
  const { data: stored } = await getEditorPageData(key, locale);
  const initialData = stored ?? generateDefaultData(key, locale, messages);

  // Echte Daten für die Vorschau dynamischer Blöcke
  const t = await getTranslations({ locale, namespace: "career" });
  const [jobs, cities, testimonials, publishedArticles] = await Promise.all([
    getPublishedJobs(locale),
    getServiceCities(),
    getPublishedTestimonials(locale),
    getPublishedArticles(locale)
  ]);
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "long" });
  const articles = publishedArticles.map((article) => ({
    href: getPathname({
      locale,
      href: {
        pathname: "/wissen/[slug]",
        params: { slug: article.translation.slug }
      } as never
    }),
    title: article.translation.title,
    excerpt: article.translation.excerpt,
    meta: article.publishedAt ? dateFormatter.format(article.publishedAt) : ""
  }));

  // Linkziele für das Link-Feld
  const pageLinks = Object.values(BUILDER_PAGES).map((page) => ({
    label: page.label,
    href: getPathname({ locale, href: page.route as never })
  }));
  const serviceLinks = getServices(locale).map((service) => ({
    label: `Leistung: ${service.name}`,
    href: getPathname({
      locale,
      href: { pathname: "/leistungen/[slug]", params: { slug: service.slug } } as never
    })
  }));
  const links = [
    ...pageLinks,
    {
      label: "Leistungen (Übersicht)",
      href: getPathname({ locale, href: "/leistungen" as never })
    },
    {
      label: "Wissenszentrum",
      href: getPathname({ locale, href: "/wissen" as never })
    },
    ...serviceLinks,
    { label: "Anruf (Telefon)", href: company.phoneHref },
    { label: "E-Mail an die Firma", href: `mailto:${company.email}` },
    { label: "Anker: Bewerbungsformular", href: "#bewerbung" }
  ];


  const dynamicData = {
    locale,
    isEditor: true,
    jobs: jobs.map((job) => ({
      id: job.id,
      slug: job.translation.slug,
      title: job.translation.title,
      location: job.locationCity,
      country: job.country,
      system:
        job.workSystem ?? t(`jobs.employmentTypes.${job.employmentType}`),
      salary: formatSalary(job.salaryMin, job.salaryMax),
      salaryNote: job.salaryNote,
      licenseCategory: job.licenseCategory ?? ""
    })),
    cities: [
      ...cities.map((city) => ({ city: city.city, lngLat: city.lngLat })),
      {
        city: "Nuthe-Urstromtal (Zentrale)",
        lngLat: company.hqLngLat,
        hq: true
      }
    ],
    testimonials: testimonials.map((entry) => ({
      quote: entry.quote,
      name: entry.authorName,
      role: [entry.authorRole, entry.authorCompany].filter(Boolean).join(", ")
    })),
    links,
    articles
  };

  const pageDef = BUILDER_PAGES[key];
  const previewUrl = pageDef.serviceKey
    ? getPathname({
        locale,
        href: {
          pathname: "/leistungen/[slug]",
          params: {
            slug:
              getServices(locale).find(
                (service) => service.key === pageDef.serviceKey
              )?.slug ?? ""
          }
        } as never
      })
    : getPathname({ locale, href: pageDef.route as never });

  return (
    <PageEditor
      pageKey={key}
      pageLabel={BUILDER_PAGES[key].label}
      locale={locale}
      locales={[...locales]}
      initialData={initialData}
      messages={messages}
      dynamic={dynamicData}
      previewUrl={previewUrl}
    />
  );
}
