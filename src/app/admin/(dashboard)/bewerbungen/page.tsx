import Link from "next/link";
import { redirect } from "next/navigation";
import { Paperclip } from "lucide-react";
import { requireRole } from "@/auth";
import { prisma } from "@/server/db";
import { safeQuery } from "@/server/safe";
import {
  DbErrorBanner,
  applicationStatusLabels,
  formatDateTime
} from "@/components/admin/admin-ui";
import { ApplicationStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = { title: "Bewerbungen" };

const columnAccents: Record<ApplicationStatus, string> = {
  NEW: "border-t-accent-500",
  REVIEWED: "border-t-blue-500",
  INTERVIEW: "border-t-violet-500",
  REJECTED: "border-t-red-400",
  HIRED: "border-t-mint-400"
};

export default async function ApplicationsBoardPage() {
  const session = await requireRole(["SUPER_ADMIN", "HR"]);
  if (!session) redirect("/admin");

  const applications = await safeQuery(() =>
    prisma.application.findMany({
      orderBy: { createdAt: "desc" },
      take: 300,
      include: { _count: { select: { files: true, notes: true } } }
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

  const columns = Object.values(ApplicationStatus).map((status) => ({
    status,
    items: applications.filter((application) => application.status === status)
  }));

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-extrabold text-night-900">
        Bewerbungen
      </h1>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {columns.map((column) => (
          <div
            key={column.status}
            className={cn(
              "rounded-2xl border-t-4 bg-white p-4 shadow-card",
              columnAccents[column.status]
            )}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-sm font-bold text-night-900">
                {applicationStatusLabels[column.status]}
              </h2>
              <span className="rounded-full bg-mist-100 px-2 py-0.5 text-xs font-semibold text-mist-500">
                {column.items.length}
              </span>
            </div>
            <div className="space-y-2.5">
              {column.items.length === 0 ? (
                <p className="rounded-xl border border-dashed border-mist-200 px-3 py-5 text-center text-xs text-mist-400">
                  Keine Einträge
                </p>
              ) : (
                column.items.map((application) => (
                  <Link
                    key={application.id}
                    href={`/admin/bewerbungen/${application.id}`}
                    className="block rounded-xl border border-mist-100 bg-mist-50 p-3 transition-colors hover:border-accent-500/40 hover:bg-white"
                  >
                    <p className="text-sm font-semibold text-night-900">
                      {application.firstName} {application.lastName}
                    </p>
                    <p className="mt-0.5 text-xs text-mist-500">
                      {application.source?.replace("website:", "") ?? ""}
                      {application.licenseClass
                        ? ` · ${application.licenseClass}`
                        : ""}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-xs text-mist-400">
                      <span>{formatDateTime(application.createdAt)}</span>
                      {application._count.files > 0 ? (
                        <span className="flex items-center gap-1">
                          <Paperclip className="h-3 w-3" />
                          {application._count.files}
                        </span>
                      ) : null}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
