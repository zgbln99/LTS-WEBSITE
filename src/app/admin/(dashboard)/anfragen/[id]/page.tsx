import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/auth";
import { prisma } from "@/server/db";
import { safeQuery } from "@/server/safe";
import { updateTransportRequestStatus } from "@/server/actions/admin";
import { StatusSelect } from "@/components/admin/status-select";
import {
  AdminCard,
  formatDateTime,
  requestStatusLabels
} from "@/components/admin/admin-ui";
import { RequestStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const statusOptions = Object.values(RequestStatus).map((status) => ({
  value: status,
  label: requestStatusLabels[status]
}));

export default async function TransportRequestDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(["SUPER_ADMIN", "MARKETING"]);
  if (!session) redirect("/admin");

  const { id } = await params;
  const request = await safeQuery(() =>
    prisma.transportRequest.findUnique({ where: { id } })
  );
  if (!request) notFound();

  const format = (value: number | null, unit = "") =>
    value === null ? "" : `${value}${unit}`;

  const sections: { title: string; rows: [string, string][] }[] = [
    {
      title: "Kontakt",
      rows: [
        ["Firma", request.company],
        ["Ansprechpartner", request.contactName],
        ["E-Mail", request.email],
        ["Telefon", request.phone],
        ["Sprache", request.locale]
      ]
    },
    {
      title: "Strecke",
      rows: [
        ["Abholung", `${request.pickupAddress}, ${request.pickupCountry}`],
        ["Zustellung", `${request.deliveryAddress}, ${request.deliveryCountry}`],
        ["Wunschtermin", request.requestedDate ? formatDateTime(request.requestedDate) : ""]
      ]
    },
    {
      title: "Ladung",
      rows: [
        ["Ware", request.cargoType],
        ["Paletten", format(request.palletCount)],
        ["Gewicht", format(request.weightKg, " kg")],
        ["Länge", format(request.lengthM, " m")],
        ["Breite", format(request.widthM, " m")],
        ["Höhe", format(request.heightM, " m")],
        ["Temperatur min.", format(request.temperatureMin, " °C")],
        ["Temperatur max.", format(request.temperatureMax, " °C")],
        ["Nachricht", request.message ?? ""]
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/anfragen"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-mist-500 hover:text-night-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Alle Transportanfragen
          </Link>
          <h1 className="mt-2 font-display text-2xl font-extrabold text-night-900">
            {request.referenceNumber}
          </h1>
          <p className="text-sm text-mist-500">
            Eingegangen am {formatDateTime(request.createdAt)}
          </p>
        </div>
        <StatusSelect
          id={request.id}
          status={request.status}
          options={statusOptions}
          action={updateTransportRequestStatus}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {sections.map((section) => (
          <AdminCard key={section.title} title={section.title}>
            <dl className="space-y-2.5">
              {section.rows
                .filter(([, value]) => value !== "")
                .map(([label, value]) => (
                  <div key={label} className="flex gap-3 text-sm">
                    <dt className="w-32 shrink-0 text-mist-400">{label}</dt>
                    <dd className="whitespace-pre-wrap text-night-900">{value}</dd>
                  </div>
                ))}
            </dl>
          </AdminCard>
        ))}
      </div>

      <div className="flex gap-3">
        <a
          href={`mailto:${request.email}?subject=${encodeURIComponent(`Ihre Transportanfrage ${request.referenceNumber}`)}`}
          className="rounded-full bg-accent-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-600"
        >
          Per E-Mail antworten
        </a>
        <a
          href={`tel:${request.phone.replace(/\s/g, "")}`}
          className="rounded-full border border-mist-300 px-5 py-2.5 text-sm font-medium text-night-900 hover:border-night-900"
        >
          Anrufen
        </a>
      </div>
    </div>
  );
}
