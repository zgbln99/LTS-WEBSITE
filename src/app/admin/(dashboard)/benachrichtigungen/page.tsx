import { redirect } from "next/navigation";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { requireRole } from "@/auth";
import { prisma } from "@/server/db";
import { safeQuery } from "@/server/safe";
import { ResendButton } from "@/components/admin/resend-button";
import {
  DbErrorBanner,
  EmptyState,
  formatDateTime
} from "@/components/admin/admin-ui";
import type { NotificationKind } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata = { title: "Benachrichtigungen" };

const kindLabels: Record<NotificationKind, string> = {
  APPLICATION: "Bewerbung",
  CONTACT: "Kontaktanfrage",
  CALLBACK: "Rückrufbitte",
  TRANSPORT: "Transportanfrage",
  CONFIRMATION: "Bestätigung an Absender"
};

export default async function NotificationsPage() {
  const session = await requireRole(["SUPER_ADMIN", "HR", "MARKETING"]);
  if (!session) redirect("/admin");

  const entries = await safeQuery(() =>
    prisma.mailNotification.findMany({
      orderBy: { createdAt: "desc" },
      take: 200
    })
  );

  const failedCount = entries?.filter((e) => e.status === "FAILED").length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-night-900">
          Benachrichtigungen
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-mist-500">
          Protokoll aller internen E-Mail-Benachrichtigungen. Fehlgeschlagene
          Mails können erneut gesendet werden, sobald der SMTP-Server wieder
          erreichbar ist (Anhänge werden dabei nicht erneut angehängt).
        </p>
      </div>

      {failedCount > 0 ? (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {failedCount} fehlgeschlagene Benachrichtigung
          {failedCount === 1 ? "" : "en"} warten auf einen erneuten Versand.
        </div>
      ) : null}

      {!entries ? (
        <DbErrorBanner />
      ) : entries.length === 0 ? (
        <EmptyState text="Noch keine Benachrichtigungen versendet." />
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const failed = entry.status === "FAILED";
            return (
              <div
                key={entry.id}
                className={
                  failed
                    ? "rounded-2xl border border-red-200 bg-white p-5 shadow-card"
                    : "rounded-2xl bg-white p-5 shadow-card"
                }
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {failed ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Fehlgeschlagen
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-mint-400/10 px-2.5 py-1 text-xs font-semibold text-mint-500">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Gesendet
                        </span>
                      )}
                      <span className="rounded-full bg-mist-100 px-2.5 py-1 text-xs font-semibold text-night-700">
                        {kindLabels[entry.kind]}
                      </span>
                    </div>
                    <p className="mt-2 truncate font-medium text-night-900">
                      {entry.subject}
                    </p>
                    <p className="mt-0.5 text-xs text-mist-500">
                      An {entry.recipient} · {formatDateTime(entry.createdAt)}
                      {entry.attempts > 1 ? ` · ${entry.attempts} Versuche` : ""}
                    </p>
                  </div>
                  {failed ? <ResendButton id={entry.id} /> : null}
                </div>
                {failed && entry.error ? (
                  <p className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 font-mono text-xs text-red-700">
                    {entry.error}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
