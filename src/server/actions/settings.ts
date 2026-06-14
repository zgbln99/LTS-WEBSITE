"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Prisma, type Role } from "@prisma/client";
import { requireRole } from "@/auth";
import { prisma } from "@/server/db";
import { writeAuditLog } from "@/server/audit";
import { revalidatePublic } from "@/server/revalidate-public";
import { SETTINGS_CACHE_TAG } from "@/server/site-settings";
import { translateBatch } from "@/server/translate";
import { locales } from "@/i18n/routing";

const CONTENT_ROLES: Role[] = ["SUPER_ADMIN", "MARKETING", "EDITOR"];

const linkSchema = z.object({
  label: z.string().trim().max(120),
  href: z.string().trim().max(300)
});

const footerLocaleSchema = z.object({
  tagline: z.string().trim().max(500),
  columns: z
    .array(
      z.object({
        title: z.string().trim().max(120),
        links: z.array(linkSchema).max(12)
      })
    )
    .max(2)
});

const footerGlobalSchema = z.object({
  phone: z.string().trim().max(60),
  email: z.string().trim().max(160),
  addressLines: z.array(z.string().trim().max(160)).max(6),
  facebook: z.string().trim().max(300),
  linkedin: z.string().trim().max(300)
});

function revalidateEverything() {
  revalidateTag(SETTINGS_CACHE_TAG);
  revalidatePublic([
    "",
    "/unternehmen",
    "/leistungen",
    "/leistungen/[slug]",
    "/fuhrpark",
    "/karriere",
    "/karriere/lkw-fahrer",
    "/wissen",
    "/kontakt",
    "/impressum",
    "/datenschutz"
  ]);
  revalidatePath("/admin/fusszeile");
}

export async function saveFooterAction(
  locale: string,
  localeSettings: unknown,
  globalSettings: unknown
) {
  const session = await requireRole(CONTENT_ROLES);
  if (!session) redirect("/admin/login");

  const parsedLocale = footerLocaleSchema.safeParse(localeSettings);
  const parsedGlobal = footerGlobalSchema.safeParse(globalSettings);
  if (!parsedLocale.success || !parsedGlobal.success) {
    return { ok: false };
  }

  await prisma.siteSetting.upsert({
    where: { key: `footer:${locale}` },
    update: { value: parsedLocale.data },
    create: { key: `footer:${locale}`, value: parsedLocale.data }
  });
  await prisma.siteSetting.upsert({
    where: { key: "footer:global" },
    update: { value: parsedGlobal.data },
    create: { key: "footer:global", value: parsedGlobal.data }
  });

  await writeAuditLog({
    userId: session.user.id,
    action: "UPDATE",
    entityType: "FooterSettings",
    entityId: locale
  });
  revalidateEverything();
  return { ok: true };
}

const generalSchema = z.object({
  siteName: z.string().trim().max(120),
  slogan: z.string().trim().max(300),
  metaTitle: z.string().trim().max(200),
  metaDescription: z.string().trim().max(320),
  recruitingPhone: z.string().trim().max(60),
  recruitingWhatsapp: z.string().trim().max(60)
});

export async function saveGeneralAction(values: unknown) {
  const session = await requireRole(["SUPER_ADMIN", "MARKETING"]);
  if (!session) redirect("/admin/login");

  const parsed = generalSchema.safeParse(values);
  if (!parsed.success) return { ok: false };

  await prisma.siteSetting.upsert({
    where: { key: "general" },
    update: { value: parsed.data },
    create: { key: "general", value: parsed.data }
  });

  await writeAuditLog({
    userId: session.user.id,
    action: "UPDATE",
    entityType: "GeneralSettings"
  });
  revalidateTag(SETTINGS_CACHE_TAG);
  revalidatePublic([
    "",
    "/unternehmen",
    "/leistungen",
    "/fuhrpark",
    "/karriere",
    "/karriere/lkw-fahrer",
    "/wissen",
    "/kontakt"
  ]);
  revalidatePath("/admin/einstellungen");
  return { ok: true };
}

const TEMPLATE_KEYS = ["inquiry", "application", "contact"];
const emailTemplateSchema = z.object({
  subject: z.string().trim().max(200),
  bodyHtml: z.string().max(50000),
  html: z.string().max(50000)
});

