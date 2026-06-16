import nodemailer, { type Transporter } from "nodemailer";
import { getSmtpSettings } from "@/server/site-settings";
import { brandedEmail } from "@/lib/email-frame";

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

// HTML-Layout für interne Benachrichtigungen (im Marken-Rahmen mit Logo).
export function notificationHtml(title: string, rows: [string, string][]) {
  const body = rows
    .filter(([, value]) => value !== "")
    .map(
      ([label, value]) =>
        `<tr><td style="padding:7px 16px 7px 0;color:#6b7585;font-size:13px;white-space:nowrap;vertical-align:top;border-bottom:1px solid #f1f4f8">${escapeHtml(label)}</td><td style="padding:7px 0;color:#0b0f1a;font-size:14px;border-bottom:1px solid #f1f4f8">${escapeHtml(value).replace(/\n/g, "<br/>")}</td></tr>`
    )
    .join("");

  const content = `<h1 style="margin:0 0 6px;font-size:20px;line-height:1.3;color:#0b0f1a;font-weight:700">${escapeHtml(title)}</h1>
    <p style="margin:0 0 20px;font-size:13px;color:#6b7585">Eingegangen am ${escapeHtml(
      new Date().toLocaleString("de-DE", {
        dateStyle: "long",
        timeStyle: "short"
      })
    )} Uhr</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%">${body}</table>`;
  return brandedEmail(content);
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

// Freundliches, an den Absender gerichtetes Bestätigungs-Layout (Marken-Rahmen).
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

  return brandedEmail(paragraphs);
}
