import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, Clock } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/server/db";
import { safeQuery } from "@/server/safe";
import {
  AdminCard,
  DbErrorBanner,
  EmptyState,
  StatusBadge,
  applicationStatusLabels,
  formatDateTime,
  requestStatusLabels
} from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const data = await safeQuery(async () => {
    const [
      newTransport,
      newContact,
      applicationsByStatus,
      applicationsThisWeek,
      openJobs,
      failedNotifications,
      expiringJobs,
      latestContact,
      latestApplications
    ] = await Promise.all([
      prisma.transportRequest.count({ where: { status: "NEW" } }),
      prisma.contactRequest.count({ where: { status: "NEW" } }),
      prisma.application.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.application.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.jobPosting.count({ where: { status: "PUBLISHED" } }),
      prisma.mailNotification.count({ where: { status: "FAILED" } }),
      prisma.jobPosting.findMany({
        where: {
          status: "PUBLISHED",
          validThrough: { gte: new Date(), lt: in7Days }
        },
        orderBy: { validThrough: "asc" },
        include: { translations: { where: { locale: "de" } } },
        take: 5
      }),
      prisma.contactRequest.findMany({
        orderBy: { createdAt: "desc" },
        take: 5
      }),
      prisma.application.findMany({
        orderBy: { createdAt: "desc" },
        take: 5
      })
    ]);
    return {
      newTransport,
      newContact,
      applicationsByStatus,
      applicationsThisWeek,
      openJobs,
      failedNotifications,
      expiringJobs,
      latestContact,
      latestApplications
    };
  });

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-extrabold text-night-900">
          Dashboard
        </h1>
        <DbErrorBanner />
      </div>
    );
  }

  const newApplications =
    data.applicationsByStatus.find((group) => group.status === "NEW")?._count
      ._all ?? 0;

  const stats = [
    {
      label: "Neue Bewerbungen",
      value: newApplications,
      href: "/admin/bewerbungen"
    },
    {
      label: "Bewerbungen (7 Tage)",
      value: data.applicationsThisWeek,
      href: "/admin/bewerbungen"
    },
    {
      label: "Offene Stellen",
      value: data.openJobs,
      href: "/admin/stellen"
    },
    {
      label: "Neue Kontaktanfragen",
      value: data.newContact,
      href: "/admin/kontaktanfragen"
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-extrabold text-night-900">
        Dashboard
      </h1>

      {data.failedNotifications > 0 ? (
        <Link
          href="/admin/benachrichtigungen"
          className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {data.failedNotifications} fehlgeschlagene Benachrichtigung
          {data.failedNotifications === 1 ? "" : "en"} - bitte prüfen.
        </Link>
      ) : null}

      {data.expiringJobs.length > 0 ? (
        <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <div className="flex items-center gap-2 font-medium">
            <Clock className="h-4 w-4 shrink-0" />
            Stellen laufen demnächst ab:
          </div>
          <ul className="mt-1.5 space-y-1">
            {data.expiringJobs.map((job) => (
              <li key={job.id}>
                <Link
                  href={`/admin/stellen/${job.id}`}
                  className="hover:underline"
                >
                  {job.translations[0]?.title ?? "Ohne Titel"} -{" "}
                  {job.validThrough
                    ? formatDateTime(job.validThrough)
                    : ""}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-2xl bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover"
          >
            <p className="font-display text-3xl font-extrabold text-night-900">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-mist-500">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminCard title="Neueste Kontaktanfragen">
          {data.latestContact.length === 0 ? (
            <EmptyState text="Noch keine Kontaktanfragen." />
          ) : (
            <ul className="divide-y divide-mist-100">
              {data.latestContact.map((request) => (
                <li key={request.id}>
                  <Link
                    href="/admin/kontaktanfragen"
                    className="flex items-center justify-between gap-3 py-3 hover:bg-mist-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-night-900">
                        {request.name}
                        {request.company ? ` · ${request.company}` : ""}
                      </p>
                      <p className="truncate text-xs text-mist-500">
                        {request.department ?? "general"} ·{" "}
                        {formatDateTime(request.createdAt)}
                      </p>
                    </div>
                    <StatusBadge
                      status={request.status}
                      label={requestStatusLabels[request.status]}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>

        <AdminCard title="Neueste Bewerbungen">
          {data.latestApplications.length === 0 ? (
            <EmptyState text="Noch keine Bewerbungen." />
          ) : (
            <ul className="divide-y divide-mist-100">
              {data.latestApplications.map((application) => (
                <li key={application.id}>
                  <Link
                    href={`/admin/bewerbungen/${application.id}`}
                    className="flex items-center justify-between gap-3 py-3 hover:bg-mist-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-night-900">
                        {application.firstName} {application.lastName}
                      </p>
                      <p className="truncate text-xs text-mist-500">
                        {application.source ?? "website"} ·{" "}
                        {formatDateTime(application.createdAt)}
                      </p>
                    </div>
                    <StatusBadge
                      status={application.status}
                      label={applicationStatusLabels[application.status]}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>
    </div>
  );
}
