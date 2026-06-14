import { redirect } from "next/navigation";
import { requireRole } from "@/auth";
import { prisma } from "@/server/db";
import { safeQuery } from "@/server/safe";
import {
  DbErrorBanner,
  EmptyState,
  formatDateTime
} from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

export const metadata = { title: "Aktivitätsprotokoll" };

const actionLabels: Record<string, string> = {
  CREATE: "Erstellt",
  UPDATE: "Geändert",
  DELETE: "Gelöscht",
  STATUS_CHANGE: "Status geändert",
  LOGIN: "Anmeldung",
  EXPORT: "Export",
  ANONYMIZE: "Anonymisiert"
};

export default async function AuditPage() {
  const session = await requireRole(["SUPER_ADMIN"]);
  if (!session) redirect("/admin");

  const entries = await safeQuery(() =>
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 300,
      include: { user: { select: { name: true } } }
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-night-900">
          Aktivitätsprotokoll
        </h1>
        <p className="mt-1 text-sm text-mist-500">
          Wer hat wann was geändert. Die letzten 300 Einträge.
        </p>
      </div>

      {!entries ? (
        <DbErrorBanner />
      ) : entries.length === 0 ? (
        <EmptyState text="Noch keine Aktivitäten protokolliert." />
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-mist-100 text-xs uppercase tracking-wide text-mist-400">
                <th className="px-5 py-3.5 font-semibold">Zeitpunkt</th>
                <th className="px-5 py-3.5 font-semibold">Benutzer</th>
                <th className="px-5 py-3.5 font-semibold">Aktion</th>
                <th className="px-5 py-3.5 font-semibold">Objekt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mist-100">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-mist-50">
                  <td className="px-5 py-3 text-mist-500">
                    {formatDateTime(entry.createdAt)}
                  </td>
                  <td className="px-5 py-3 font-medium text-night-900">
                    {entry.user?.name ?? "System"}
                  </td>
                  <td className="px-5 py-3 text-night-700">
                    {actionLabels[entry.action] ?? entry.action}
                  </td>
                  <td className="px-5 py-3 text-mist-500">
                    {entry.entityType}
                    {entry.entityId ? (
                      <span className="text-mist-400"> · {entry.entityId}</span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
