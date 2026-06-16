// Gemeinsame E-Mail-Helfer für Editor (Client) und Versand (Server).
import { company } from "@/data/company";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://ltslogistik.de"
).replace(/\/+$/, "");
const LOGO_URL = `${SITE_URL}/logo.png`;
const DOMAIN = SITE_URL.replace(/^https?:\/\//, "");

// Wandelt Klartext mit Absätzen in einfache HTML-Absätze um.
export function textToHtml(text: string): string {
  return text
    .split(/\n\s*\n/)
    .map(
      (paragraph) =>
        `<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#0b0f1a">${paragraph
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/\n/g, "<br/>")}</p>`
    )
    .join("");
}

// Bettet beliebigen Inhalts-HTML in das gebrandete E-Mail-Layout ein:
// dunkler Kopf mit Logo, roter Akzentstreifen, Inhalt, Firmen-Fußzeile.
export function brandedEmail(contentHtml: string): string {
  return `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
</head>
<body style="margin:0;padding:0;background:#eef1f5;font-family:'Segoe UI',Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef1f5">
    <tr>
      <td align="center" style="padding:32px 14px">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px">
          <tr>
            <td style="background:#0b101d;border-radius:18px 18px 0 0;padding:24px 32px">
              <img src="${LOGO_URL}" alt="${company.legalName}" height="36" style="height:36px;width:auto;display:block;border:0;outline:none;text-decoration:none">
            </td>
          </tr>
          <tr><td style="height:4px;line-height:4px;font-size:0;background:#e11d24">&nbsp;</td></tr>
          <tr>
            <td style="background:#ffffff;padding:34px 32px;color:#0b0f1a;font-size:15px;line-height:1.65">
              ${contentHtml}
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;border-radius:0 0 18px 18px;border-top:1px solid #eef1f5;padding:22px 32px">
              <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#0b0f1a">${company.legalName}</p>
              <p style="margin:0;font-size:12px;line-height:1.7;color:#6b7585">
                ${company.address.street} &middot; ${company.address.zip} ${company.address.city}<br>
                <a href="${company.phoneHref}" style="color:#6b7585;text-decoration:none">${company.phone}</a> &middot;
                <a href="mailto:${company.email}" style="color:#6b7585;text-decoration:none">${company.email}</a> &middot;
                <a href="${SITE_URL}" style="color:#e11d24;text-decoration:none;font-weight:600">${DOMAIN}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:16px 8px">
              <p style="margin:0;font-size:11px;color:#9aa4b2">Diese Nachricht wurde automatisch über ${DOMAIN} versendet.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Reduziert HTML grob auf Klartext (für den Text-Teil der E-Mail).
export function htmlToText(html: string): string {
  return html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/\s*(p|div|h[1-6]|li)\s*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
