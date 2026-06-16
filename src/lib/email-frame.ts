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

// Roter, abgerundeter Call-to-Action-Button für E-Mails.
export function emailButton(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:26px 0 6px">
    <tr><td align="center" bgcolor="#e11d24" style="border-radius:999px">
      <a href="${href}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px">${label}</a>
    </td></tr>
  </table>`;
}

// Bettet beliebigen Inhalts-HTML in das gebrandete E-Mail-Layout ein:
// dunkler Kopf mit zentriertem Logo, roter Akzent, weiße Karte, Fußzeile.
export function brandedEmail(contentHtml: string): string {
  const social = [
    company.social?.facebook
      ? `<a href="${company.social.facebook}" style="color:#9aa4b2;text-decoration:none;font-weight:600">Facebook</a>`
      : "",
    company.social?.linkedin
      ? `<a href="${company.social.linkedin}" style="color:#9aa4b2;text-decoration:none;font-weight:600">LinkedIn</a>`
      : ""
  ]
    .filter(Boolean)
    .join('<span style="color:#cbd2db"> &nbsp;·&nbsp; </span>');

  return `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
</head>
<body style="margin:0;padding:0;background:#eceef3;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eceef3">
    <tr>
      <td align="center" style="padding:36px 14px">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;border-radius:22px;overflow:hidden;box-shadow:0 18px 48px rgba(11,16,29,0.12)">
          <!-- Kopf -->
          <tr>
            <td align="center" style="background:#0b101d;background-image:linear-gradient(135deg,#0b101d 0%,#161d33 100%);padding:34px 32px 30px">
              <img src="${LOGO_URL}" alt="${company.legalName}" height="42" style="height:42px;width:auto;display:block;border:0;outline:none;text-decoration:none">
            </td>
          </tr>
          <tr><td style="height:5px;line-height:5px;font-size:0;background:#e11d24">&nbsp;</td></tr>
          <!-- Inhalt -->
          <tr>
            <td style="background:#ffffff;padding:40px 38px 34px;color:#1a2030;font-size:15px;line-height:1.7">
              ${contentHtml}
            </td>
          </tr>
          <!-- Fußzeile -->
          <tr>
            <td style="background:#f7f8fb;border-top:1px solid #eceef3;padding:28px 38px 30px" align="center">
              <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#1a2030">${company.legalName}</p>
              <p style="margin:0 0 14px;font-size:12.5px;line-height:1.8;color:#7a8493">
                ${company.address.street} &middot; ${company.address.zip} ${company.address.city}<br>
                <a href="${company.phoneHref}" style="color:#7a8493;text-decoration:none">${company.phone}</a> &nbsp;·&nbsp;
                <a href="mailto:${company.email}" style="color:#7a8493;text-decoration:none">${company.email}</a>
              </p>
              <p style="margin:0 0 10px">
                <a href="${SITE_URL}" style="display:inline-block;font-size:13px;font-weight:700;color:#e11d24;text-decoration:none;letter-spacing:0.02em">${DOMAIN}</a>
              </p>
              ${social ? `<p style="margin:0;font-size:12px">${social}</p>` : ""}
            </td>
          </tr>
        </table>
        <p style="margin:18px 0 0;font-size:11px;color:#aab2bf">Diese Nachricht wurde automatisch über ${DOMAIN} versendet.</p>
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
