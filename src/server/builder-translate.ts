import type { Data } from "@measured/puck";
import { translateBatch } from "@/server/translate";

// Feldnamen, die im Page-Builder menschlichen Text enthalten (und daher
// übersetzt werden). Bild-/Link-/Layout-Felder sind bewusst nicht enthalten.
const TEXT_KEYS = new Set([
  "eyebrow",
  "title",
  "subtitle",
  "description",
  "text",
  "html",
  "specs",
  "question",
  "answer",
  "primaryLabel",
  "secondaryLabel",
  "ctaLabel",
  "label",
  "alt"
]);

function hasLetters(value: string) {
  return /\p{L}/u.test(value);
}

// Übersetzt alle Textfelder einer Builder-Seite in eine Zielsprache und
// liefert eine Kopie der Daten zurück (eine OpenAI-Anfrage pro Seite/Sprache).
export async function translatePageData(
  data: Data,
  targetLocale: string,
  sourceLocale: string
): Promise<Data | null> {
  const clone = JSON.parse(JSON.stringify(data)) as Data;
  const texts: string[] = [];
  const setters: ((value: string) => void)[] = [];

  const walk = (node: unknown) => {
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (node && typeof node === "object") {
      const record = node as Record<string, unknown>;
      for (const key of Object.keys(record)) {
        const value = record[key];
        if (typeof value === "string") {
          if (TEXT_KEYS.has(key) && value.trim() && hasLetters(value)) {
            texts.push(value);
            setters.push((v) => {
              record[key] = v;
            });
          }
        } else {
          walk(value);
        }
      }
    }
  };

  walk(clone);
  if (texts.length === 0) return clone;

  const translated = await translateBatch(texts, targetLocale, sourceLocale, {
    html: true
  });
  if (!translated) return null;

  setters.forEach((set, index) => set(translated[index]));
  return clone;
}