export async function saveEmailTemplate(
  templateKey: string,
  locale: string,
  values: unknown
) {
  const session = await requireRole(CONTENT_ROLES);
  if (!session) redirect("/admin/login");
  if (!TEMPLATE_KEYS.includes(templateKey)) return { ok: false };

  const parsed = emailTemplateSchema.safeParse(values);
  if (!parsed.success) return { ok: false };

  const existing = await prisma.siteSetting.findUnique({
    where: { key: "emailTemplates" }
  });
  const current =
    (existing?.value as Record<
      string,
      Record<string, { subject: string; body: string }>
    > | null) ?? {};
  const next: Prisma.InputJsonValue = {
    ...current,
    [templateKey]: { ...current[templateKey], [locale]: parsed.data }
  };

  await prisma.siteSetting.upsert({
    where: { key: "emailTemplates" },
    update: { value: next },
    create: { key: "emailTemplates", value: next }
  });

  await writeAuditLog({
    userId: session.user.id,
    action: "UPDATE",
    entityType: "EmailTemplate",
    entityId: `${templateKey}:${locale}`
  });
  revalidateTag(SETTINGS_CACHE_TAG);
  revalidatePath("/admin/email-vorlagen");
  return { ok: true };
}

const translationSchema = z.object({
  openaiKey: z.string().trim().max(300),
  openaiModel: z.string().trim().max(60),
  sourceLocale: z.enum(["de", "en", "pl", "tr", "uk"]),
  autoTranslate: z.boolean()
});

export async function saveTranslationAction(values: unknown) {
  const session = await requireRole(["SUPER_ADMIN"]);
  if (!session) redirect("/admin/login");

  const parsed = translationSchema.safeParse(values);
  if (!parsed.success) return { ok: false };

  // Leeres Schlüsselfeld bedeutet: bisherigen Schlüssel beibehalten.
  let openaiKey = parsed.data.openaiKey;
  if (openaiKey === "") {
    const existing = await prisma.siteSetting.findUnique({
      where: { key: "translation" }
    });
    const stored = existing?.value as { openaiKey?: string } | null;
    openaiKey = stored?.openaiKey ?? "";
  }

  const model = parsed.data.openaiModel || "gpt-4o-mini";
  await prisma.siteSetting.upsert({
    where: { key: "translation" },
    update: { value: { ...parsed.data, openaiKey, openaiModel: model } },
    create: { key: "translation", value: { ...parsed.data, openaiKey, openaiModel: model } }
  });

  await writeAuditLog({
    userId: session.user.id,
    action: "UPDATE",
    entityType: "TranslationSettings"
  });
  revalidateTag(SETTINGS_CACHE_TAG);
  revalidatePath("/admin/einstellungen");
  return { ok: true };
}

const analyticsSchema = z.object({
  matomoUrl: z.string().trim().max(300),
  matomoSiteId: z.string().trim().max(20),
  gaId: z.string().trim().max(40),
  pixelId: z.string().trim().max(40)
});

export async function saveAnalyticsAction(values: unknown) {
  const session = await requireRole(["SUPER_ADMIN"]);
  if (!session) redirect("/admin/login");

  const parsed = analyticsSchema.safeParse(values);
  if (!parsed.success) return { ok: false };

  await prisma.siteSetting.upsert({
    where: { key: "analytics" },
    update: { value: parsed.data },
    create: { key: "analytics", value: parsed.data }
  });

  await writeAuditLog({
    userId: session.user.id,
    action: "UPDATE",
    entityType: "AnalyticsSettings"
  });
  revalidateTag(SETTINGS_CACHE_TAG);
  // Alle Seiten neu rendern, damit das Tracking-Skript greift.
  revalidatePublic([
    "",
    "/unternehmen",
    "/leistungen",
    "/fuhrpark",
    "/karriere",
    "/wissen",
    "/kontakt"
  ]);
  revalidatePath("/admin/einstellungen");
  return { ok: true };
}

const seoEntrySchema = z.object({
  title: z.string().trim().max(200),
  description: z.string().trim().max(320)
});

const SEO_HREFS: Record<string, string> = {
  unternehmen: "/unternehmen",
  leistungen: "/leistungen",
  fuhrpark: "/fuhrpark",
  karriere: "/karriere",
  "lkw-fahrer": "/karriere/lkw-fahrer",
  wissen: "/wissen",
  kontakt: "/kontakt"
};

