import { redirect } from "next/navigation";
import { CalendarClock } from "lucide-react";
import { requireRole } from "@/auth";
import { prisma } from "@/server/db";
import { safeQuery } from "@/server/safe";
import { updateAppointmentStatus } from "@/server/actions/admin";
import { StatusSelect } from "@/components/admin/status-select";
import {
  DbErrorBanner,
  EmptyState,
  formatDateTime,
  requestStatusLabels
} from "@/components/admin/admin-ui";
import { RequestStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata = { title: "Termine" };

const typeLabels: Record<string, string> = {
  interview: "Vorstellungsgespräch",
  trial_day: "Probetag"
};

const windowLabels: Record<string, string> = {
  morning: "Vormittags",
  afternoon: "Nachmittags",
  flexible: "Flexibel"
};

const statusOptions = Object.values(RequestStatus).map((status) => ({
  value: status,
  label: requestStatusLabels[status]
}));

export default async function AppointmentsPage() {
  const session = await requireRole(["SUPER_ADMIN", "HR"]);
  if (!session) redirect("/admin");

  const requests = await safeQuery(() =>
    prisma.appointmentRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 200
    })
  );

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-extrabold text-night-900">
        Termine und Probetage
      </h1>

      {!requests ? (
        <DbErrorBanner />
      ) : requests.length === 0 ? (
        <EmptyState text="Noch keine Terminanfragen eingegangen." />
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="rounded-2xl bg-white p-5 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 font-display text-base font-bold text-night-900">
                    <CalendarClock className="h-4 w-4 text-accent-500" />
                    {request.name}
                    <span className="rounded-full bg-mist-100 px-2.5 py-0.5 text-xs font-semibold text-night-700">
                      {typeLabels[request.type] ?? request.type}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-mist-500">
                    {request.preferredDate
                      ? `Wunschtermin: ${request.preferredDate} · `
                      : ""}
                    {windowLabels[request.timeWindow] ?? request.timeWindow} ·{" "}
                    {formatDateTime(request.createdAt)} · {request.locale}
                  </p>
                </div>
                <StatusSelect
                  id={request.id}
                  status={request.status}
                  options={statusOptions}
                  action={updateAppointmentStatus}
                />
              </div>
              {request.message ? (
                <p className="mt-3 whitespace-pre-wrap rounded-xl bg-mist-50 p-4 text-sm text-night-800">
                  {request.message}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                <a
                  href={`tel:${request.phone.replace(/\s/g, "")}`}
                  className="font-medium text-accent-600 hover:underline"
                >
                  {request.phone}
                </a>
                {request.email ? (
                  <a
                    href={`mailto:${request.email}`}
                    className="font-medium text-accent-600 hover:underline"
                  >
                    {request.email}
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
