import { requireRole } from "@/auth";
import { prisma } from "@/server/db";
import { applicationStatusLabels } from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

// Ein CSV-Feld für deutsches Excel sicher escapen (Semikolon als Trenner).
function cell(value: string | null | undefined) {
  const text = (value ?? "").replace(/\r?\n/g, " ").trim();
  if (/[";]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export async function GET() {
  const session = await requireRole(["SUPER_ADMIN", "HR"]);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const applications = await prisma.application.findMany({
    orderBy: { createdAt: "desc" },
    take: 5000
  });

  const header = [
    "Datum",
    "Vorname",
    "Nachname",
    "E-Mail",
    "Telefon",
    "Führerscheinklasse",
    "Status",
    "Quelle",
    "Sprache"
  ];

  const rows = applications.map((a) =>
    [
      a.createdAt.toISOString().slice(0, 16).replace("T", " "),
      a.firstName,
      a.lastName,
      a.email,
      a.phone,
      a.licenseClass ?? "",
      applicationStatusLabels[a.status],
      a.source?.replace("website:", "") ?? "",
      a.locale
    ]
      .map(cell)
      .join(";")
  );

  // BOM für korrekte Umlaute in Excel
  const csv = "﻿" + [header.join(";"), ...rows].join("\r\n");
  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bewerbungen-${date}.csv"`
    }
  });
}
