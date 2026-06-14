import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import { requireRole } from "@/auth";
import { prisma } from "@/server/db";
import { safeQuery } from "@/server/safe";
import {
  DbErrorBanner,
  EmptyState,
  formatDateTime
} from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

export const metadata = { title: "Job-Benachrichtigungen" };

export default async function JobAlertsPage() {
  const session = await requireRole(["SUPER_ADMIN", "HR", "MARKETING"]);
  if (!session) redirect("/admin");

  const data = await safeQuery(async () => {
    const [total, confirmed, recent] = await Promise.all([
      prisma.jobAlert.count({ where: { unsubscribedAt: null } }),
      prisma.jobAlert.count({
        where: { confirmedAt: { not: null }, unsubscribedAt: null }
      }),
      prisma.jobAlert.findMany({
        where: { unsubscribedAt: null },
        orderBy: { createdAt: "desc" },
        take: 200
      })
    ]);
    return { total, confirmed, recent };
  });

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-extrabold text-night-900">
          Job-Benachrichtigungen
        </h1>
        <DbErrorBanner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-night-900">
          Job-Benachrichtigungen
        </h1>
        <p className="mt-1 text-sm text-mist-500">
          Interessenten werden bei passenden neuen Stellen automatisch
          informiert.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-card">
          <p className="font-display text-3xl font-extrabold text-night-900">
            {data.confirmed}
          </p>
          <p className="mt-1 text-sm text-mist-500">Bestätigte Abonnenten</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-card">
          <p className="font-display text-3xl font-extrabold text-night-900">
            {data.total - data.confirmed}
          </p>
          <p className="mt-1 text-sm text-mist-500">Unbestätigt</p>
        </div>
      </div>

      {data.recent.length === 0 ? (
        <EmptyState text="Noch keine Anmeldungen." />
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-mist-100 text-xs uppercase tracking-wide text-mist-400">
                <th className="px-5 py-3.5 font-semibold">E-Mail</th>
                <th className="px-5 py-3.5 font-semibold">Region</th>
                <th className="px-5 py-3.5 font-semibold">Bestätigt</th>
                <th className="px-5 py-3.5 font-semibold">Angemeldet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mist-100">
              {data.recent.map((entry) => (
                <tr key={entry.id} className="hover:bg-mist-50">
                  <td className="px-5 py-3 font-medium text-night-900">
                    {entry.email}
                  </td>
                  <td className="px-5 py-3 text-mist-500">
                    {entry.region ?? "Überall"}
                  </td>
                  <td className="px-5 py-3">
                    {entry.confirmedAt ? (
                      <Check className="h-4 w-4 text-mint-500" />
                    ) : (
                      <span className="text-xs text-mist-400">offen</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-mist-500">
                    {formatDateTime(entry.createdAt)}
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
