"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/auth";
import { prisma } from "@/server/db";
import { writeAuditLog } from "@/server/audit";
import { EmploymentType, PublishStatus, type Role } from "@prisma/client";

import { slugify } from "@/lib/slug";
import { revalidatePublic } from "@/server/revalidate-public";

const JOB_ROLES: Role[] = ["SUPER_ADMIN", "HR"];
const CONTENT_ROLES: Role[] = ["SUPER_ADMIN", "MARKETING", "EDITOR"];

const lines = (value: unknown) =>
  String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const optionalInt = (value: unknown) => {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

// ---------------------------------------------------------------------------
// Stellenanzeigen
// ---------------------------------------------------------------------------

const jobSchema = z.object({
  id: z.string().optional(),
  categoryKey: z.string().min(1),
  locationCity: z.string().trim().min(2).max(120),
  country: z.string().trim().max(80).optional(),
  licenseCategory: z.string().trim().max(40).optional(),
  workSystem: z.string().trim().max(160).optional(),
  salaryNote: z.enum(["Netto", "Brutto"]).optional(),
  employmentType: z.nativeEnum(EmploymentType),
  status: z.nativeEnum(PublishStatus),
  title: z.string().trim().min(3).max(180),
  description: z.string().trim().min(10),
  validThrough: z.string().optional()
});

export async function saveJobPosting(formData: FormData) {
  const session = await requireRole(JOB_ROLES);
  if (!session) redirect("/admin/login");

  const parsed = jobSchema.safeParse({
    id: formData.get("id") || undefined,
    categoryKey: formData.get("categoryKey"),
    locationCity: formData.get("locationCity"),
    country: formData.get("country") || undefined,
    licenseCategory: formData.get("licenseCategory") || undefined,
    workSystem: formData.get("workSystem") || undefined,
    salaryNote: formData.get("salaryNote") || undefined,
    employmentType: formData.get("employmentType"),
    status: formData.get("status"),
    title: formData.get("title"),
    description: formData.get("description"),
    validThrough: formData.get("validThrough") || undefined
  });
  if (!parsed.success) redirect("/admin/stellen?fehler=validierung");

  const data = parsed.data;
  const salaryMin = optionalInt(formData.get("salaryMin"));
  const salaryMax = optionalInt(formData.get("salaryMax"));
  const requirements = lines(formData.get("requirements"));
  const benefits = lines(formData.get("benefits"));
  const slug = slugify(String(formData.get("slug") || data.title));

  const category = await prisma.jobCategory.upsert({
    where: { key: data.categoryKey },
    update: {},
    create: { key: data.categoryKey }
  });

  const base = {
    categoryId: category.id,
    locationCity: data.locationCity,
    country: data.country ?? "Deutschland",
    licenseCategory: data.licenseCategory ?? null,
    workSystem: data.workSystem ?? null,
    salaryNote: data.salaryNote ?? "Netto",
    employmentType: data.employmentType,
    salaryMin,
    salaryMax,
    status: data.status,
    validThrough: data.validThrough ? new Date(data.validThrough) : null
  };

  const translation = {
    locale: "de",
    title: data.title,
    slug,
    description: data.description,
    requirements,
    benefits
  };

  let jobId = data.id;
  if (jobId) {
    const existing = await prisma.jobPosting.findUnique({
      where: { id: jobId },
      select: { publishedAt: true }
    });
    await prisma.jobPosting.update({
      where: { id: jobId },
      data: {
        ...base,
        publishedAt:
          data.status === "PUBLISHED"
            ? (existing?.publishedAt ?? new Date())
            : existing?.publishedAt,
        translations: {
          upsert: {
            where: { jobPostingId_locale: { jobPostingId: jobId, locale: "de" } },
            update: translation,
            create: translation
          }
        }
      }
    });
  } else {
    const created = await prisma.jobPosting.create({
      data: {
        ...base,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        translations: { create: translation }
      }
    });
    jobId = created.id;
  }

  await writeAuditLog({
    userId: session.user.id,
    action: data.id ? "UPDATE" : "CREATE",
    entityType: "JobPosting",
    entityId: jobId
  });
  revalidatePath("/admin/stellen");
  revalidatePublic(["/karriere", "/karriere/stelle/[slug]"]);
  redirect("/admin/stellen");
}

export async function deleteJobPosting(formData: FormData) {
  const session = await requireRole(JOB_ROLES);
  if (!session) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.jobPosting.delete({ where: { id } });
  await writeAuditLog({
    userId: session.user.id,
    action: "DELETE",
    entityType: "JobPosting",
    entityId: id
  });
  revalidatePath("/admin/stellen");
  revalidatePublic(["/karriere", "/karriere/stelle/[slug]"]);
}

// ---------------------------------------------------------------------------
// Einsatzorte
// ---------------------------------------------------------------------------

const citySchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2).max(120),
  region: z.string().trim().max(120).optional(),
  lng: z.coerce.number().min(-30).max(60),
  lat: z.coerce.number().min(30).max(75),
  order: z.coerce.number().int().min(0).max(999).optional()
});

export async function saveServiceCity(formData: FormData) {
  const session = await requireRole(CONTENT_ROLES);
  if (!session) redirect("/admin/login");

  const parsed = citySchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    region: formData.get("region") || undefined,
    lng: formData.get("lng"),
    lat: formData.get("lat"),
    order: formData.get("order") || undefined
  });
  if (!parsed.success) redirect("/admin/einsatzorte?fehler=validierung");

  const data = parsed.data;
  const payload = {
    name: data.name,
    region: data.region ?? null,
    lng: data.lng,
    lat: data.lat,
    order: data.order ?? 0
  };

  if (data.id) {
    await prisma.serviceCity.update({ where: { id: data.id }, data: payload });
  } else {
    await prisma.serviceCity.upsert({
      where: { name: data.name },
      update: payload,
      create: payload
    });
  }

  await writeAuditLog({
    userId: session.user.id,
    action: data.id ? "UPDATE" : "CREATE",
    entityType: "ServiceCity",
    entityId: data.id
  });
  revalidatePath("/admin/einsatzorte");
  revalidatePublic(["", "/kontakt", "/unternehmen"]);
  redirect("/admin/einsatzorte");
}

