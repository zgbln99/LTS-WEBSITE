import { redirect } from "next/navigation";
import { requireRole } from "@/auth";
import { prisma } from "@/server/db";
import { safeQuery } from "@/server/safe";
import { updateContactRequestStatus } from "@/server/actions/admin";
import { StatusSelect } from "@/components/admin/status-select";
import {
  DbErrorBanner,
  EmptyState,
  formatDateTime,
  requestStatusLabels
} from "@/components/admin/admin-ui";
import { RequestStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata = { title: "Kontaktanfragen" };

const departmentLabels: Record<string, string> = {
  general: "Allgemein",
  dispo: "Disposition",
  hr: "Personal",
  billing: "Buchhaltung",
  callback: "Rückrufbitte"
};

const statusOptions = Object.values(RequestStatus).map((status) => ({
  value: status,
  label: requestStatusLabels[status]
}));

export default async function ContactRequestsPage() {
  const session = await requireRole(["SUPER_ADMIN", "MARKETING"]);
  if (!session) redirect("/admin");

  const requests = await safeQuery(() =>
    prisma.contactRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 200
    })
  );

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-extrabold text-night-900">
        Kontaktanfragen
      </h1>

      {!requests ? (
        <DbErrorBanner />
      ) : requests.length === 0 ? (
        <EmptyState text="Noch keine Kontaktanfragen eingegangen." />
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="rounded-2xl bg-white p-5 shadow-card"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-base font-bold text-night-900">
                    {request.name}
                    {request.company ? (
                      <span className="font-sans text-sm font-normal text-mist-500">
                        {" "}· {request.company}
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 text-xs text-mist-500">
                    {departmentLabels[request.department ?? "general"] ?? request.department}{" "}
                    · {formatDateTime(request.createdAt)} · Sprache: {request.locale}
                  </p>
                </div>
                <StatusSelect
                  id={request.id}
                  status={request.status}
                  options={statusOptions}
                  action={updateContactRequestStatus}
                />
              </div>
              <p className="mt-3 whitespace-pre-wrap rounded-xl bg-mist-50 p-4 text-sm text-night-800">
                {request.message}
              </p>
              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                {request.email ? (
                  <a
                    href={`mailto:${request.email}`}
                    className="font-medium text-accent-600 hover:underline"
                  >
                    {request.email}
                  </a>
                ) : null}
                {request.phone ? (
                  <a
                    href={`tel:${request.phone.replace(/\s/g, "")}`}
                    className="font-medium text-accent-600 hover:underline"
                  >
                    {request.phone}
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
