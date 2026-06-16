import { getTranslationSettings } from "@/server/site-settings";

export interface GermanLocation {
  postalCode: string;
  region: string; // Bundesland
  country: string;
}

// Ergänzt zu einer Ortsangabe (Stadt) per OpenAI eine repräsentative
// Postleitzahl, das Bundesland und das Land. Für die strukturierten Daten
// (Google for Jobs) reicht eine repräsentative PLZ des Ortes.
export async function lookupGermanLocation(
  place: string
): Promise<GermanLocation | null> {
  const trimmed = place.trim();
  if (!trimmed) return null;

  const { openaiKey, openaiModel } = await getTranslationSettings();
  if (!openaiKey) return null;

  const system =
    "You are a precise geographic database for the DACH region (focus Germany). " +
    "Given a place or city name (possibly with a district in parentheses), return its data. " +
    "Use the German federal state (Bundesland) for 'region'. " +
    "For 'postalCode' return one representative 5-digit German postal code (PLZ) of that place. " +
    "For 'country' return the country name in German (e.g. 'Deutschland', 'Österreich', 'Polen'). " +
    'Reply ONLY with JSON: {"postalCode":"","region":"","country":""}. ' +
    "If a value is unknown, use an empty string.";

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: openaiModel,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: `Ort: ${trimmed}` }
        ]
      })
    });

    if (!response.ok) {
      console.error("OpenAI-Geo-Fehler:", response.status, await response.text());
      return null;
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content) as Partial<GermanLocation>;
    return {
      postalCode: String(parsed.postalCode ?? "").trim(),
      region: String(parsed.region ?? "").trim(),
      country: String(parsed.country ?? "").trim() || "Deutschland"
    };
  } catch (error) {
    console.error("Standort konnte nicht ermittelt werden:", error);
    return null;
  }
}
