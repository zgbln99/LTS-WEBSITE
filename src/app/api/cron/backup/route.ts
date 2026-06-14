import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { isS3Configured, uploadObject } from "@/server/s3";

export const dynamic = "force-dynamic";

// Tägliches Datenbank-Backup als JSON nach S3.
// Per Cron aufrufen, z.B.:
//   30 3 * * *  curl -s "https://.../api/cron/backup?token=GEHEIM"
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET ist nicht gesetzt." },
      { status: 503 }
    );
  }

  const token =
    request.nextUrl.searchParams.get("token") ??
    request.headers.get("authorization")?.replace("Bearer ", "");
  if (token !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  if (!isS3Configured()) {
    return NextResponse.json(
      { ok: false, error: "S3 ist nicht konfiguriert." },
      { status: 503 }
    );
  }

  const [
    applications,
    contactRequests,
    jobPostings,
    testimonials,
    serviceCities,
    siteSettings,
    pages,
    articles
  ] = await Promise.all([
    prisma.application.findMany({ include: { files: true, notes: true } }),
    prisma.contactRequest.findMany(),
    prisma.jobPosting.findMany({ include: { translations: true } }),
    prisma.testimonial.findMany({ include: { translations: true } }),
    prisma.serviceCity.findMany(),
    prisma.siteSetting.findMany(),
    prisma.page.findMany({ include: { translations: true } }),
    prisma.blogPost.findMany({ include: { translations: true } })
  ]);

  const backup = {
    createdAt: new Date().toISOString(),
    counts: {
      applications: applications.length,
      contactRequests: contactRequests.length,
      jobPostings: jobPostings.length,
      testimonials: testimonials.length,
      serviceCities: serviceCities.length,
      siteSettings: siteSettings.length,
      pages: pages.length,
      articles: articles.length
    },
    data: {
      applications,
      contactRequests,
      jobPostings,
      testimonials,
      serviceCities,
      siteSettings,
      pages,
      articles
    }
  };

  const key = `backups/lts-backup-${new Date().toISOString().slice(0, 10)}.json`;
  try {
    await uploadObject(key, JSON.stringify(backup), "application/json");
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, key, counts: backup.counts });
}
