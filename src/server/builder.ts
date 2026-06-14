import sanitizeHtml from "sanitize-html";
import type { Data } from "@measured/puck";
import { prisma } from "@/server/db";
import { safeQuery } from "@/server/safe";
import { pickTranslation } from "@/server/content";
import type { BuilderPageKey } from "@/builder/defaults";

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "a",
    "ul",
    "ol",
    "li",
    "h2",
    "h3",
    "h4",
    "blockquote",
    "span"
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    p: ["style"],
    h2: ["style"],
    h3: ["style"],
    h4: ["style"],
    li: ["style"]
  },
  allowedStyles: {
    "*": { "text-align": [/^left$|^center$|^right$|^justify$/] }
  },
  allowedSchemes: ["http", "https", "mailto", "tel"]
};

// Bereinigt alle HTML-Strings in den Builder-Daten (XSS-Schutz).
export function sanitizeBuilderData<T>(node: T): T {
  if (typeof node === "string") {
    return (node.includes("<")
      ? sanitizeHtml(node, SANITIZE_OPTIONS)
      : node) as T;
  }
  if (Array.isArray(node)) {
    return node.map((entry) => sanitizeBuilderData(entry)) as T;
  }
  if (typeof node === "object" && node !== null) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(node)) {
      result[key] = sanitizeBuilderData(value);
    }
    return result as T;
  }
  return node;
}

function isValidData(value: unknown): value is Data {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as { content?: unknown }).content) &&
    (value as { content: unknown[] }).content.length > 0
  );
}

// Veröffentlichte Builder-Daten einer Seite (Fallback auf Deutsch).
export async function getPublishedPageData(
  key: BuilderPageKey,
  locale: string
): Promise<Data | null> {
  const page = await safeQuery(() =>
    prisma.page.findUnique({
      where: { key },
      include: { translations: true }
    })
  );
  if (!page || page.status !== "PUBLISHED") return null;

  const translation = pickTranslation(page.translations, locale);
  if (!translation || !isValidData(translation.content)) return null;
  return translation.content as unknown as Data;
}

// Entwurf (oder veröffentlichte Version) für den Editor laden.
export async function getEditorPageData(
  key: BuilderPageKey,
  locale: string
): Promise<{ data: Data | null; hasPublished: boolean }> {
  const page = await safeQuery(() =>
    prisma.page.findUnique({
      where: { key },
      include: { translations: { where: { locale } } }
    })
  );
  const translation = page?.translations[0];
  if (!translation) return { data: null, hasPublished: false };

  const hasPublished = isValidData(translation.content);
  if (isValidData(translation.draft)) {
    return { data: translation.draft as unknown as Data, hasPublished };
  }
  if (hasPublished) {
    return { data: translation.content as unknown as Data, hasPublished };
  }
  return { data: null, hasPublished: false };
}
