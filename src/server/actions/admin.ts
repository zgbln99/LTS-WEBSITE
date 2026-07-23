"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { z } from "zod";
import { requireRole, signIn, signOut } from "@/auth";
import { prisma } from "@/server/db";
import { writeAuditLog } from "@/server/audit";
import { deleteApplicationFiles, getDownloadUrl } from "@/server/s3";
import {
  notificationHtml,
  notificationText,
  sendMail
} from "@/server/mailer";
import {
  ApplicationStatus,
  RequestStatus,
  type Role
} from "@prisma/client";

const REQUEST_ROLES: Role[] = ["SUPER_ADMIN", "MARKETING"];
const APPLICATION_ROLES: Role[] = ["SUPER_ADMIN", "HR"];

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/admin"
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Anmeldung fehlgeschlagen. Bitte prüfen Sie E-Mail und Passwort." };
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/admin/login" });
}

const requestStatusSchema = z.object({
  id: z.string().min(1),
  status: z.nativeEnum(RequestStatus)
});

export async function updateTransportRequestStatus(formData: FormData) {
  const session = await requireRole(REQUEST_ROLES);
  if (!session) redirect("/admin/login");

  const parsed = requestStatusSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status")
  });
  if (!parsed.success) return;

  await prisma.transportRequest.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status }
  });
  await writeAuditLog({
    userId: session.user.id,
    action: "STATUS_CHANGE",
    entityType: "TransportRequest",
    entityId: parsed.data.id,
    payload: { status: parsed.data.status }
  });
  revalidatePath("/admin/anfragen");
  revalidatePath(`/admin/anfragen/${parsed.data.id}`);
}

export async function updateContactRequestStatus(formData: FormData) {
  const session = await requireRole(REQUEST_ROLES);
  if (!session) redirect("/admin/login");

  const parsed = requestStatusSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status")
  });
  if (!parsed.success) return;

  await prisma.contactRequest.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status }
  });
  await writeAuditLog({
    userId: session.user.id,
    action: "STATUS_CHANGE",
    entityType: "ContactRequest",
    entityId: parsed.data.id,
    payload: { status: parsed.data.status }
  });
  revalidatePath("/admin/kontaktanfragen");
}

export async function updateAppointmentStatus(formData: FormData) {
  const session = await requireRole(["SUPER_ADMIN", "HR"]);
  if (!session) redirect("/admin/login");

  const parsed = requestStatusSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status")
  });
  if (!parsed.success) return;

  await prisma.appointmentRequest.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status }
  });
  await writeAuditLog({
    userId: session.user.id,
    action: "STATUS_CHANGE",
    entityType: "AppointmentRequest",
    entityId: parsed.data.id,
    payload: { status: parsed.data.status }
  });
  revalidatePath("/admin/termine");
}

const applicationStatusSchema = z.object({
  id: z.string().min(1),
  status: z.nativeEnum(ApplicationStatus)
});

export async function updateApplicationStatus(formData: FormData) {
  const session = await requireRole(APPLICATION_ROLES);
  if (!session) redirect("/admin/login");

  const parsed = applicationStatusSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status")
  });
  if (!parsed.success) return;

  await prisma.application.update({
    where: { id: parsed.data.id },
    data: {
      status: parsed.data.status,
      activities: {
        create: {
          type: "STATUS_CHANGE",
          payload: { status: parsed.data.status, by: session.user.name }
        }
      }
    }
  });
  await writeAuditLog({
    userId: session.user.id,
    action: "STATUS_CHANGE",
    entityType: "Application",
    entityId: parsed.data.id,
    payload: { status: parsed.data.status }
  });
  revalidatePath("/admin/bewerbungen");
  revalidatePath(`/admin/bewerbungen/${parsed.data.id}`);
}

const noteSchema = z.object({
  id: z.string().min(1),
  body: z.string().trim().min(1).max(5000)
});

export async function addApplicationNote(formData: FormData) {
  const session = await requireRole(APPLICATION_ROLES);
  if (!session) redirect("/admin/login");

  const parsed = noteSchema.safeParse({
    id: formData.get("id"),
    body: formData.get("body")
  });
  if (!parsed.success) return;

  await prisma.applicationNote.create({
    data: {
      applicationId: parsed.data.id,
      authorId: session.user.id,
      body: parsed.data.body
    }
  });
  await prisma.applicationActivity.create({
    data: {
      applicationId: parsed.data.id,
      type: "NOTE_ADDED",
      payload: { by: session.user.name }
    }
  });
  revalidatePath(`/admin/bewerbungen/${parsed.data.id}`);
}

