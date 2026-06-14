import {
  getTranslationSettings,
  translationEnabled
} from "@/server/site-settings";
import { locales } from "@/i18n/routing";

const LANGUAGE_NAMES: Record<string, string> = {
  de: "German",
  en: "English",
  pl: "Polish",
  tr: "Turkish",
  uk: "Ukrainian"
};

export async function isTranslationConfigured() {
  return translationEnabled(await getTranslationSettings());
}

// Übersetzt eine Liste von Texten mit der OpenAI-API in eine Zielsprache.
// Platzhalter ({name}, {reference}) und HTML-Tags bleiben erhalten.
async function openaiTranslate(
  apiKey: string,
  model: string,
  payload: string[],
  targetLocale: string,
  sourceLocale: string
): Promise<string[] | null> {
  const system =
    "You are a professional translator for a German logistics company (truck transport, driver recruitment). " +
    "Translate each string in the input array accurately and in a natural, professional tone. " +
    "Keep placeholders like {name} and {reference} and any HTML tags exactly as they are. " +
    'Reply ONLY with JSON of the form {"translations": ["...", "..."]} - same length and order as the input.';

  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          temperature: 0,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: system },
            {
              role: "user",
              content: `Translate from ${
                LANGUAGE_NAMES[sourceLocale] ?? sourceLocale
              } to ${
                LANGUAGE_NAMES[targetLocale] ?? targetLocale
              }.\nInput: ${JSON.stringify(payload)}`
            }
          ]
        })
      }
    );

    if (!response.ok) {
      console.error("OpenAI-Fehler:", response.status, await response.text());
      return null;
    }
    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = JSON.parse(content) as { translations?: unknown };
    const out = parsed.translations;
    if (!Array.isArray(out) || out.length !== payload.length) return null;
    return out.map((entry) => String(entry));
  } catch (error) {
    console.error("OpenAI-Anfrage fehlgeschlagen:", error);
    return null;
  }
}

// Übersetzt mehrere Texte in eine Zielsprache (eine OpenAI-Anfrage).
export async function translateBatch(
  texts: string[],
  targetLocale: string,
  sourceLocale: string,
  // options bleibt für die Aufrufkompatibilität erhalten (HTML wird im Prompt behandelt).
  _options: { html?: boolean } = {}
): Promise<string[] | null> {
  void _options;
  const settings = await getTranslationSettings();
  if (!settings.openaiKey) return null;
  if (targetLocale === sourceLocale) return texts;

  // Leere Strings nicht senden, Positionen aber erhalten.
  const indexMap: number[] = [];
  const payload: string[] = [];
  texts.forEach((text, index) => {
    if (text && text.trim()) {
      indexMap.push(index);
      payload.push(text);
    }
  });
  if (payload.length === 0) return texts;

  const translated = await openaiTranslate(
    settings.openaiKey,
    settings.openaiModel,
    payload,
    targetLocale,
    sourceLocale
  );
  if (!translated) return null;

  const result = [...texts];
  translated.forEach((value, i) => {
    result[indexMap[i]] = value;
  });
  return result;
}

// Übersetzt ein Feldset in alle Zielsprachen (außer der Quellsprache).
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
