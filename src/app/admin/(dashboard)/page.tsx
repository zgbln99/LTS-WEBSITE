import Link from "next/link";
import { redirect } from "next/navigation";
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

  const data = await safeQuery(async () => {
    const [
      newTransport,
      newContact,
      applicationsByStatus,
      latestTransport,
      latestApplications
    ] = await Promise.all([
      prisma.transportRequest.count({ where: { status: "NEW" } }),
      prisma.contactRequest.count({ where: { status: "NEW" } }),
      prisma.application.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.transportRequest.findMany({
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
      latestTransport,
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
  const totalApplications = data.applicationsByStatus.reduce(
    (sum, group) => sum + group._count._all,
    0
  );

  const stats = [
    {
      label: "Neue Transportanfragen",
      value: data.newTransport,
      href: "/admin/anfragen"
    },
    {
      label: "Neue Kontaktanfragen",
      value: data.newContact,
      href: "/admin/kontaktanfragen"
    },
    {
      label: "Neue Bewerbungen",
      value: newApplications,
      href: "/admin/bewerbungen"
    },
    {
      label: "Bewerbungen gesamt",
      value: totalApplications,
      href: "/admin/bewerbungen"
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-extrabold text-night-900">
        Dashboard
      </h1>

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
        <AdminCard title="Neueste Transportanfragen">
          {data.latestTransport.length === 0 ? (
            <EmptyState text="Noch keine Transportanfragen." />
          ) : (
            <ul className="divide-y divide-mist-100">
              {data.latestTransport.map((request) => (
                <li key={request.id}>
                  <Link
                    href={`/admin/anfragen/${request.id}`}
                    className="flex items-center justify-between gap-3 py-3 hover:bg-mist-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-night-900">
                        {request.referenceNumber} · {request.company}
                      </p>
                      <p className="truncate text-xs text-mist-500">
                        {request.pickupCountry} nach {request.deliveryCountry} ·{" "}
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
