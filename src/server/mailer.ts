import nodemailer, { type Transporter } from "nodemailer";
import { getSmtpSettings } from "@/server/site-settings";

export interface MailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

let cached: { key: string; transporter: Transporter } | null = null;

// Liefert die internen Empfänger (HR / Anfragen) aus den Einstellungen.
export async function getMailRecipients() {
  const cfg = await getSmtpSettings();
  return { hr: cfg.hrRecipient, inquiries: cfg.inquiriesRecipient };
}

// Zusammenfassung der aktiven SMTP-Einstellungen (ohne Passwort) für die Diagnose.
export async function getMailConfigSummary() {
  const cfg = await getSmtpSettings();
  return {
    configured: Boolean(cfg.host && cfg.user),
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    user: cfg.user,
    from: cfg.from,
    hrRecipient: cfg.hrRecipient,
    inquiriesRecipient: cfg.inquiriesRecipient
  };
}

// Prüft Verbindung und Login beim SMTP-Server (ohne eine Mail zu senden).
export async function verifyMailConnection() {
  const cfg = await getSmtpSettings();
  if (!cfg.host || !cfg.user) return false;
  await getTransporter(cfg).verify();
  return true;
}

function getTransporter(cfg: {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
}): Transporter {
  const key = `${cfg.host}:${cfg.port}:${cfg.secure}:${cfg.user}`;
  if (cached && cached.key === key) return cached.transporter;
  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.password }
  });
  cached = { key, transporter };
  return transporter;
}

export async function sendMail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  attachments?: MailAttachment[];
}) {
  const cfg = await getSmtpSettings();
  if (!cfg.host || !cfg.user) {
    console.warn("SMTP nicht konfiguriert, E-Mail wird übersprungen:", options.subject);
    return false;
  }
  await getTransporter(cfg).sendMail({
    from: cfg.from,
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

// Freundliches, an den Absender gerichtetes Bestätigungs-Layout.
// Wandelt den vorhandenen Textkörper in formatiertes HTML um.
export function confirmationHtml(bodyText: string) {
  const paragraphs = bodyText
    .split(/\n\s*\n/)
    .map(
      (paragraph) =>
        `<p style="margin:0 0 14px;color:#0b0f1a;font-size:15px;line-height:1.65">${escapeHtml(
          paragraph
        ).replace(/\n/g, "<br/>")}</p>`
    )
    .join("");

  return `<!doctype html><html><body style="margin:0;background:#f7f8fa;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:640px;margin:0 auto;padding:32px 16px">
    <div style="background:#0b101d;border-radius:16px 16px 0 0;padding:22px 28px">
      <span style="color:#ffffff;font-size:18px;font-weight:bold">LTS Logistik</span>
    </div>
    <div style="background:#ffffff;border-radius:0 0 16px 16px;padding:28px">
      ${paragraphs}
    </div>
  </div>
</body></html>`;
}
