"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/auth";
import { prisma } from "@/server/db";
import { writeAuditLog } from "@/server/audit";

const ROLES = ["SUPER_ADMIN", "MARKETING"] as const;

const redirectSchema = z.object({
  fromPath: z
    .string()
    .trim()
    .min(1)
    .max(300)
    .regex(/^\//, "Pfad muss mit / beginnen"),
  toPath: z.string().trim().min(1).max(300),
  statusCode: z.coerce.number().int().refine((v) => v === 301 || v === 302)
});

export async function saveRedirect(formData: FormData) {
  const session = await requireRole([...ROLES]);
  if (!session) redirect("/admin/login");

  const parsed = redirectSchema.safeParse({
    fromPath: formData.get("fromPath"),
    toPath: formData.get("toPath"),
    statusCode: formData.get("statusCode") || 301
  });
  if (!parsed.success) return;

  await prisma.redirect.upsert({
    where: { fromPath: parsed.data.fromPath },
    update: { toPath: parsed.data.toPath, statusCode: parsed.data.statusCode },
    create: parsed.data
  });
  await writeAuditLog({
    userId: session.user.id,
    action: "CREATE",
    entityType: "Redirect",
    entityId: parsed.data.fromPath
  });
  revalidatePath("/admin/redirects");
  revalidatePath("/api/redirects");
}

export async function deleteRedirect(formData: FormData) {
  const session = await requireRole([...ROLES]);
  if (!session) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.redirect.delete({ where: { id } });
  await writeAuditLog({
    userId: session.user.id,
    action: "DELETE",
    entityType: "Redirect",
    entityId: id
  });
  revalidatePath("/admin/redirects");
  revalidatePath("/api/redirects");
}
