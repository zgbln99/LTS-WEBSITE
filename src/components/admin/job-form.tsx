import { Languages } from "lucide-react";
import type { JobPosting, JobPostingTranslation } from "@prisma/client";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { HtmlField } from "@/components/admin/html-field";
import { saveJobPosting } from "@/server/actions/content";
import { toRichHtml } from "@/lib/richtext";

const localeNames: Record<string, string> = {
  de: "Deutsch",
  en: "Englisch",
  pl: "Polnisch",
  tr: "Türkisch",
  uk: "Ukrainisch"
};

const categoryOptions = [
  { value: "drivers", label: "Fahrer" },
  { value: "dispatchers", label: "Disposition" },
  { value: "office", label: "Büro und Verwaltung" },
  { value: "logistics", label: "Logistik" },
  { value: "warehouse", label: "Lager" }
];

const employmentOptions = [
  { value: "FULL_TIME", label: "Vollzeit" },
  { value: "PART_TIME", label: "Teilzeit" },
  { value: "MINI_JOB", label: "Minijob" },
  { value: "APPRENTICESHIP", label: "Ausbildung" }
];

const statusOptions = [
  { value: "DRAFT", label: "Entwurf" },
  { value: "PUBLISHED", label: "Veröffentlicht" },
  { value: "ARCHIVED", label: "Archiviert" }
];

interface JobFormProps {
  job?: JobPosting & {
    translations: JobPostingTranslation[];
    category: { key: string };
  };
  sourceLocale?: string;
  autoTranslate?: boolean;
}

export function JobForm({
  job,
  sourceLocale = "de",
  autoTranslate = false
}: JobFormProps) {
  // Inhalte in der Ausgangssprache laden (Fallback Deutsch / erste Sprache).
  const translation =
    job?.translations.find((entry) => entry.locale === sourceLocale) ??
    job?.translations.find((entry) => entry.locale === "de") ??
    job?.translations[0];
  const toLines = (value: unknown) =>
    Array.isArray(value) ? value.join("\n") : "";

  return (
    <form action={saveJobPosting} className="space-y-5">
      {job ? <input type="hidden" name="id" value={job.id} /> : null}

      {autoTranslate ? (
        <div className="flex items-start gap-3 rounded-2xl border border-accent-500/20 bg-accent-500/5 p-4 text-sm text-night-800">
          <Languages className="mt-0.5 h-5 w-5 shrink-0 text-accent-600" />
          <p>
            Inhalte in{" "}
            <strong>{localeNames[sourceLocale] ?? sourceLocale}</strong>{" "}
            eingeben. Beim Speichern wird die Stelle automatisch in alle
            anderen Sprachen übersetzt.
          </p>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Titel" htmlFor="job-title" required>
          <Input
            id="job-title"
            name="title"
            required
            minLength={3}
            defaultValue={translation?.title}
            placeholder="LKW-Fahrer CE (m/w/d)"
          />
        </Field>
        <Field label="URL-Slug (leer = automatisch)" htmlFor="job-slug">
          <Input id="job-slug" name="slug" defaultValue={translation?.slug} />
        </Field>
        <Field label="Bereich" htmlFor="job-category" required>
          <Select
            id="job-category"
            name="categoryKey"
            required
            defaultValue={job?.category.key ?? "drivers"}
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Standort" htmlFor="job-location" required>
          <Input
            id="job-location"
            name="locationCity"
            required
            defaultValue={job?.locationCity}
            placeholder="Schönefeld (Berlin)"
          />
        </Field>
        <Field label="Land" htmlFor="job-country">
          <Input
            id="job-country"
            name="country"
            defaultValue={job?.country ?? "Deutschland"}
          />
        </Field>
        <Field label="Führerscheinkategorie (z.B. C+E)" htmlFor="job-license">
          <Input
            id="job-license"
            name="licenseCategory"
            defaultValue={job?.licenseCategory ?? "C+E"}
          />
        </Field>
        <Field
          label="Arbeitssystem (z.B. 2/1, tägliche Heimkehr)"
          htmlFor="job-system"
        >
          <Input
            id="job-system"
            name="workSystem"
            defaultValue={job?.workSystem ?? ""}
          />
        </Field>
        <Field label="Gehaltsangabe" htmlFor="job-salary-note">
          <Select
            id="job-salary-note"
            name="salaryNote"
            defaultValue={job?.salaryNote ?? "Netto"}
          >
            <option value="Netto">Netto</option>
            <option value="Brutto">Brutto</option>
          </Select>
        </Field>
        <Field label="Anstellungsart" htmlFor="job-employment" required>
          <Select
            id="job-employment"
            name="employmentType"
            required
            defaultValue={job?.employmentType ?? "FULL_TIME"}
          >
            {employmentOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Status" htmlFor="job-status" required>
          <Select
            id="job-status"
            name="status"
            required
            defaultValue={job?.status ?? "DRAFT"}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Gehalt von (EUR/Monat)" htmlFor="job-salary-min">
          <Input
            id="job-salary-min"
            name="salaryMin"
            type="number"
            min={0}
            defaultValue={job?.salaryMin ?? ""}
          />
        </Field>
        <Field label="Gehalt bis (EUR/Monat)" htmlFor="job-salary-max">
          <Input
            id="job-salary-max"
            name="salaryMax"
            type="number"
            min={0}
            defaultValue={job?.salaryMax ?? ""}
          />
        </Field>
        <Field label="Gültig bis" htmlFor="job-valid-through">
          <Input
            id="job-valid-through"
            name="validThrough"
            type="date"
            defaultValue={
              job?.validThrough
                ? job.validThrough.toISOString().slice(0, 10)
                : ""
            }
          />
        </Field>
        <Field
          label="Reihenfolge (kleiner = weiter oben)"
          htmlFor="job-sort-order"
        >
          <Input
            id="job-sort-order"
            name="sortOrder"
            type="number"
            defaultValue={job?.sortOrder ?? 0}
          />
        </Field>
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-night-900">
          Beschreibung <span className="text-accent-600">*</span>
        </span>
        <HtmlField
          name="description"
          initialValue={toRichHtml(translation?.description)}
        />
        <p className="mt-1.5 text-xs text-mist-400">
          Mit Überschriften, Fettungen und Aufzählungen formatierbar - ideal für
          Abschnitte wie „Deine Benefits", „Deine Aufgaben" und „Dein Profil".
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Anforderungen (eine pro Zeile, optional)"
          htmlFor="job-requirements"
        >
          <Textarea
            id="job-requirements"
            name="requirements"
            className="min-h-32"
            defaultValue={toLines(translation?.requirements)}
          />
        </Field>
        <Field label="Benefits (einer pro Zeile)" htmlFor="job-benefits">
          <Textarea
            id="job-benefits"
            name="benefits"
            className="min-h-32"
            defaultValue={toLines(translation?.benefits)}
          />
        </Field>
      </div>

      <button
        type="submit"
        className="rounded-full bg-accent-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-600"
      >
        Speichern
      </button>
    </form>
  );
}
