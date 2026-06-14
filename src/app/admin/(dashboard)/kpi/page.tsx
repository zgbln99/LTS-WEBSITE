import { redirect } from "next/navigation";
import { requireRole } from "@/auth";
import { prisma } from "@/server/db";
import { safeQuery } from "@/server/safe";
import {
  DbErrorBanner,
  applicationStatusLabels
} from "@/components/admin/admin-ui";
import { ApplicationStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata = { title: "Auswertungen" };

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mär",
  "Apr",
  "Mai",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Okt",
  "Nov",
  "Dez"
];

export default async function KpiPage() {
  const session = await requireRole(["SUPER_ADMIN", "HR", "MARKETING"]);
  if (!session) redirect("/admin");

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const data = await safeQuery(async () => {
    const [total, thisMonth, byStatus, openJobs, hiredApps, recent] =
      await Promise.all([
        prisma.application.count(),
        prisma.application.count({ where: { createdAt: { gte: startOfMonth } } }),
        prisma.application.groupBy({
          by: ["status"],
          _count: { _all: true }
        }),
        prisma.jobPosting.count({ where: { status: "PUBLISHED" } }),
        prisma.application.findMany({
          where: { status: "HIRED" },
          select: { createdAt: true, updatedAt: true }
        }),
        prisma.application.findMany({
          where: { createdAt: { gte: sixMonthsAgo } },
          select: { createdAt: true, source: true }
        })
      ]);
    return { total, thisMonth, byStatus, openJobs, hiredApps, recent };
  });

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-extrabold text-night-900">
          Auswertungen
        </h1>
        <DbErrorBanner />
      </div>
    );
  }

  const hired = data.hiredApps.length;
  const conversion = data.total > 0 ? Math.round((hired / data.total) * 100) : 0;
  const avgTimeToHire =
    hired > 0
      ? Math.round(
          data.hiredApps.reduce(
            (sum, a) =>
              sum +
              (a.updatedAt.getTime() - a.createdAt.getTime()) /
                (1000 * 60 * 60 * 24),
            0
          ) / hired
        )
      : 0;

  // Bewerbungen je Monat (letzte 6 Monate)
  const months: { label: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    months.push({ label: MONTH_NAMES[d.getMonth()], count: 0 });
    const idx = months.length - 1;
    months[idx].count = data.recent.filter((r) => {
      const rd = r.createdAt;
      return `${rd.getFullYear()}-${rd.getMonth()}` === key;
    }).length;
  }
  const maxMonth = Math.max(1, ...months.map((m) => m.count));

  // Top-Quellen
  const sourceCounts = new Map<string, number>();
  for (const r of data.recent) {
    const src = (r.source ?? "unbekannt").replace("website:", "");
    sourceCounts.set(src, (sourceCounts.get(src) ?? 0) + 1);
  }
  const topSources = [...sourceCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const stats = [
    { label: "Bewerbungen gesamt", value: data.total },
    { label: "Diesen Monat", value: data.thisMonth },
    { label: "Eingestellt", value: hired },
    { label: "Conversion-Rate", value: `${conversion}%` },
    { label: "Ø Zeit bis Einstellung", value: `${avgTimeToHire} Tage` },
    { label: "Offene Stellen", value: data.openJobs }
  ];

  const statusCounts = Object.values(ApplicationStatus).map((status) => ({
    status,
    count:
      data.byStatus.find((g) => g.status === status)?._count._all ?? 0
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-night-900">
          Auswertungen
        </h1>
        <p className="mt-1 text-sm text-mist-500">
          Kennzahlen zur Personalgewinnung. Quellen stammen aus dem
          Bewerbungskanal (auch UTM-Quellen, sobald gesetzt).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-white p-5 shadow-card">
            <p className="font-display text-3xl font-extrabold text-night-900">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-mist-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <h2 className="font-display text-base font-bold text-night-900">
            Bewerbungen je Monat
          </h2>
          <div className="mt-5 flex items-end justify-between gap-3" style={{ height: 160 }}>
            {months.map((m) => (
              <div key={m.label} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-semibold text-night-900">
                  {m.count}
                </span>
                <div
                  className="w-full rounded-t-lg bg-accent-500"
                  style={{ height: `${(m.count / maxMonth) * 120}px` }}
                />
                <span className="text-xs text-mist-400">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-card">
          <h2 className="font-display text-base font-bold text-night-900">
            Status-Verteilung
          </h2>
          <ul className="mt-4 space-y-3">
            {statusCounts.map(({ status, count }) => (
              <li key={status} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-sm text-mist-500">
                  {applicationStatusLabels[status]}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-mist-100">
                  <div
                    className="h-full rounded-full bg-night-900"
                    style={{
                      width: `${data.total > 0 ? (count / data.total) * 100 : 0}%`
                    }}
                  />
                </div>
                <span className="w-8 text-right text-sm font-semibold text-night-900">
                  {count}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-card">
        <h2 className="font-display text-base font-bold text-night-900">
          Top-Quellen (letzte 6 Monate)
        </h2>
        {topSources.length === 0 ? (
          <p className="mt-3 text-sm text-mist-400">Noch keine Daten.</p>
        ) : (
          <ul className="mt-4 space-y-2.5">
            {topSources.map(([source, count]) => (
              <li
                key={source}
                className="flex items-center justify-between border-b border-mist-100 pb-2.5 text-sm last:border-0"
              >
                <span className="font-medium text-night-900">{source}</span>
                <span className="text-mist-500">{count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
