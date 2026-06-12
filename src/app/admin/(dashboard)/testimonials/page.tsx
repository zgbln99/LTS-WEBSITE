import { redirect } from "next/navigation";
import { Trash2 } from "lucide-react";
import { requireRole } from "@/auth";
import { prisma } from "@/server/db";
import { safeQuery } from "@/server/safe";
import {
  deleteTestimonial,
  saveTestimonial
} from "@/server/actions/content";
import {
  AdminCard,
  DbErrorBanner,
  EmptyState,
  StatusBadge
} from "@/components/admin/admin-ui";
import { Field, Input, Textarea } from "@/components/ui/field";

export const dynamic = "force-dynamic";

export const metadata = { title: "Testimonials" };

export default async function TestimonialsAdminPage() {
  const session = await requireRole(["SUPER_ADMIN", "MARKETING", "EDITOR"]);
  if (!session) redirect("/admin");

  const testimonials = await safeQuery(() =>
    prisma.testimonial.findMany({
      orderBy: { createdAt: "desc" },
      include: { translations: { where: { locale: "de" } } }
    })
  );

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-extrabold text-night-900">
        Testimonials
      </h1>

      <AdminCard title="Neues Testimonial">
        <form action={saveTestimonial} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Name" htmlFor="new-name" required>
              <Input id="new-name" name="authorName" required minLength={2} />
            </Field>
            <Field label="Firma" htmlFor="new-company">
              <Input id="new-company" name="authorCompany" />
            </Field>
            <Field label="Position" htmlFor="new-role">
              <Input id="new-role" name="authorRole" />
            </Field>
          </div>
          <Field label="Zitat" htmlFor="new-quote" required>
            <Textarea id="new-quote" name="quote" required minLength={10} />
          </Field>
          <label className="flex items-center gap-2.5 text-sm text-night-900">
            <input type="checkbox" name="isPublished" className="h-4 w-4 accent-[#e11d24]" />
            Sofort veröffentlichen
          </label>
          <button
            type="submit"
            className="rounded-full bg-accent-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-600"
          >
            Speichern
          </button>
        </form>
      </AdminCard>

      {!testimonials ? (
        <DbErrorBanner />
      ) : testimonials.length === 0 ? (
        <EmptyState text="Noch keine Testimonials angelegt. Auf der Website werden bis dahin die Beispieltexte angezeigt." />
      ) : (
        <div className="space-y-4">
          {testimonials.map((testimonial) => (
            <AdminCard key={testimonial.id}>
              <form action={saveTestimonial} className="space-y-4">
                <input type="hidden" name="id" value={testimonial.id} />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <StatusBadge
                    status={testimonial.isPublished ? "HIRED" : "NEW"}
                    label={testimonial.isPublished ? "Veröffentlicht" : "Entwurf"}
                  />
                  <button
                    type="submit"
                    formAction={deleteTestimonial}
                    className="rounded-lg p-2 text-mist-400 hover:bg-red-50 hover:text-red-600"
                    title="Löschen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Name" htmlFor={`name-${testimonial.id}`} required>
                    <Input
                      id={`name-${testimonial.id}`}
                      name="authorName"
                      required
                      defaultValue={testimonial.authorName}
                    />
                  </Field>
                  <Field label="Firma" htmlFor={`company-${testimonial.id}`}>
                    <Input
                      id={`company-${testimonial.id}`}
                      name="authorCompany"
                      defaultValue={testimonial.authorCompany ?? ""}
                    />
                  </Field>
                  <Field label="Position" htmlFor={`role-${testimonial.id}`}>
                    <Input
                      id={`role-${testimonial.id}`}
                      name="authorRole"
                      defaultValue={testimonial.authorRole ?? ""}
                    />
                  </Field>
                </div>
                <Field label="Zitat" htmlFor={`quote-${testimonial.id}`} required>
                  <Textarea
                    id={`quote-${testimonial.id}`}
                    name="quote"
                    required
                    defaultValue={testimonial.translations[0]?.quote ?? ""}
                  />
                </Field>
                <div className="flex items-center justify-between gap-3">
                  <label className="flex items-center gap-2.5 text-sm text-night-900">
                    <input
                      type="checkbox"
                      name="isPublished"
                      defaultChecked={testimonial.isPublished}
                      className="h-4 w-4 accent-[#e11d24]"
                    />
                    Veröffentlicht
                  </label>
                  <button
                    type="submit"
                    className="rounded-full bg-night-950 px-5 py-2 text-sm font-medium text-white hover:bg-night-800"
                  >
                    Aktualisieren
                  </button>
                </div>
              </form>
            </AdminCard>
          ))}
        </div>
      )}
    </div>
  );
}
