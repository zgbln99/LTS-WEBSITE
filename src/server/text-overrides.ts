import { unstable_cache } from "next/cache";
import { prisma } from "@/server/db";

export const TEXTS_CACHE_TAG = "site-texts";

// Setzt einen Wert anhand eines Punkt-Schlüssels ("home.hero.title",
// "career.benefits.0") in ein verschachteltes Messages-Objekt.
function setByPath(target: Record<string, unknown>, key: string, value: string) {
  const parts = key.split(".");
  let node: Record<string, unknown> = target;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i];
    const next = (node as Record<string, unknown>)[part];
    if (typeof next !== "object" || next === null) return;
    node = next as Record<string, unknown>;
  }
  const last = parts[parts.length - 1];
  if (last in node) {
    (node as Record<string, unknown>)[last] = value;
  }
}

const loadOverrides = unstable_cache(
  async (locale: string) => {
    try {
      const rows = await prisma.textOverride.findMany({ where: { locale } });
      return rows.map((row) => ({ key: row.key, value: row.value }));
    } catch (error) {
      console.error("Text-Overrides konnten nicht geladen werden:", error);
      return [];
    }
  },
  ["text-overrides"],
  { revalidate: 300, tags: [TEXTS_CACHE_TAG] }
);

export async function applyTextOverrides(
  locale: string,
  messages: Record<string, unknown>
) {
  const overrides = await loadOverrides(locale);
  if (overrides.length === 0) return messages;
  const merged = structuredClone(messages);
  for (const override of overrides) {
    setByPath(merged, override.key, override.value);
  }
  return merged;
}

// Flacht das Messages-Objekt zu Punkt-Schlüsseln ab (für die Admin-Liste).
export function flattenMessages(
  node: unknown,
  prefix = ""
): { key: string; value: string }[] {
  if (typeof node === "string") {
    return [{ key: prefix, value: node }];
  }
  if (Array.isArray(node)) {
    return node.flatMap((entry, index) =>
      flattenMessages(entry, prefix ? `${prefix}.${index}` : String(index))
    );
  }
  if (typeof node === "object" && node !== null) {
    return Object.entries(node).flatMap(([key, value]) =>
      flattenMessages(value, prefix ? `${prefix}.${key}` : key)
    );
  }
  return [];
}
