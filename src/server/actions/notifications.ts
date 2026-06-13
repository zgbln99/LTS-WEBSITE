"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/auth";
import { writeAuditLog } from "@/server/audit";
import { resendNotification } from "@/server/notifications";

export async function resendNotificationAction(id: string) {
  const session = await requireRole(["SUPER_ADMIN", "HR", "MARKETING"]);
  if (!session) redirect("/admin/login");

  const ok = await resendNotification(id);

  await writeAuditLog({
    userId: session.user.id,
    action: "UPDATE",
    entityType: "MailNotification",
    entityId: id,
    payload: { resent: ok }
  });

  revalidatePath("/admin/benachrichtigungen");
  return { ok };
}