// DSGVO: personenbezogene Daten anonymisieren (Dokumente und Inhalte bleiben
// für die Statistik erhalten, aber ohne Personenbezug).
export async function anonymizeApplication(formData: FormData) {
  const session = await requireRole(APPLICATION_ROLES);
  if (!session) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.application.update({
    where: { id },
    data: {
      firstName: "Anonymisiert",
      lastName: "",
      email: `anonym-${id}@example.invalid`,
      phone: "",
      message: null,
      anonymizedAt: new Date(),
      activities: {
        create: { type: "ANONYMIZED", payload: { by: session.user.name } }
      }
    }
  });
  await prisma.applicationNote.deleteMany({ where: { applicationId: id } });
  await writeAuditLog({
    userId: session.user.id,
    action: "ANONYMIZE",
    entityType: "Application",
    entityId: id
  });
  revalidatePath("/admin/bewerbungen");
  revalidatePath(`/admin/bewerbungen/${id}`);
}

// Kandidat endgültig löschen: Dateien aus S3 entfernen und den Datensatz samt
// Dateien/Notizen/Aktivitäten (Cascade) aus der Datenbank löschen.
export async function deleteApplication(formData: FormData) {
  const session = await requireRole(APPLICATION_ROLES);
  if (!session) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const files = await prisma.applicationFile.findMany({
    where: { applicationId: id },
    select: { s3Key: true }
  });
  await deleteApplicationFiles(files.map((file) => file.s3Key));

  await prisma.application.delete({ where: { id } });

  await writeAuditLog({
    userId: session.user.id,
    action: "DELETE",
    entityType: "Application",
    entityId: id
  });
  revalidatePath("/admin/bewerbungen");
  redirect("/admin/bewerbungen");
}

const forwardSchema = z.object({
  id: z.string().min(1),
  email: z.string().trim().email(),
  note: z.string().trim().max(1000).optional()
});

// Bewerbung per E-Mail weiterleiten (mit Download-Links zu den Unterlagen).
export async function forwardApplication(formData: FormData) {
  const session = await requireRole(APPLICATION_ROLES);
  if (!session) redirect("/admin/login");

  const parsed = forwardSchema.safeParse({
    id: formData.get("id"),
    email: formData.get("email"),
    note: formData.get("note") || undefined
  });
  if (!parsed.success) {
    redirect(`/admin/bewerbungen/${formData.get("id")}?fehler=weiterleiten`);
  }
  const { id, email, note } = parsed.data;

  const application = await prisma.application.findUnique({
    where: { id },
    include: { files: true }
  });
  if (!application) return;

  // Zeitlich begrenzte Download-Links (7 Tage) für die Dateien.
  const fileLines = await Promise.all(
    application.files.map(async (file) => {
      const url = await getDownloadUrl(file.s3Key, 7 * 24 * 60 * 60);
      return `${file.type}: ${url ?? file.fileName}`;
    })
  );

  const rows: [string, string][] = [
    ["Name", `${application.firstName} ${application.lastName}`],
    ["E-Mail", application.email],
    ["Telefon", application.phone],
    ["Führerscheinklasse", application.licenseClass ?? ""],
    ["Nachricht", application.message ?? ""],
    [
      "Eingegangen",
      application.createdAt.toISOString().slice(0, 10)
    ],
    ...((note ? [["Notiz", note]] : []) as [string, string][]),
    ["Unterlagen (Links 7 Tage gültig)", fileLines.join("\n") || "keine"]
  ];

  const sent = await sendMail({
    to: email,
    subject: `Bewerbung weitergeleitet: ${application.firstName} ${application.lastName}`,
    text: notificationText("Weitergeleitete Bewerbung", rows),
    html: notificationHtml("Weitergeleitete Bewerbung", rows),
    replyTo: application.email
  });

  await prisma.applicationActivity.create({
    data: {
      applicationId: id,
      type: "EMAIL_SENT",
      payload: { forwardedTo: email, by: session.user.name, sent }
    }
  });
  await writeAuditLog({
    userId: session.user.id,
    action: "UPDATE",
    entityType: "Application",
    entityId: id,
    payload: { forwardedTo: email }
  });
  revalidatePath(`/admin/bewerbungen/${id}`);
}
