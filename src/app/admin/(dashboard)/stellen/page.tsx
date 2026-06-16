import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Trash2
} from "lucide-react";
import { requireRole } from "@/auth";
import { prisma } from "@/server/db";
import { safeQuery } from "@/server/safe";
import {
  deleteJobPosting,
  duplicateJobPosting,
  moveJobPosting,
  toggleJobStatus
} from "@/server/actions/content";
import {
  DbErrorBanner,
  EmptyState,
  StatusBadge,
  formatDateTime
} from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

export const metadata = { title: "Stellenanzeigen" };

const publishLabels: Record<string, string> = {
  DRAFT: "Entwurf",
  PUBLISHED: "Veröffentlicht",
  ARCHIVED: "Archiviert"
};

const publishColors: Record<string, string> = {
  DRAFT: "NEW",
  PUBLISHED: "HIRED",
  ARCHIVED: "CLOSED"
};

const DAY = 24 * 60 * 60 * 1000;

// Hinweis zum Ablaufdatum: abgelaufen oder läuft in den nächsten 7 Tagen ab.
function expiryHint(validThrough: Date | null) {
  if (!validThrough) return null;
  const diff = validThrough.getTime() - Date.now();
  if (diff < 0) {
    return { label: "Abgelaufen", className: "bg-red-50 text-red-700" };
  }
  if (diff < 7 * DAY) {
    const days = Math.max(1, Math.ceil(diff / DAY));
    return {
      label: `Läuft in ${days} Tag${days === 1 ? "" : "en"} ab`,
      className: "bg-amber-50 text-amber-700"
    };
  }
  return null;
}

const PAGE_SIZE = 20;

export default async function JobsAdminPage({
  searchParams
}: {
  searchParams: Promise<{ seite?: string }>;
}) {
  const session = await requireRole(["SUPER_ADMIN", "HR"]);
  if (!session) redirect("/admin");

  const params = await searchParams;
  const requestedPage = Math.max(1, Number(params.seite) || 1);

  const total = await safeQuery(() => prisma.jobPosting.count());
  const totalCount = total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);

  const jobs = await safeQuery(() =>
    prisma.jobPosting.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        translations: { where: { locale: "de" } },
        category: true,
        _count: { select: { applications: true } }
      },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-extrabold text-night-900">
          Stellenanzeigen
        </h1>
        <Link
          href="/admin/stellen/neu"
          className="flex items-center gap-2 rounded-full bg-accent-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-600"
        >
          <Plus className="h-4 w-4" />
          Neue Stelle
        </Link>
      </div>

      {!jobs ? (
        <DbErrorBanner />
      ) : jobs.length === 0 ? (
        <EmptyState text="Noch keine Stellenanzeigen angelegt." />
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-mist-100 text-xs uppercase tracking-wide text-mist-400">
                <th className="px-3 py-3.5 font-semibold">Reihenfolge</th>
                <th className="px-5 py-3.5 font-semibold">Titel</th>
                <th className="px-5 py-3.5 font-semibold">Standort</th>
                <th className="px-5 py-3.5 font-semibold">Bewerbungen</th>
                <th className="px-5 py-3.5 font-semibold">Angelegt</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-mist-100">
              {jobs.map((job, index) => (
                <tr key={job.id} className="hover:bg-mist-50">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-0.5">
                      <form action={moveJobPosting} className="inline">
                        <input type="hidden" name="id" value={job.id} />
                        <input type="hidden" name="direction" value="up" />
                        <button
                          type="submit"
                          disabled={(page - 1) * PAGE_SIZE + index === 0}
                          className="rounded-lg p-1.5 text-mist-400 hover:bg-mist-100 hover:text-night-900 disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Nach oben"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                      </form>
                      <form action={moveJobPosting} className="inline">
                        <input type="hidden" name="id" value={job.id} />
                        <input type="hidden" name="direction" value="down" />
                        <button
                          type="submit"
                          disabled={
                            (page - 1) * PAGE_SIZE + index === totalCount - 1
                          }
                          className="rounded-lg p-1.5 text-mist-400 hover:bg-mist-100 hover:text-night-900 disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Nach unten"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/stellen/${job.id}`}
                      className="font-semibold text-accent-600 hover:underline"
                    >
                      {job.translations[0]?.title ?? "Ohne Titel"}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-mist-500">{job.locationCity}</td>
                  <td className="px-5 py-3 text-mist-500">
                    {job._count.applications}
                  </td>
                  <td className="px-5 py-3 text-mist-500">
                    {formatDateTime(job.createdAt)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-col items-start gap-1.5">
                      <StatusBadge
                        status={publishColors[job.status]}
                        label={publishLabels[job.status]}
                      />
                      {(() => {
                        const hint = expiryHint(job.validThrough);
                        return hint ? (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${hint.className}`}
                          >
                            <AlertTriangle className="h-3 w-3" />
                            {hint.label}
                          </span>
                        ) : null;
                      })()}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <form action={toggleJobStatus} className="inline">
                        <input type="hidden" name="id" value={job.id} />
                        <button
                          type="submit"
                          className="rounded-lg p-2 text-mist-400 hover:bg-mist-100 hover:text-night-900"
                          title={
                            job.status === "PUBLISHED"
                              ? "Auf Entwurf setzen"
                              : "Veröffentlichen"
                          }
                        >
                          {job.status === "PUBLISHED" ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </form>
                      <form action={duplicateJobPosting} className="inline">
                        <input type="hidden" name="id" value={job.id} />
                        <button
                          type="submit"
                          className="rounded-lg p-2 text-mist-400 hover:bg-mist-100 hover:text-night-900"
                          title="Duplizieren"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </form>
                      <form action={deleteJobPosting} className="inline">
                        <input type="hidden" name="id" value={job.id} />
                        <button
                          type="submit"
                          className="rounded-lg p-2 text-mist-400 hover:bg-red-50 hover:text-red-600"
                          title="Löschen"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {jobs && totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-mist-500">
            Seite {page} von {totalPages} · {totalCount} Anzeigen
          </p>
          <div className="flex items-center gap-2">
            {page > 1 ? (
              <Link
                href={`/admin/stellen?seite=${page - 1}`}
                className="flex items-center gap-1.5 rounded-full border border-mist-300 px-4 py-2 text-sm font-medium text-night-900 hover:border-night-900"
              >
                <ChevronLeft className="h-4 w-4" />
                Zurück
              </Link>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full border border-mist-200 px-4 py-2 text-sm font-medium text-mist-300">
                <ChevronLeft className="h-4 w-4" />
                Zurück
              </span>
            )}
            {page < totalPages ? (
              <Link
                href={`/admin/stellen?seite=${page + 1}`}
                className="flex items-center gap-1.5 rounded-full border border-mist-300 px-4 py-2 text-sm font-medium text-night-900 hover:border-night-900"
              >
                Weiter
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full border border-mist-200 px-4 py-2 text-sm font-medium text-mist-300">
                Weiter
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