export async function deleteServiceCity(formData: FormData) {
  const session = await requireRole(CONTENT_ROLES);
  if (!session) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.serviceCity.delete({ where: { id } });
  await writeAuditLog({
    userId: session.user.id,
    action: "DELETE",
    entityType: "ServiceCity",
    entityId: id
  });
  revalidatePath("/admin/einsatzorte");
  revalidatePublic(["", "/kontakt", "/unternehmen"]);
}

// ---------------------------------------------------------------------------
// Wissenszentrum
// ---------------------------------------------------------------------------

const articleSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(3).max(180),
  excerpt: z.string().trim().min(10).max(500),
  content: z.string().trim().min(20),
  status: z.nativeEnum(PublishStatus)
});

export async function saveArticle(formData: FormData) {
  const session = await requireRole(CONTENT_ROLES);
  if (!session) redirect("/admin/login");

  const parsed = articleSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    status: formData.get("status")
  });
  if (!parsed.success) redirect("/admin/artikel?fehler=validierung");

  const data = parsed.data;
  const slug = slugify(String(formData.get("slug") || data.title));
  const paragraphs = String(data.content)
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const readingTimeMin = Math.max(
    1,
    Math.round(paragraphs.join(" ").split(/\s+/).length / 200)
  );

  const translation = {
    locale: "de",
    title: data.title,
    slug,
    excerpt: data.excerpt,
    content: { paragraphs },
    readingTimeMin
  };

  if (data.id) {
    const existing = await prisma.blogPost.findUnique({
      where: { id: data.id },
      select: { publishedAt: true }
    });
    await prisma.blogPost.update({
      where: { id: data.id },
      data: {
        status: data.status,
        publishedAt:
          data.status === "PUBLISHED"
            ? (existing?.publishedAt ?? new Date())
            : existing?.publishedAt,
        translations: {
          upsert: {
            where: {
              blogPostId_locale: { blogPostId: data.id, locale: "de" }
            },
            update: translation,
            create: translation
          }
        }
      }
    });
  } else {
    await prisma.blogPost.create({
      data: {
        status: data.status,
        createdById: session.user.id,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        translations: { create: translation }
      }
    });
  }

  await writeAuditLog({
    userId: session.user.id,
    action: data.id ? "UPDATE" : "CREATE",
    entityType: "BlogPost",
    entityId: data.id
  });
  revalidatePath("/admin/artikel");
  revalidatePublic(["/wissen", "/wissen/[slug]"]);
  redirect("/admin/artikel");
}

export async function deleteArticle(formData: FormData) {
  const session = await requireRole(CONTENT_ROLES);
  if (!session) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.blogPost.delete({ where: { id } });
  await writeAuditLog({
    userId: session.user.id,
    action: "DELETE",
    entityType: "BlogPost",
    entityId: id
  });
  revalidatePath("/admin/artikel");
  revalidatePublic(["/wissen", "/wissen/[slug]"]);
}

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------

const testimonialSchema = z.object({
  id: z.string().optional(),
  authorName: z.string().trim().min(2).max(160),
  authorCompany: z.string().trim().max(160).optional(),
  authorRole: z.string().trim().max(160).optional(),
  quote: z.string().trim().min(10).max(1000),
  isPublished: z.coerce.boolean()
});

export async function saveTestimonial(formData: FormData) {
  const session = await requireRole(CONTENT_ROLES);
  if (!session) redirect("/admin/login");

  const parsed = testimonialSchema.safeParse({
    id: formData.get("id") || undefined,
    authorName: formData.get("authorName"),
    authorCompany: formData.get("authorCompany") || undefined,
    authorRole: formData.get("authorRole") || undefined,
    quote: formData.get("quote"),
    isPublished: formData.get("isPublished") === "on"
  });
  if (!parsed.success) redirect("/admin/testimonials?fehler=validierung");

  const data = parsed.data;
  const translation = { locale: "de", quote: data.quote };

  if (data.id) {
    await prisma.testimonial.update({
      where: { id: data.id },
      data: {
        authorName: data.authorName,
        authorCompany: data.authorCompany ?? null,
        authorRole: data.authorRole ?? null,
        isPublished: data.isPublished,
        translations: {
          upsert: {
            where: {
              testimonialId_locale: { testimonialId: data.id, locale: "de" }
            },
            update: translation,
            create: translation
          }
        }
      }
    });
  } else {
    await prisma.testimonial.create({
      data: {
        authorName: data.authorName,
        authorCompany: data.authorCompany ?? null,
        authorRole: data.authorRole ?? null,
        isPublished: data.isPublished,
        translations: { create: translation }
      }
    });
  }

  await writeAuditLog({
    userId: session.user.id,
    action: data.id ? "UPDATE" : "CREATE",
    entityType: "Testimonial",
    entityId: data.id
  });
  revalidatePath("/admin/testimonials");
  revalidatePublic([""]);
  redirect("/admin/testimonials");
}

export async function deleteTestimonial(formData: FormData) {
  const session = await requireRole(CONTENT_ROLES);
  if (!session) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.testimonial.delete({ where: { id } });
  await writeAuditLog({
    userId: session.user.id,
    action: "DELETE",
    entityType: "Testimonial",
    entityId: id
  });
  revalidatePath("/admin/testimonials");
  revalidatePublic([""]);
}
