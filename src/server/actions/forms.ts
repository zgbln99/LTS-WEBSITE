"use server";

import { getTranslations } from "next-intl/server";
import { prisma } from "@/server/db";
import {
  confirmationHtml,
  getMailRecipients,
  notificationHtml,
  notificationText,
  type MailAttachment
} from "@/server/mailer";
import { getClientIpHash, isRateLimited } from "@/server/rate-limit";
import { sendInternalNotification } from "@/server/notifications";
import { isS3Configured, uploadApplicationFile } from "@/server/s3";
import {
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  MAX_TOTAL_SIZE,
  applicationSchema,
  callbackRequestSchema,
  contactRequestSchema,
  transportRequestSchema,
  type FormActionState
} from "@/lib/forms";

function generateReference(prefix: string) {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  const year = new Date().getFullYear().toString().slice(2);
  return `${prefix}-${year}${random}`;
}

function isHoneypotFilled(formData: FormData) {
  return Boolean((formData.get("website") as string | null)?.trim());
}

// Zeitfalle: Ein echter Mensch braucht zum Ausfüllen länger als ein Bot.
// Das Feld "renderedAt" wird per JavaScript beim Laden des Formulars gesetzt.
// Fehlt es (kein JavaScript), wird nicht blockiert.
const MIN_FILL_MS = 2500;
function isSubmittedTooFast(formData: FormData) {
  const renderedAt = Number(formData.get("renderedAt"));
  if (!renderedAt || Number.isNaN(renderedAt)) return false;
  return Date.now() - renderedAt < MIN_FILL_MS;
}

async function sendConfirmation(
  locale: string,
  to: string,
  subjectKey: "inquirySubject" | "applicationSubject" | "contactSubject",
  bodyKey: "inquiryBody" | "applicationBody" | "contactBody",
  values: Record<string, string>
) {
  const t = await getTranslations({ locale, namespace: "forms.emails" });
  const subject = t(subjectKey, values);
  const text = t(bodyKey, values);
  // Automatische Bestätigung an den Absender in seiner Sprache,
  // protokolliert und bei Bedarf erneut versendbar.
  await sendInternalNotification({
    kind: "CONFIRMATION",
    to,
    subject,
    text,
    html: confirmationHtml(text),
    reference: values.reference
  });
}

export async function submitTransportRequest(
  _prev: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  if (isHoneypotFilled(formData) || isSubmittedTooFast(formData)) {
    return { status: "success", reference: generateReference("LTS") };
  }

  const ipHash = await getClientIpHash();
  if (isRateLimited("transport", ipHash)) {
    return { status: "error", code: "rateLimit" };
  }

  const parsed = transportRequestSchema.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!parsed.success) {
    return { status: "error", code: "validation" };
  }
  const data = parsed.data;
  const reference = generateReference("LTS");

  let stored = false;
  try {
    await prisma.transportRequest.create({
      data: {
        referenceNumber: reference,
        company: data.company,
        contactName: data.contactName,
        email: data.email,
        phone: data.phone,
        pickupAddress: data.pickupAddress,
        pickupCountry: data.pickupCountry,
        deliveryAddress: data.deliveryAddress,
        deliveryCountry: data.deliveryCountry,
        requestedDate: data.requestedDate
          ? new Date(data.requestedDate)
          : null,
        cargoType: data.cargoType,
        palletCount: data.palletCount ?? null,
        weightKg: data.weightKg ?? null,
        lengthM: data.lengthM ?? null,
        widthM: data.widthM ?? null,
        heightM: data.heightM ?? null,
        temperatureMin: data.temperatureMin ?? null,
        temperatureMax: data.temperatureMax ?? null,
        message: data.message ?? null,
        locale: data.locale,
        consentAt: new Date(),
        ipHash
      }
    });
    stored = true;
  } catch (error) {
    console.error("Transportanfrage konnte nicht gespeichert werden:", error);
  }

  const rows: [string, string][] = [
    ["Referenz", reference],
    ["Firma", data.company],
    ["Ansprechpartner", data.contactName],
    ["E-Mail", data.email],
    ["Telefon", data.phone],
    ["Abholung", `${data.pickupAddress}, ${data.pickupCountry}`],
    ["Zustellung", `${data.deliveryAddress}, ${data.deliveryCountry}`],
    ["Wunschtermin", data.requestedDate ?? ""],
    ["Ware", data.cargoType],
    ["Paletten", data.palletCount?.toString() ?? ""],
    ["Gewicht (kg)", data.weightKg?.toString() ?? ""],
    [
      "Maße (L×B×H, m)",
      [data.lengthM, data.widthM, data.heightM].some((v) => v !== undefined)
        ? `${data.lengthM ?? "?"} × ${data.widthM ?? "?"} × ${data.heightM ?? "?"}`
        : ""
    ],
    [
      "Temperatur (°C)",
      data.temperatureMin !== undefined || data.temperatureMax !== undefined
        ? `${data.temperatureMin ?? "?"} bis ${data.temperatureMax ?? "?"}`
        : ""
    ],
    ["Nachricht", data.message ?? ""],
    ["Sprache", data.locale]
  ];

  const recipients = await getMailRecipients();
  const mailed = await sendInternalNotification({
    kind: "TRANSPORT",
    to: recipients.inquiries,
    replyTo: data.email,
    reference,
    subject: `Neue Transportanfrage ${reference}: ${data.pickupCountry} nach ${data.deliveryCountry}`,
    text: notificationText("Neue Transportanfrage über die Website", rows),
    html: notificationHtml("Neue Transportanfrage über die Website", rows)
  });

  if (!stored && !mailed) {
    return { status: "error", code: "generic" };
  }

  await sendConfirmation(
    data.locale,
    data.email,
    "inquirySubject",
    "inquiryBody",
    { reference, name: data.contactName }
  );

  return { status: "success", reference };
}

