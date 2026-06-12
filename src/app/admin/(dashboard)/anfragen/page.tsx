import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/auth";
import { prisma } from "@/server/db";
import { safeQuery } from "@/server/safe";
import { updateTransportRequestStatus } from "@/server/actions/admin";
import { StatusSelect } from "@/components/admin/status-select";
import {
  DbErrorBanner,
  EmptyState,
  formatDateTime,
  requestStatusLabels
} from "@/components/admin/admin-ui";
import { RequestStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata = { title: "Transportanfragen" };

const statusOptions = Object.values(RequestStatus).map((status) => ({
  value: status,
  label: requestStatusLabels[status]
}));

export default async function TransportRequestsPage() {
  const session = await requireRole(["SUPER_ADMIN", "MARKETING"]);
  if (!session) redirect("/admin");

  const requests = await safeQuery(() =>
    prisma.transportRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 200
    })
  );

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-extrabold text-night-900">
        Transportanfragen
      </h1>

      {!requests ? (
        <DbErrorBanner />
      ) : requests.length === 0 ? (
        <EmptyState text="Noch keine Transportanfragen eingegangen." />
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-mist-100 text-xs uppercase tracking-wide text-mist-400">
                <th className="px-5 py-3.5 font-semibold">Referenz</th>
                <th className="px-5 py-3.5 font-semibold">Firma</th>
                <th className="px-5 py-3.5 font-semibold">Strecke</th>
                <th className="px-5 py-3.5 font-semibold">Eingang</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mist-100">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-mist-50">
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/anfragen/${request.id}`}
                      className="font-semibold text-accent-600 hover:underline"
                    >
                      {request.referenceNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-night-900">{request.company}</p>
                    <p className="text-xs text-mist-500">{request.contactName}</p>
                  </td>
                  <td className="px-5 py-3 text-mist-500">
                    {request.pickupCountry} nach {request.deliveryCountry}
                  </td>
                  <td className="px-5 py-3 text-mist-500">
                    {formatDateTime(request.createdAt)}
                  </td>
                  <td className="px-5 py-3">
                    <StatusSelect
                      id={request.id}
                      status={request.status}
                      options={statusOptions}
                      action={updateTransportRequestStatus}
                    />
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
