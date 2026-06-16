import { getPublishedJobs } from "@/server/content";
import { localizedUrl, SITE_URL } from "@/lib/seo";
import { company } from "@/data/company";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

const jobTypeMap: Record<string, string> = {
  FULL_TIME: "fulltime",
  PART_TIME: "parttime",
  MINI_JOB: "parttime",
  APPRENTICESHIP: "apprenticeship"
};

const cdata = (value: string) =>
  `<![CDATA[${value.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;

// Job-Feed im Indeed-/Google-kompatiblen XML-Format. Externe Jobbörsen
// lesen diese URL ein und übernehmen die Stellen automatisch.
export async function GET() {
  const jobs = await getPublishedJobs(routing.defaultLocale);

  const items = jobs
    .map((job) => {
      const url = localizedUrl(routing.defaultLocale, {
        pathname: "/karriere/stelle/[slug]",
        params: { slug: job.translation.slug }
      });
      const salary =
        job.salaryMin || job.salaryMax
          ? `${
              job.salaryMin && job.salaryMax && job.salaryMin !== job.salaryMax
                ? `${job.salaryMin}-${job.salaryMax}`
                : (job.salaryMin ?? job.salaryMax)
            } ${job.salaryCurrency} ${job.salaryNote}`
          : "";
      const datePosted = job.publishedAt ?? job.createdAt;
      const date = datePosted.toUTCString();
      const expires = (
        job.validThrough ??
        new Date(datePosted.getTime() + 90 * 24 * 60 * 60 * 1000)
      ).toUTCString();

      // Vollständige Beschreibung inkl. Profil, Anforderungen und Benefits,
      // damit Jobbörsen die komplette Anzeige übernehmen.
      const profile = (job.translation.profile as string[] | null) ?? [];
      const requirements = (job.translation.requirements as string[]) ?? [];
      const benefits = (job.translation.benefits as string[]) ?? [];
      const section = (heading: string, items: string[]) =>
        items.length
          ? `<h3>${heading}</h3><ul>${items
              .map((item) => `<li>${item}</li>`)
              .join("")}</ul>`
          : "";
      const description = [
        job.translation.description,
        section("Dein Profil", profile),
        section("Anforderungen", requirements),
        section("Benefits", benefits)
      ]
        .filter(Boolean)
        .join("");

      return `  <job>
    <title>${cdata(job.translation.title)}</title>
    <date>${cdata(date)}</date>
    <expirationdate>${cdata(expires)}</expirationdate>
    <referencenumber>${cdata(job.id)}</referencenumber>
    <url>${cdata(url)}</url>
    <company>${cdata(company.legalName)}</company>
    <city>${cdata(job.locationCity)}</city>
    <state>${cdata(job.locationRegion ?? "")}</state>
    <postalcode>${cdata(job.postalCode ?? "")}</postalcode>
    <country>${cdata("DE")}</country>
    <description>${cdata(description)}</description>
    <jobtype>${cdata(jobTypeMap[job.employmentType] ?? "fulltime")}</jobtype>
    <category>${cdata(job.licenseCategory ?? "Berufskraftfahrer")}</category>
    <salary>${cdata(salary)}</salary>
  </job>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<source>
  <publisher>${cdata(company.legalName)}</publisher>
  <publisherurl>${cdata(SITE_URL)}</publisherurl>
  <lastBuildDate>${cdata(new Date().toUTCString())}</lastBuildDate>
${items}
</source>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