export async function submitContactRequest(
  _prev: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  if (isHoneypotFilled(formData) || isSubmittedTooFast(formData)) {
    return { status: "success" };
  }

  const ipHash = await getClientIpHash();
  if (isRateLimited("contact", ipHash)) {
    return { status: "error", code: "rateLimit" };
  }

  const parsed = contactRequestSchema.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!parsed.success) {
    return { status: "error", code: "validation" };
  }
  const data = parsed.data;

  let stored = false;
  try {
    await prisma.contactRequest.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone ?? null,
        company: data.company ?? null,
        department: data.department,
        message: data.message,
        locale: data.locale,
        consentAt: new Date(),
        ipHash
      }
    });
    stored = true;
  } catch (error) {
    console.error("Kontaktanfrage konnte nicht gespeichert werden:", error);
  }

  const rows: [string, string][] = [
    ["Name", data.name],
    ["E-Mail", data.email],
    ["Telefon", data.phone ?? ""],
    ["Firma", data.company ?? ""],
    ["Abteilung", data.department],
    ["Nachricht", data.message],
    ["Sprache", data.locale]
  ];

  const recipients = await getMailRecipients();
  const mailed = await sendInternalNotification({
    kind: "CONTACT",
    to: data.department === "hr" ? recipients.hr : recipients.inquiries,
    replyTo: data.email,
    subject: `Neue Kontaktanfrage über die Website (${data.department})`,
    text: notificationText("Neue Kontaktanfrage über die Website", rows),
    html: notificationHtml("Neue Kontaktanfrage über die Website", rows)
  });

  if (!stored && !mailed) {
    return { status: "error", code: "generic" };
  }

  await sendConfirmation(data.locale, data.email, "contactSubject", "contactBody", {
    name: data.name
  });

  return { status: "success" };
}

// Rückrufbitte aus dem Recruiting-Bereich ("Kein passendes Angebot dabei?")
export async function submitCallbackRequest(
  _prev: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  if (isHoneypotFilled(formData) || isSubmittedTooFast(formData)) {
    return { status: "success" };
  }

  const ipHash = await getClientIpHash();
  if (isRateLimited("callback", ipHash)) {
    return { status: "error", code: "rateLimit" };
  }

  const parsed = callbackRequestSchema.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!parsed.success) {
    return { status: "error", code: "validation" };
  }
  const data = parsed.data;

  let stored = false;
  try {
    await prisma.contactRequest.create({
      data: {
        name: data.name ?? "Rückrufbitte",
        email: null,
        phone: data.phone,
        department: "callback",
        message: `Rückrufbitte an ${data.phone}`,
        locale: data.locale,
        consentAt: new Date(),
        ipHash
      }
    });
    stored = true;
  } catch (error) {
    console.error("Rückrufbitte konnte nicht gespeichert werden:", error);
  }

  const rows: [string, string][] = [
    ["Name", data.name ?? ""],
    ["Telefon", data.phone],
    ["Sprache", data.locale]
  ];

  const recipients = await getMailRecipients();
  const mailed = await sendInternalNotification({
    kind: "CALLBACK",
    to: recipients.hr,
    subject: `Neue Rückrufbitte: ${data.phone}`,
    text: notificationText("Neue Rückrufbitte von der Karriereseite", rows),
    html: notificationHtml("Neue Rückrufbitte von der Karriereseite", rows)
  });

  if (!stored && !mailed) {
    return { status: "error", code: "generic" };
  }
  return { status: "success" };
}

