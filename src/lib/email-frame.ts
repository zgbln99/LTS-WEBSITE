// Gemeinsame E-Mail-Helfer für Editor (Client) und Versand (Server).

// Wandelt Klartext mit Absätzen in einfache HTML-Absätze um.
export function textToHtml(text: string): string {
  return text
    .split(/\n\s*\n/)
    .map(
      (paragraph) =>
        `<p>${paragraph
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/\n/g, "<br/>")}</p>`
    )
    .join("");
}

// Bettet beliebigen Inhalts-HTML in das gebrandete E-Mail-Layout ein.
export function brandedEmail(contentHtml: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;background:#f7f8fa;font-family:Arial,Helvetica,sans-serif">
    <div style="max-width:600px;margin:0 auto;padding:32px 16px">
      <div style="background:#0b101d;border-radius:16px 16px 0 0;padding:22px 28px">
        <span style="color:#ffffff;font-size:18px;font-weight:bold">LTS Logistik</span>
      </div>
      <div style="background:#ffffff;border-radius:0 0 16px 16px;padding:28px;color:#0b0f1a;font-size:15px;line-height:1.65">
        ${contentHtml}
        <p style="margin:24px 0 0;color:#6b7585;font-size:13px">LTS Logistik GmbH · Hennickendorfer Str. 1 · 14947 Nuthe-Urstromtal</p>
      </div>
    </div>
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
