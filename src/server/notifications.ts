import type { NotificationKind } from "@prisma/client";
import { prisma } from "@/server/db";
import { safeQuery } from "@/server/safe";
import { sendMail, type MailAttachment } from "@/server/mailer";

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

// Sendet eine interne Benachrichtigung und protokolliert das Ergebnis.
// Anhänge werden mitgesendet, aber nicht gespeichert (für einen erneuten
// Versand stehen Betreff und Inhalt zur Verfügung, nicht die Dateien).
export async function sendInternalNotification(input: {
  kind: NotificationKind;
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  reference?: string;
  attachments?: MailAttachment[];
}): Promise<boolean> {
  let ok = false;
  let error: string | null = null;

  try {
    ok = await sendMail({
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
      replyTo: input.replyTo,
      attachments: input.attachments
    });
    if (!ok) error = "SMTP ist nicht konfiguriert.";
  } catch (caught) {
    error = describeError(caught);
  }

  await safeQuery(() =>
    prisma.mailNotification.create({
      data: {
        kind: input.kind,
        recipient: input.to,
        subject: input.subject,
        bodyText: input.text,
        bodyHtml: input.html ?? null,
        replyTo: input.replyTo ?? null,
        reference: input.reference ?? null,
        status: ok ? "SENT" : "FAILED",
        error,
        sentAt: ok ? new Date() : null
      }
    })
  );

  return ok;
}

// Versucht eine protokollierte Benachrichtigung erneut zu senden.
export async function resendNotification(id: string): Promise<boolean> {
  const entry = await safeQuery(() =>
    prisma.mailNotification.findUnique({ where: { id } })
  );
  if (!entry) return false;

  let ok = false;
  let error: string | null = null;
  try {
    ok = await sendMail({
      to: entry.recipient,
      subject: entry.subject,
      text: entry.bodyText,
      html: entry.bodyHtml ?? undefined,
      replyTo: entry.replyTo ?? undefined
    });
    if (!ok) error = "SMTP ist nicht konfiguriert.";
  } catch (caught) {
    error = describeError(caught);
  }

  await safeQuery(() =>
    prisma.mailNotification.update({
      where: { id },
      data: {
        status: ok ? "SENT" : "FAILED",
        error,
        attempts: { increment: 1 },
        sentAt: ok ? new Date() : entry.sentAt
      }
    })
  );

  return ok;
}