const fileFields = [
  { field: "cv", type: "CV" },
  { field: "licenseFile", type: "LICENSE" },
  { field: "certificates", type: "CERTIFICATE" }
] as const;

export async function submitApplication(
  _prev: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  if (isHoneypotFilled(formData) || isSubmittedTooFast(formData)) {
    return { status: "success" };
  }

  const ipHash = await getClientIpHash();
  if (isRateLimited("application", ipHash)) {
    return { status: "error", code: "rateLimit" };
  }

  const parsed = applicationSchema.safeParse(
    Object.fromEntries(
      [...formData.entries()].filter(([, value]) => typeof value === "string")
    )
  );
  if (!parsed.success) {
    return { status: "error", code: "validation" };
  }
  const data = parsed.data;

  // Dateien einsammeln und validieren
  const files: {
    type: "CV" | "LICENSE" | "CERTIFICATE";
    name: string;
    mime: string;
    buffer: Buffer;
  }[] = [];
  let totalSize = 0;

  for (const { field, type } of fileFields) {
    for (const entry of formData.getAll(field)) {
      if (!(entry instanceof File) || entry.size === 0) continue;
      if (entry.size > MAX_FILE_SIZE) {
        return { status: "error", code: "file" };
      }
      if (!ALLOWED_FILE_TYPES.includes(entry.type)) {
        return { status: "error", code: "file" };
      }
      totalSize += entry.size;
      if (totalSize > MAX_TOTAL_SIZE) {
        return { status: "error", code: "file" };
      }
      files.push({
        type,
        name: entry.name.replace(/[^\w.\- ]/g, "_").slice(0, 120),
        mime: entry.type,
        buffer: Buffer.from(await entry.arrayBuffer())
      });
    }
  }

  const reference = generateReference("BEW");

  // Optional in S3 ablegen
  const storedFiles: {
    type: "CV" | "LICENSE" | "CERTIFICATE";
    s3Key: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
  }[] = [];
  if (isS3Configured()) {
    for (const file of files) {
      try {
        const key = `applications/${reference}/${file.type.toLowerCase()}-${file.name}`;
        await uploadApplicationFile(key, file.buffer, file.mime);
        storedFiles.push({
          type: file.type,
          s3Key: key,
          fileName: file.name,
          mimeType: file.mime,
          sizeBytes: file.buffer.length
        });
      } catch (error) {
        console.error("S3-Upload fehlgeschlagen:", error);
      }
    }
  }

  let stored = false;
  try {
    const category = await prisma.jobCategory.upsert({
      where: { key: data.category },
      update: {},
      create: { key: data.category }
    });
    await prisma.application.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        licenseClass: data.licenseClass ?? null,
        message: data.message ?? null,
        source: `website:${data.category}`,
        locale: data.locale,
        gdprConsentAt: new Date(),
        files: { create: storedFiles },
        activities: {
          create: {
            type: "RECEIVED",
            payload: { reference, category: category.key }
          }
        }
      }
    });
    stored = true;
  } catch (error) {
    console.error("Bewerbung konnte nicht gespeichert werden:", error);
  }

  const rows: [string, string][] = [
    ["Referenz", reference],
    ["Bereich", data.category],
    ["Name", `${data.firstName} ${data.lastName}`],
    ["E-Mail", data.email],
    ["Telefon", data.phone],
    ["Führerscheinklasse", data.licenseClass ?? ""],
    ["Nachricht", data.message ?? ""],
    ["Sprache", data.locale],
    [
      "Unterlagen",
      files.length
        ? files.map((file) => `${file.type}: ${file.name}`).join("\n")
        : "keine"
    ]
  ];

  const attachments: MailAttachment[] = files.map((file) => ({
    filename: `${file.type.toLowerCase()}-${file.name}`,
    content: file.buffer,
    contentType: file.mime
  }));

  const recipients = await getMailRecipients();
  const mailed = await sendInternalNotification({
    kind: "APPLICATION",
    to: recipients.hr,
    replyTo: data.email,
    reference,
    subject: `Neue Bewerbung ${reference}: ${data.firstName} ${data.lastName} (${data.category})`,
    text: notificationText("Neue Bewerbung über die Website", rows),
    html: notificationHtml("Neue Bewerbung über die Website", rows),
    attachments
  });

  if (!stored && !mailed) {
    return { status: "error", code: "generic" };
  }

  await sendConfirmation(
    data.locale,
    data.email,
    "applicationSubject",
    "applicationBody",
    { name: data.firstName, reference }
  );

  return { status: "success", reference };
}
