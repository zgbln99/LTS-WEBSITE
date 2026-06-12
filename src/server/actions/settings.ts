"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { Role } from "@prisma/client";
import { requireRole } from "@/auth";
import { prisma } from "@/server/db";
import { writeAuditLog } from "@/server/audit";
import { revalidatePublic } from "@/server/revalidate-public";
import { SETTINGS_CACHE_TAG } from "@/server/site-settings";

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
