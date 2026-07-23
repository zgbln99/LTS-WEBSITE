import { redirect } from "next/navigation";
import { Download } from "lucide-react";
import { requireRole } from "@/auth";
import { prisma } from "@/server/db";
import { safeQuery } from "@/server/safe";
import { DbErrorBanner, formatDateTime } from "@/components/admin/admin-ui";
import {
  ApplicationsBoard,
  type ApplicationCard
} from "@/components/admin/applications-board";

export const dynamic = "force-dynamic";

export const metadata = { title: "Bewerbungen" };

export default async function ApplicationsBoardPage() {
  const session = await requireRole(["SUPER_ADMIN", "HR"]);
  if (!session) redirect("/admin");

  const applications = await safeQuery(() =>
    prisma.application.findMany({
      orderBy: { createdAt: "desc" },
      take: 300,
      include: {
        _count: { select: { files: true, notes: true } },
        activities: {
          where: { type: "EMAIL_SENT" },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true }
        }
      }
    })
  );

  if (!applications) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-extrabold text-night-900">
          Bewerbungen
        </h1>
        <DbErrorBanner />
      </div>
    );
  }

  const dayAgo = Date.now() - 36 * 60 * 60 * 1000;
  const items: ApplicationCard[] = applications.map((application) => ({
    id: application.id,
    name: `${application.firstName} ${application.lastName}`,
    meta: [
      application.source?.replace("website:", ""),
      application.licenseClass
    ]
      .filter(Boolean)
      .join(" · "),
    dateLabel: formatDateTime(application.createdAt),
    status: application.status,
    files: application._count.files,
    isNew:
      application.status === "NEW" &&
      application.createdAt.getTime() > dayAgo,
    forwardedLabel: application.activities[0]
      ? formatDateTime(application.activities[0].createdAt)
      : undefined
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-extrabold text-night-900">
          Bewerbungen
        </h1>
        <a
          href="/api/admin/bewerbungen/export"
          className="inline-flex items-center gap-2 rounded-full border border-mist-300 px-4 py-2 text-sm font-semibold text-night-900 transition-colors hover:bg-mist-100"
        >
          <Download className="h-4 w-4" />
          CSV exportieren
        </a>
      </div>

      <ApplicationsBoard items={items} />
    </div>
  );
}
