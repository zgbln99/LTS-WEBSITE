// Hilfsfunktionen für Rich-Text-Felder, die HTML speichern, aber mit alten
// Klartext-Inhalten abwärtskompatibel bleiben müssen (z.B. Stellenbeschreibung).

// Erkennt, ob ein String bereits HTML-Auszeichnung enthält.
export function looksLikeHtml(value: string): boolean {
  return /<(p|h[1-6]|ul|ol|li|strong|em|b|i|u|br|span|a|blockquote)\b[^>]*>/i.test(
    value
  );
}

// Wandelt Klartext (mit Zeilenumbrüchen) in einfache <p>-Absätze um.
export function plainTextToHtml(value: string): string {
  const blocks = value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${escapeHtml(line)}</p>`);
  return blocks.join("") || "<p></p>";
}

// Liefert HTML zur Anzeige/Bearbeitung: bereits HTML wird übernommen,
// Klartext wird in Absätze umgewandelt.
export function toRichHtml(value: string | null | undefined): string {
  const text = value ?? "";
  if (!text.trim()) return "<p></p>";
  return looksLikeHtml(text) ? text : plainTextToHtml(text);
}

// Entfernt alle Tags und liefert reinen Text (z.B. für Meta-Descriptions).
export function htmlToPlainText(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Wandelt eine Liste (altes Format: string[]) oder einen bereits formatierten
// HTML-String in HTML um. Leere Eingaben ergeben einen leeren String.
export function listToHtml(value: unknown): string {
  if (Array.isArray(value)) {
    const items = value.filter(
      (entry): entry is string => typeof entry === "string" && entry.trim() !== ""
    );
    if (items.length === 0) return "";
    return `<ul>${items.map((entry) => `<li>${escapeHtml(entry)}</li>`).join("")}</ul>`;
  }
  if (typeof value === "string" && value.trim()) {
    return looksLikeHtml(value)
      ? value
      : `<ul><li>${escapeHtml(value)}</li></ul>`;
  }
  return "";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