export async function saveSeoAction(
  pageKey: string,
  locale: string,
  values: unknown
) {
  const session = await requireRole(CONTENT_ROLES);
  if (!session) redirect("/admin/login");

  const href = SEO_HREFS[pageKey];
  if (!href) return { ok: false };
  const parsed = seoEntrySchema.safeParse(values);
  if (!parsed.success) return { ok: false };

  const existing = await prisma.siteSetting.findUnique({
    where: { key: "seo" }
  });
  const current =
    (existing?.value as Record<
      string,
      Record<string, { title: string; description: string }>
    > | null) ?? {};
  const next: Prisma.InputJsonValue = {
    ...current,
    [pageKey]: { ...current[pageKey], [locale]: parsed.data }
  };

  await prisma.siteSetting.upsert({
    where: { key: "seo" },
    update: { value: next },
    create: { key: "seo", value: next }
  });

  await writeAuditLog({
    userId: session.user.id,
    action: "UPDATE",
    entityType: "SeoSettings",
    entityId: `${pageKey}:${locale}`
  });
  revalidateTag(SETTINGS_CACHE_TAG);
  revalidatePublic([href]);
  revalidatePath("/admin/seo");
  return { ok: true };
}

// Übersetzt SEO-Titel/Beschreibung einer Seite in alle übrigen Sprachen.
export async function translateSeoAction(
  pageKey: string,
  sourceLocale: string,
  title: string,
  description: string
) {
  const session = await requireRole(CONTENT_ROLES);
  if (!session) redirect("/admin/login");

  const href = SEO_HREFS[pageKey];
  if (!href) return { ok: false };

  const existing = await prisma.siteSetting.findUnique({
    where: { key: "seo" }
  });
  const current =
    (existing?.value as Record<
      string,
      Record<string, { title: string; description: string }>
    > | null) ?? {};
  const pageEntry: Record<string, { title: string; description: string }> = {
    ...current[pageKey],
    [sourceLocale]: { title, description }
  };

  const targets = locales.filter((locale) => locale !== sourceLocale);
  for (const locale of targets) {
    const out = await translateBatch([title, description], locale, sourceLocale);
    if (!out) continue;
    pageEntry[locale] = { title: out[0], description: out[1] };
  }

  const next: Prisma.InputJsonValue = { ...current, [pageKey]: pageEntry };
  await prisma.siteSetting.upsert({
    where: { key: "seo" },
    update: { value: next },
    create: { key: "seo", value: next }
  });

  await writeAuditLog({
    userId: session.user.id,
    action: "UPDATE",
    entityType: "SeoSettings",
    entityId: `${pageKey}:*`
  });
  revalidateTag(SETTINGS_CACHE_TAG);
  revalidatePublic([href]);
  revalidatePath("/admin/seo");
  return { ok: true };
}

const smtpSchema = z.object({
  host: z.string().trim().max(200),
  port: z.coerce.number().int().min(1).max(65535),
  secure: z.boolean(),
  user: z.string().trim().max(200),
  password: z.string().max(200),
  from: z.string().trim().max(200),
  hrRecipient: z.string().trim().max(200),
  inquiriesRecipient: z.string().trim().max(200)
});

export async function saveSmtpAction(values: unknown) {
  const session = await requireRole(["SUPER_ADMIN"]);
  if (!session) redirect("/admin/login");

  const parsed = smtpSchema.safeParse(values);
  if (!parsed.success) return { ok: false };

  // Leeres Passwortfeld bedeutet: bisheriges Passwort beibehalten.
  let password = parsed.data.password;
  if (password === "") {
    const existing = await prisma.siteSetting.findUnique({
      where: { key: "smtp" }
    });
    const stored = existing?.value as { password?: string } | null;
    password = stored?.password ?? "";
  }

  await prisma.siteSetting.upsert({
    where: { key: "smtp" },
    update: { value: { ...parsed.data, password } },
    create: { key: "smtp", value: { ...parsed.data, password } }
  });

  await writeAuditLog({
    userId: session.user.id,
    action: "UPDATE",
    entityType: "SmtpSettings"
  });
  revalidateTag(SETTINGS_CACHE_TAG);
  revalidatePath("/admin/einstellungen");
  return { ok: true };
}

// Setzt die Fußzeile einer Sprache auf den Standard zurück.
export async function resetFooterAction(locale: string) {
  const session = await requireRole(CONTENT_ROLES);
  if (!session) redirect("/admin/login");

  await prisma.siteSetting.deleteMany({ where: { key: `footer:${locale}` } });
  await writeAuditLog({
    userId: session.user.id,
    action: "DELETE",
    entityType: "FooterSettings",
    entityId: locale
  });
  revalidateEverything();
  return { ok: true };
}
