import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { requireRole } from "@/auth";
import { prisma } from "@/server/db";
import { safeQuery } from "@/server/safe";
import { getMailConfigSummary } from "@/server/mailer";
import { isMediaStorageConfigured, isS3Configured } from "@/server/s3";

export const dynamic = "force-dynamic";

export const metadata = { title: "System" };

type State = "ok" | "warn" | "error";

function StateIcon({ state }: { state: State }) {
  if (state === "ok") return <CheckCircle2 className="h-5 w-5 text-mint-500" />;
  if (state === "warn") return <AlertTriangle className="h-5 w-5 text-amber-500" />;
  return <XCircle className="h-5 w-5 text-red-600" />;
}

export default async function SystemPage() {
  const session = await requireRole(["SUPER_ADMIN"]);
  if (!session) redirect("/admin");

  // Datenbank: einfache Abfrage als Erreichbarkeitstest
  const jobCount = await safeQuery(() =>
    prisma.jobPosting.count({ where: { status: "PUBLISHED" } })
  );
  const dbOk = jobCount !== null;

  const failedNotifications =
    (await safeQuery(() =>
      prisma.mailNotification.count({ where: { status: "FAILED" } })
    )) ?? 0;

  const summary = await getMailConfigSummary();
  const s3 = isS3Configured();
  const media = isMediaStorageConfigured();
  const mapbox = Boolean(process.env.NEXT_PUBLIC_MAPBOX_TOKEN);

  const checks: {
    label: string;
    state: State;
    detail: string;
    href?: string;
  }[] = [
    {
      label: "Datenbank",
      state: dbOk ? "ok" : "error",
      detail: dbOk
        ? `Erreichbar · ${jobCount} veröffentlichte Stellen`
        : "Keine Verbindung zur Datenbank."
    },
    {
      label: "E-Mail-Versand (SMTP)",
      state: summary.configured ? "ok" : "error",
      detail: summary.configured
        ? `${summary.host}:${summary.port} · ${summary.user}`
        : "Nicht konfiguriert.",
      href: "/admin/einstellungen"
    },
    {
      label: "Fehlgeschlagene Benachrichtigungen",
      state: failedNotifications === 0 ? "ok" : "warn",
      detail:
        failedNotifications === 0
          ? "Alle Benachrichtigungen wurden zugestellt."
          : `${failedNotifications} warten auf erneuten Versand.`,
      href: "/admin/benachrichtigungen"
    },
    {
      label: "Datei-Uploads (S3)",
      state: s3 ? "ok" : "warn",
      detail: s3
        ? "Konfiguriert. Bewerbungsdateien werden gespeichert."
        : "Nicht konfiguriert. Anhänge nur per E-Mail."
    },
    {
      label: "Medien-Speicher (MEGA S4)",
      state: media ? "ok" : "warn",
      detail: media
        ? `Öffentlicher Bucket aktiv. Editor-Bilder werden hier abgelegt.`
        : "Nicht konfiguriert. Bilder liegen lokal unter /uploads."
    },
    {
      label: "Karte (Mapbox)",
      state: mapbox ? "ok" : "warn",
      detail: mapbox
        ? "Token vorhanden."
        : "Kein Token. Die Karte wird nicht angezeigt."
    }
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-night-900">
          System
        </h1>
        <p className="mt-1 text-sm text-mist-500">
          Statusüberblick über die wichtigsten Dienste der Website.
        </p>
      </div>

      <div className="divide-y divide-mist-100 overflow-hidden rounded-2xl bg-white shadow-card">
        {checks.map((check) => (
          <div
            key={check.label}
            className="flex items-center justify-between gap-4 px-5 py-4"
          >
            <div className="flex items-center gap-3">
              <StateIcon state={check.state} />
              <div>
                <p className="font-medium text-night-900">{check.label}</p>
                <p className="text-sm text-mist-500">{check.detail}</p>
              </div>
            </div>
            {check.href ? (
              <Link
                href={check.href}
                className="shrink-0 text-sm font-semibold text-accent-600 hover:underline"
              >
                Öffnen
              </Link>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
