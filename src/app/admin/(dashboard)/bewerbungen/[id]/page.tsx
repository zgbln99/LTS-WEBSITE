import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { requireRole } from "@/auth";
import { prisma } from "@/server/db";
import { safeQuery } from "@/server/safe";
import { getDownloadUrl } from "@/server/s3";
import {
  addApplicationNote,
  updateApplicationStatus
} from "@/server/actions/admin";
import { StatusSelect } from "@/components/admin/status-select";
import { AnonymizeButton } from "@/components/admin/anonymize-button";
import { DeleteApplicationButton } from "@/components/admin/delete-application-button";
import {
  AdminCard,
  applicationStatusLabels,
  formatDateTime
} from "@/components/admin/admin-ui";
import { ApplicationStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const statusOptions = Object.values(ApplicationStatus).map((status) => ({
  value: status,
  label: applicationStatusLabels[status]
}));

const fileTypeLabels: Record<string, string> = {
  CV: "Lebenslauf",
  LICENSE: "Führerschein",
  CERTIFICATE: "Zertifikat",
  OTHER: "Sonstiges"
};

const activityLabels: Record<string, string> = {
  RECEIVED: "Bewerbung eingegangen",
  STATUS_CHANGE: "Status geändert",
  NOTE_ADDED: "Notiz hinzugefügt",
  EMAIL_SENT: "E-Mail gesendet",
  ANONYMIZED: "Daten anonymisiert"
};

export default async function ApplicationDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(["SUPER_ADMIN", "HR"]);
  if (!session) redirect("/admin");

  const { id } = await params;
  const application = await safeQuery(() =>
    prisma.application.findUnique({
      where: { id },
      include: {
        files: { orderBy: { createdAt: "asc" } },
        notes: {
          orderBy: { createdAt: "desc" },
          include: { author: { select: { name: true } } }
        },
        activities: { orderBy: { createdAt: "desc" }, take: 30 }
      }
    })
  );
  if (!application) notFound();

  const downloads = await Promise.all(
    application.files.map(async (file) => ({
      file,
      url: await getDownloadUrl(file.s3Key)
    }))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/bewerbungen"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-mist-500 hover:text-night-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Alle Bewerbungen
          </Link>
          <h1 className="mt-2 font-display text-2xl font-extrabold text-night-900">
            {application.firstName} {application.lastName}
          </h1>
          <p className="text-sm text-mist-500">
            Eingegangen am {formatDateTime(application.createdAt)} ·{" "}
            {application.source?.replace("website:", "Bereich: ") ?? ""}
          </p>
        </div>
        <StatusSelect
          id={application.id}
          status={application.status}
          options={statusOptions}
          action={updateApplicationStatus}
        />
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <AdminCard title="Kandidatendaten">
            <dl className="grid gap-2.5 sm:grid-cols-2">
              {(
                [
                  ["E-Mail", application.email],
                  ["Telefon", application.phone],
                  ["Führerscheinklasse", application.licenseClass ?? ""],
                  ["Sprache", application.locale],
                  ["DSGVO-Einwilligung", formatDateTime(application.gdprConsentAt)]
                ] as [string, string][]
              )
                .filter(([, value]) => value !== "")
                .map(([label, value]) => (
                  <div key={label} className="text-sm">
                    <dt className="text-mist-400">{label}</dt>
                    <dd className="font-medium text-night-900">{value}</dd>
                  </div>
                ))}
            </dl>
            {application.message ? (
              <p className="mt-4 whitespace-pre-wrap rounded-xl bg-mist-50 p-4 text-sm text-night-800">
                {application.message}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={`mailto:${application.email}`}
                className="rounded-full bg-accent-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-600"
              >
                Per E-Mail antworten
              </a>
              <a
                href={`tel:${application.phone.replace(/\s/g, "")}`}
                className="rounded-full border border-mist-300 px-5 py-2.5 text-sm font-medium text-night-900 hover:border-night-900"
              >
                Anrufen
              </a>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-mist-100 pt-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-mist-400">
                DSGVO
              </span>
              <a
                href={`/api/admin/bewerbungen/${application.id}/export`}
                className="inline-flex items-center gap-1.5 rounded-full border border-mist-300 px-4 py-2 text-sm font-medium text-night-900 hover:border-night-900"
              >
                <Download className="h-4 w-4" />
                Auskunft (JSON)
              </a>
              {application.anonymizedAt ? (
                <span className="text-sm text-mist-400">
                  Anonymisiert am {formatDateTime(application.anonymizedAt)}
                </span>
              ) : (
                <AnonymizeButton id={application.id} />
              )}
              <DeleteApplicationButton id={application.id} />
            </div>
          </AdminCard>

          <AdminCard title="Unterlagen">
            {application.files.length === 0 ? (
              <p className="text-sm text-mist-400">
                Keine Dateien im Storage. Eingereichte Unterlagen wurden als
                E-Mail-Anhang an HR zugestellt.
              </p>
            ) : (
              <ul className="divide-y divide-mist-100">
                {downloads.map(({ file, url }) => (
                  <li
                    key={file.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <FileText className="h-5 w-5 shrink-0 text-accent-500" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-night-900">
                          {file.fileName}
                        </p>
                        <p className="text-xs text-mist-400">
                          {fileTypeLabels[file.type] ?? file.type} ·{" "}
                          {(file.sizeBytes / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                    </div>
                    {url ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-full border border-mist-300 px-4 py-2 text-xs font-semibold text-night-900 hover:border-night-900"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Herunterladen
                      </a>
                    ) : (
                      <span className="text-xs text-mist-400">
                        Storage nicht konfiguriert
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </AdminCard>

          <AdminCard title="Notizen">
            <form action={addApplicationNote} className="mb-5">
              <input type="hidden" name="id" value={application.id} />
              <textarea
                name="body"
                required
                minLength={1}
                placeholder="Interne Notiz zum Kandidaten..."
                className="min-h-20 w-full resize-y rounded-xl border border-mist-300 bg-white px-4 py-3 text-sm text-night-900 placeholder:text-mist-400 outline-none focus:border-accent-500"
              />
              <button
                type="submit"
                className="mt-2 rounded-full bg-night-950 px-5 py-2 text-sm font-medium text-white hover:bg-night-800"
              >
                Notiz speichern
              </button>
            </form>
            {application.notes.length === 0 ? (
              <p className="text-sm text-mist-400">Noch keine Notizen.</p>
            ) : (
              <ul className="space-y-3">
                {application.notes.map((note) => (
                  <li key={note.id} className="rounded-xl bg-mist-50 p-4">
                    <p className="whitespace-pre-wrap text-sm text-night-800">
                      {note.body}
                    </p>
                    <p className="mt-2 text-xs text-mist-400">
                      {note.author?.name ?? "Unbekannt"} ·{" "}
                      {formatDateTime(note.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </AdminCard>
        </div>

        <AdminCard title="Verlauf">
          {application.activities.length === 0 ? (
            <p className="text-sm text-mist-400">Keine Aktivitäten.</p>
          ) : (
            <ol className="space-y-4">
              {application.activities.map((activity) => {
                const payload = activity.payload as {
                  status?: string;
                  by?: string;
                } | null;
                return (
                  <li key={activity.id} className="flex gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-500" />
                    <div>
                      <p className="text-sm font-medium text-night-900">
                        {activityLabels[activity.type] ?? activity.type}
                        {payload?.status
                          ? `: ${applicationStatusLabels[payload.status as ApplicationStatus] ?? payload.status}`
                          : ""}
                      </p>
                      <p className="text-xs text-mist-400">
                        {payload?.by ? `${payload.by} · ` : ""}
                        {formatDateTime(activity.createdAt)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </AdminCard>
      </div>
    </div>
  );
}
