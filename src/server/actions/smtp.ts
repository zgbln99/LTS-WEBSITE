"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { requireRole } from "@/auth";
import { writeAuditLog } from "@/server/audit";
import { formatDateTimeDe } from "@/lib/format-date";
import {
  getMailConfigSummary,
  notificationHtml,
  notificationText,
  sendMail,
  verifyMailConnection
} from "@/server/mailer";

export interface SmtpTestResult {
  ok: boolean;
  step: "config" | "verify" | "send" | "done";
  message: string;
}

const emailSchema = z.string().trim().email().max(160);

// Prüft die SMTP-Verbindung und sendet optional eine Testmail an die angegebene Adresse.
export async function testSmtpAction(recipient: string): Promise<SmtpTestResult> {
  const session = await requireRole(["SUPER_ADMIN"]);
  if (!session) redirect("/admin/login");

  const summary = await getMailConfigSummary();
  if (!summary.configured) {
    return {
      ok: false,
      step: "config",
      message:
        "SMTP ist nicht konfiguriert. Bitte SMTP_HOST und SMTP_USER in der .env-Datei setzen."
    };
  }

  const parsed = emailSchema.safeParse(recipient);
  if (!parsed.success) {
    return {
      ok: false,
      step: "config",
      message: "Bitte eine gültige Empfänger-E-Mail-Adresse eingeben."
    };
  }
  const to = parsed.data;

  // 1) Verbindung und Login prüfen
  try {
    await verifyMailConnection();
  } catch (error) {
    return {
      ok: false,
      step: "verify",
      message: `Verbindung zum SMTP-Server fehlgeschlagen: ${describeError(error)}`
    };
  }

  // 2) Testmail senden
  const now = formatDateTimeDe(new Date());
  const rows: [string, string][] = [
    ["Server", `${summary.host}:${summary.port}`],
    ["Verschlüsselung", summary.secure ? "SSL/TLS (secure)" : "STARTTLS"],
    ["Absender", summary.from],
    ["Ausgelöst von", session.user.email ?? session.user.name ?? "Admin"],
    ["Zeitpunkt", now]
  ];

  try {
    const sent = await sendMail({
      to,
      subject: "SMTP-Test - LTS Logistik Website",
      text: notificationText(
        "SMTP-Test erfolgreich. Der E-Mail-Versand der Website funktioniert.",
        rows
      ),
      html: notificationHtml(
        "SMTP-Test erfolgreich. Der E-Mail-Versand der Website funktioniert.",
        rows
      )
    });
    if (!sent) {
      return {
        ok: false,
        step: "send",
        message: "E-Mail konnte nicht gesendet werden (SMTP nicht konfiguriert)."
      };
    }
  } catch (error) {
    return {
      ok: false,
      step: "send",
      message: `Verbindung steht, aber der Versand schlug fehl: ${describeError(error)}`
    };
  }

  await writeAuditLog({
    userId: session.user.id,
    action: "CREATE",
    entityType: "SmtpTest",
    entityId: to
  });

  return {
    ok: true,
    step: "done",
    message: `Testmail wurde an ${to} gesendet. Bitte das Postfach (auch den Spam-Ordner) prüfen.`
  };
}

function describeError(error: unknown): string {
  if (error && typeof error === "object") {
    const candidate = error as { message?: string; code?: string; response?: string };
    const parts = [candidate.code, candidate.message ?? candidate.response].filter(
      Boolean
    );
    if (parts.length > 0) return parts.join(" - ");
  }
  return String(error);
}
