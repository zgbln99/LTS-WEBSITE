import nodemailer, { type Transporter } from "nodemailer";

export interface MailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

let cached: Transporter | null = null;

export function isMailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);
}

// Zusammenfassung der aktiven SMTP-Einstellungen (ohne Passwort) für die Diagnose.
export function getMailConfigSummary() {
  return {
    configured: isMailConfigured(),
    host: process.env.SMTP_HOST ?? "",
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: (process.env.SMTP_SECURE ?? "true") === "true",
    user: process.env.SMTP_USER ?? "",
    from: process.env.EMAIL_FROM ?? process.env.SMTP_USER ?? ""
  };
}

// Prüft Verbindung und Login beim SMTP-Server (ohne eine Mail zu senden).
export async function verifyMailConnection() {
  if (!isMailConfigured()) return false;
  await getTransporter().verify();
  return true;
}

function getTransporter(): Transporter {
  if (cached) return cached;
  cached = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: (process.env.SMTP_SECURE ?? "true") === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
  return cached;
}

export async function sendMail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  attachments?: MailAttachment[];
}) {
  if (!isMailConfigured()) {
    console.warn("SMTP nicht konfiguriert, E-Mail wird übersprungen:", options.subject);
    return false;
  }
  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM ?? process.env.SMTP_USER,
    ...options
  });
  return true;
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

// Schlichtes, robustes HTML-Layout für interne Benachrichtigungen
export function notificationHtml(title: string, rows: [string, string][]) {
  const body = rows
    .filter(([, value]) => value !== "")
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#6b7585;font-size:13px;white-space:nowrap;vertical-align:top">${escapeHtml(label)}</td><td style="padding:6px 0;color:#0b0f1a;font-size:14px">${escapeHtml(value).replace(/\n/g, "<br/>")}</td></tr>`
    )
    .join("");

  return `<!doctype html><html><body style="margin:0;background:#f7f8fa;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:640px;margin:0 auto;padding:32px 16px">
    <div style="background:#0b101d;border-radius:16px 16px 0 0;padding:20px 28px">
      <span style="color:#ffffff;font-size:16px;font-weight:bold">LTS Logistik</span>
    </div>
    <div style="background:#ffffff;border-radius:0 0 16px 16px;padding:28px">
      <h1 style="margin:0 0 16px;font-size:18px;color:#0b0f1a">${escapeHtml(title)}</h1>
      <table style="border-collapse:collapse;width:100%">${body}</table>
    </div>
  </div>
</body></html>`;
}

export function notificationText(title: string, rows: [string, string][]) {
  return [
    title,
    "",
    ...rows
      .filter(([, value]) => value !== "")
      .map(([label, value]) => `${label}: ${value}`)
  ].join("\n");
}
