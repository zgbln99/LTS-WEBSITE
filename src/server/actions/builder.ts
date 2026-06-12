"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Data } from "@measured/puck";
import { Prisma, type Role } from "@prisma/client";
import { requireRole } from "@/auth";
import { prisma } from "@/server/db";
import { writeAuditLog } from "@/server/audit";
import { revalidatePublic } from "@/server/revalidate-public";
import { sanitizeBuilderData } from "@/server/builder";
import { BUILDER_PAGES, isBuilderPageKey } from "@/builder/defaults";

const BUILDER_ROLES: Role[] = ["SUPER_ADMIN", "MARKETING", "EDITOR"];

const PAGE_PATHS: Record<string, string> = {
  home: "",
  karriere: "/karriere",
  "lkw-fahrer": "/karriere/lkw-fahrer",
  fuhrpark: "/fuhrpark",
  unternehmen: "/unternehmen",
  kontakt: "/kontakt"
};

async function ensureTranslation(key: string, locale: string) {
  const page = await prisma.page.upsert({
    where: { key },
    update: {},
    create: { key, status: "PUBLISHED" }
  });
  await prisma.pageTranslation.upsert({
    where: { pageId_locale: { pageId: page.id, locale } },
    update: {},
    create: {
      pageId: page.id,
      locale,
      title: BUILDER_PAGES[key as keyof typeof BUILDER_PAGES]?.label ?? key,
      slug: `${key}-${locale}`,
      content: {}
    }
  });
  return page;
}

export async function saveDraftAction(
  key: string,
  locale: string,
  data: Data
) {
  const session = await requireRole(BUILDER_ROLES);
  if (!session) redirect("/admin/login");
  if (!isBuilderPageKey(key)) return { ok: false };

  const clean = sanitizeBuilderData(data) as unknown as Prisma.InputJsonValue;
  const page = await ensureTranslation(key, locale);
  await prisma.pageTranslation.update({
    where: { pageId_locale: { pageId: page.id, locale } },
    data: { draft: clean }
  });
  await writeAuditLog({
    userId: session.user.id,
    action: "UPDATE",
    entityType: "PageDraft",
    entityId: `${key}:${locale}`
  });
  return { ok: true };
}

export async function publishPageAction(
  key: string,
  locale: string,
  data: Data
) {
  const session = await requireRole(BUILDER_ROLES);
  if (!session) redirect("/admin/login");
  if (!isBuilderPageKey(key)) return { ok: false };

  const clean = sanitizeBuilderData(data) as unknown as Prisma.InputJsonValue;
  const page = await ensureTranslation(key, locale);
  await prisma.pageTranslation.update({
    where: { pageId_locale: { pageId: page.id, locale } },
    data: { content: clean, draft: Prisma.JsonNull }
  });
  await prisma.page.update({
    where: { id: page.id },
    data: { status: "PUBLISHED" }
  });
  await writeAuditLog({
    userId: session.user.id,
    action: "UPDATE",
    entityType: "PagePublish",
    entityId: `${key}:${locale}`
  });
  revalidatePublic([PAGE_PATHS[key] ?? ""]);
  revalidatePath("/admin/seiten");
  return { ok: true };
}

// Setzt eine Sprache auf das Standard-Layout aus dem Code zurück.
export async function resetPageAction(key: string, locale: string) {
  const session = await requireRole(BUILDER_ROLES);
  if (!session) redirect("/admin/login");
  if (!isBuilderPageKey(key)) return { ok: false };

  const page = await prisma.page.findUnique({ where: { key } });
  if (page) {
    await prisma.pageTranslation.deleteMany({
      where: { pageId: page.id, locale }
    });
  }
  await writeAuditLog({
    userId: session.user.id,
    action: "DELETE",
    entityType: "PageContent",
    entityId: `${key}:${locale}`
  });
  revalidatePublic([PAGE_PATHS[key] ?? ""]);
  revalidatePath("/admin/seiten");
  return { ok: true };
}
