import { ImageResponse } from "next/og";
import type { Locale } from "@/i18n/routing";
import { getJobBySlug } from "@/server/content";
import { formatSalaryRange } from "@/lib/salary";

export const dynamic = "force-dynamic";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "LTS Logistik - Stellenangebot";

// Teilbild für soziale Netzwerke (WhatsApp, Facebook), wenn ein Stellenlink
// geteilt wird. Zeigt Titel, Kategorie und Verdienst auf Markenhintergrund.
export default async function Image({
  params
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const job = await getJobBySlug(locale, slug);

  const title = job?.translation.title ?? "Stellenangebote";
  const location = job
    ? [job.locationCity, job.country].filter(Boolean).join(", ")
    : "Deutschland und Europa";
  const category = job?.licenseCategory ?? "C+E";
  const system = job?.workSystem ?? "";
  const salaryRange = job
    ? formatSalaryRange(job.salaryMin, job.salaryMax)
    : "";
  const salary = salaryRange ? `${salaryRange} ${job!.salaryNote}` : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0b101d",
          padding: "72px",
          fontFamily: "sans-serif"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#e11d24",
              color: "white",
              fontSize: "30px",
              fontWeight: 800,
              padding: "6px 16px",
              borderRadius: "12px"
            }}
          >
            LTS
          </div>
          <div style={{ color: "white", fontSize: "30px", fontWeight: 700 }}>
            Logistik
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              alignSelf: "flex-start",
              backgroundColor: "rgba(225,29,36,0.15)",
              color: "#f0484e",
              fontSize: "26px",
              fontWeight: 700,
              padding: "8px 20px",
              borderRadius: "999px"
            }}
          >
            KAT. {category}
          </div>
          <div
            style={{
              color: "white",
              fontSize: "62px",
              fontWeight: 800,
              lineHeight: 1.1,
              maxWidth: "1000px"
            }}
          >
            {title}
          </div>
          <div style={{ display: "flex", gap: "28px", color: "#9aa3b2", fontSize: "30px" }}>
            <span>{location}</span>
            {system ? <span>· {system}</span> : null}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          {salary ? (
            <div style={{ color: "white", fontSize: "44px", fontWeight: 800 }}>
              {salary}
            </div>
          ) : (
            <div />
          )}
          <div style={{ color: "#6b7585", fontSize: "26px" }}>
            ltslogistik.de
          </div>
        </div>
      </div>
    ),
    size
  );
}
