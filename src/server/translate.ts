import { getTranslationSettings } from "@/server/site-settings";
import { locales } from "@/i18n/routing";

// Zuordnung interner Sprachkürzel zu DeepL-Codes.
const TARGET_LANG: Record<string, string> = {
  de: "DE",
  en: "EN-GB",
  pl: "PL",
  tr: "TR",
  uk: "UK"
};
const SOURCE_LANG: Record<string, string> = {
  de: "DE",
  en: "EN",
  pl: "PL",
  tr: "TR",
  uk: "UK"
};

export async function isTranslationConfigured() {
  const settings = await getTranslationSettings();
  return Boolean(settings.deeplKey);
}

function endpointFor(key: string) {
  // Kostenlose DeepL-Schlüssel enden auf ":fx".
  return key.trim().endsWith(":fx")
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate";
}

// Übersetzt mehrere Texte in eine Zielsprache (eine DeepL-Anfrage).
export async function translateBatch(
  texts: string[],
  targetLocale: string,
  sourceLocale: string,
  options: { html?: boolean } = {}
): Promise<string[] | null> {
  const settings = await getTranslationSettings();
  if (!settings.deeplKey) return null;

  const target = TARGET_LANG[targetLocale];
  const source = SOURCE_LANG[sourceLocale];
  if (!target || target === TARGET_LANG[sourceLocale]) return texts;

  // Leere Strings nicht senden, aber Positionen erhalten.
  const indexMap: number[] = [];
  const payload: string[] = [];
  texts.forEach((text, index) => {
    if (text && text.trim()) {
      indexMap.push(index);
      payload.push(text);
    }
  });
  if (payload.length === 0) return texts;

  try {
    const response = await fetch(endpointFor(settings.deeplKey), {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${settings.deeplKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: payload,
        target_lang: target,
        source_lang: source,
        ...(options.html ? { tag_handling: "html" } : {})
      })
    });
    if (!response.ok) {
      console.error("DeepL-Fehler:", response.status, await response.text());
      return null;
    }
    const data = (await response.json()) as {
      translations: { text: string }[];
    };
    const result = [...texts];
    data.translations.forEach((translation, i) => {
      result[indexMap[i]] = translation.text;
    });
    return result;
  } catch (error) {
    console.error("DeepL-Anfrage fehlgeschlagen:", error);
    return null;
  }
}

// Übersetzt ein Feldset in alle Zielsprachen (außer der Quellsprache).
// Liefert pro Sprache ein Objekt mit denselben Feldnamen.
export async function translateFieldsToAll(
  fields: Record<string, string>,
  sourceLocale: string,
  options: { html?: boolean } = {}
): Promise<Record<string, Record<string, string>>> {
  const keys = Object.keys(fields);
  const values = keys.map((key) => fields[key]);
  const targets = locales.filter((locale) => locale !== sourceLocale);

  const out: Record<string, Record<string, string>> = {};
  await Promise.all(
    targets.map(async (locale) => {
      const translated = await translateBatch(
        values,
        locale,
        sourceLocale,
        options
      );
      if (translated) {
        out[locale] = Object.fromEntries(
          keys.map((key, i) => [key, translated[i]])
        );
      }
    })
  );
  return out;
}
