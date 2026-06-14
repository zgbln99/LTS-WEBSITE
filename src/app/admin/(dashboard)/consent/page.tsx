import { redirect } from "next/navigation";
import { Check, X } from "lucide-react";
import { requireRole } from "@/auth";
import { prisma } from "@/server/db";
import { safeQuery } from "@/server/safe";
import {
  DbErrorBanner,
  EmptyState,
  formatDateTime
} from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

export const metadata = { title: "Einwilligungen" };

export default async function ConsentPage() {
  const session = await requireRole(["SUPER_ADMIN"]);
  if (!session) redirect("/admin");

  const data = await safeQuery(async () => {
    const [total, analytics, marketing, recent] = await Promise.all([
      prisma.consentLog.count(),
      prisma.consentLog.count({ where: { analytics: true } }),
      prisma.consentLog.count({ where: { marketing: true } }),
      prisma.consentLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 })
    ]);
    return { total, analytics, marketing, recent };
  });

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-extrabold text-night-900">
          Einwilligungen
        </h1>
        <DbErrorBanner />
      </div>
    );
  }

  const pct = (value: number) =>
    data.total > 0 ? Math.round((value / data.total) * 100) : 0;

  const stats = [
    { label: "Protokollierte Einwilligungen", value: data.total },
    { label: "Statistik akzeptiert", value: `${pct(data.analytics)}%` },
    { label: "Marketing akzeptiert", value: `${pct(data.marketing)}%` }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-night-900">
          Einwilligungen
        </h1>
        <p className="mt-1 text-sm text-mist-500">
          DSGVO-Nachweis der erteilten Cookie-Einwilligungen.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-white p-5 shadow-card">
            <p className="font-display text-3xl font-extrabold text-night-900">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-mist-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {data.recent.length === 0 ? (
        <EmptyState text="Noch keine Einwilligungen protokolliert." />
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-mist-100 text-xs uppercase tracking-wide text-mist-400">
                <th className="px-5 py-3.5 font-semibold">Zeitpunkt</th>
                <th className="px-5 py-3.5 font-semibold">Statistik</th>
                <th className="px-5 py-3.5 font-semibold">Marketing</th>
                <th className="px-5 py-3.5 font-semibold">Sprache</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mist-100">
              {data.recent.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-5 py-3 text-mist-500">
                    {formatDateTime(entry.createdAt)}
                  </td>
                  <td className="px-5 py-3">
                    {entry.analytics ? (
                      <Check className="h-4 w-4 text-mint-500" />
                    ) : (
                      <X className="h-4 w-4 text-mist-300" />
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {entry.marketing ? (
                      <Check className="h-4 w-4 text-mint-500" />
                    ) : (
                      <X className="h-4 w-4 text-mist-300" />
                    )}
                  </td>
                  <td className="px-5 py-3 uppercase text-mist-500">
                    {entry.locale}
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
