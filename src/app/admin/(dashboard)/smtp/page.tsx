import { redirect } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { requireRole } from "@/auth";
import { SmtpTester } from "@/components/admin/smtp-tester";
import { getMailConfigSummary } from "@/server/mailer";

export const dynamic = "force-dynamic";

export const metadata = { title: "SMTP-Test" };

export default async function SmtpAdminPage() {
  const session = await requireRole(["SUPER_ADMIN"]);
  if (!session) redirect("/admin");

  const summary = getMailConfigSummary();

  const rows: [string, string][] = [
    ["Server", summary.host || "nicht gesetzt"],
    ["Port", String(summary.port)],
    ["Verschlüsselung", summary.secure ? "SSL/TLS (secure)" : "STARTTLS"],
    ["Benutzer", summary.user || "nicht gesetzt"],
    ["Absenderadresse", summary.from || "nicht gesetzt"]
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-night-900">
          SMTP-Test
        </h1>
        <p className="mt-1 text-sm text-mist-500">
          Überprüft den E-Mail-Versand für Bewerbungs- und Kontaktbenachrichtigungen.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-base font-bold text-night-900">
            Aktuelle Konfiguration
          </h2>
          {summary.configured ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mint-400/10 px-3 py-1 text-xs font-semibold text-mint-500">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Konfiguriert
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
              <XCircle className="h-3.5 w-3.5" />
              Nicht konfiguriert
            </span>
          )}
        </div>
        <dl className="mt-4 divide-y divide-mist-100">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 py-2.5">
              <dt className="text-sm text-mist-500">{label}</dt>
              <dd className="text-sm font-medium text-night-900">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs text-mist-400">
          Diese Werte stammen aus der .env-Datei auf dem Server (SMTP_HOST,
          SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASSWORD, EMAIL_FROM).
        </p>
      </div>

      <SmtpTester
        configured={summary.configured}
        defaultRecipient={session.user.email}
      />
    </div>
  );
}
