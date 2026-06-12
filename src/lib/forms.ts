import { z } from "zod";
import { locales } from "@/i18n/routing";

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalNumber = (max: number) =>
  z.preprocess(
    emptyToUndefined,
    z.coerce.number().min(0).max(max).optional()
  );

const optionalTemperature = z.preprocess(
  emptyToUndefined,
  z.coerce.number().min(-40).max(40).optional()
);

export const localeSchema = z.enum(locales as unknown as [string, ...string[]]);

export const consentSchema = z
  .string()
  .refine((value) => value === "on" || value === "true", "consent required");

export const transportRequestSchema = z.object({
  locale: localeSchema,
  company: z.string().trim().min(2).max(200),
  contactName: z.string().trim().min(2).max(200),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(5).max(40),
  pickupAddress: z.string().trim().min(3).max(300),
  pickupCountry: z.string().trim().min(2).max(80),
  deliveryAddress: z.string().trim().min(3).max(300),
  deliveryCountry: z.string().trim().min(2).max(80),
  requestedDate: z.preprocess(
    emptyToUndefined,
    z.string().max(30).optional()
  ),
  cargoType: z.string().trim().min(2).max(300),
  palletCount: optionalNumber(1000),
  weightKg: optionalNumber(40000),
  lengthM: optionalNumber(20),
  widthM: optionalNumber(5),
  heightM: optionalNumber(5),
  temperatureMin: optionalTemperature,
  temperatureMax: optionalTemperature,
  message: z.preprocess(emptyToUndefined, z.string().max(5000).optional()),
  consent: consentSchema
});

export const contactRequestSchema = z.object({
  locale: localeSchema,
  name: z.string().trim().min(2).max(200),
  email: z.string().trim().email().max(254),
  phone: z.preprocess(emptyToUndefined, z.string().max(40).optional()),
  company: z.preprocess(emptyToUndefined, z.string().max(200).optional()),
  department: z.enum(["general", "dispo", "hr", "billing"]),
  message: z.string().trim().min(5).max(5000),
  consent: consentSchema
});

export const jobCategoryKeys = [
  "drivers",
  "dispatchers",
  "office",
  "logistics",
  "warehouse"
] as const;

export const applicationSchema = z.object({
  locale: localeSchema,
  category: z.enum(jobCategoryKeys),
  firstName: z.string().trim().min(2).max(120),
  lastName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(5).max(40),
  licenseClass: z.preprocess(
    emptyToUndefined,
    z.enum(["B", "C1", "C", "CE"]).optional()
  ),
  message: z.preprocess(emptyToUndefined, z.string().max(5000).optional()),
  consent: consentSchema
});

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png"
];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB pro Datei
export const MAX_TOTAL_SIZE = 25 * 1024 * 1024; // 25 MB pro Bewerbung

export type FormActionState = {
  status: "idle" | "success" | "error";
  code?: "validation" | "rateLimit" | "file" | "generic";
  reference?: string;
};

export const idleFormState: FormActionState = { status: "idle" };
