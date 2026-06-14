import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { requireRole } from "@/auth";
import { prisma } from "@/server/db";
import { safeQuery } from "@/server/safe";
import { AdminCard } from "@/components/admin/admin-ui";
import { JobForm } from "@/components/admin/job-form";
import { localizedUrl } from "@/lib/seo";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";

export const metadata = { title: "Stelle bearbeiten" };

export default async function EditJobPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(["SUPER_ADMIN", "HR"]);
  if (!session) redirect("/admin");

  const { id } = await params;
  const job = await safeQuery(() =>
    prisma.jobPosting.findUnique({
      where: { id },
      include: { translations: true, category: true }
    })
  );
  if (!job) notFound();

  const deSlug = job.translations.find(
    (translation) => translation.locale === routing.defaultLocale
  )?.slug;
  const publicUrl = deSlug
    ? localizedUrl(routing.defaultLocale, {
        pathname: "/karriere/stelle/[slug]",
        params: { slug: deSlug }
      })
    : null;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/stellen"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-mist-500 hover:text-night-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Alle Stellenanzeigen
        </Link>
        <h1 className="mt-2 font-display text-2xl font-extrabold text-night-900">
          Stelle bearbeiten
        </h1>
      </div>
      <AdminCard>
        <JobForm job={job} />
      </AdminCard>

      <AdminCard title="QR-Code">
        {publicUrl ? (
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/admin/stellen/${job.id}/qr`}
              alt="QR-Code zur Stellenanzeige"
              width={150}
              height={150}
              className="shrink-0 rounded-xl border border-mist-200"
            />
            <div className="space-y-3">
              <p className="text-sm text-mist-500">
                Zum Aushang an Tankstellen, auf Flyern oder Fahrzeugen. Fahrer
                scannen den Code und landen direkt auf dieser Stelle.
              </p>
              <p className="break-all text-xs text-mist-400">{publicUrl}</p>
              {job.status !== "PUBLISHED" ? (
                <p className="text-xs font-medium text-amber-600">
                  Hinweis: Die Seite ist erst nach der Veröffentlichung
                  erreichbar.
                </p>
              ) : null}
              <a
                href={`/api/admin/stellen/${job.id}/qr?download=1`}
                className="inline-flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-600"
              >
                <Download className="h-4 w-4" />
                PNG herunterladen
              </a>
            </div>
          </div>
        ) : (
          <p className="text-sm text-mist-500">
            Bitte zuerst die Stelle speichern, um einen QR-Code zu erzeugen.
          </p>
        )}
      </AdminCard>
    </div>
  );
}
