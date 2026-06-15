"use client";

import { useState } from "react";
import type { BlogPost, BlogPostTranslation } from "@prisma/client";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { saveArticle } from "@/server/actions/content";
import { RichTextField } from "@/builder/rich-text-field";
import { ImageField } from "@/builder/fields/image-field";

const statusOptions = [
  { value: "DRAFT", label: "Entwurf" },
  { value: "PUBLISHED", label: "Veröffentlicht" },
  { value: "ARCHIVED", label: "Archiviert" }
];

interface ArticleFormProps {
  article?: BlogPost & { translations: BlogPostTranslation[] };
  sourceLocale?: string;
  initialHtml?: string;
  initialImage?: string;
}

export function ArticleForm({
  article,
  sourceLocale = "de",
  initialHtml = "",
  initialImage = ""
}: ArticleFormProps) {
  const translation =
    article?.translations.find((entry) => entry.locale === sourceLocale) ??
    article?.translations.find((entry) => entry.locale === "de") ??
    article?.translations[0];

  const [content, setContent] = useState(initialHtml || "<p></p>");
  const [image, setImage] = useState(initialImage);

  return (
    <form action={saveArticle} className="space-y-5">
      {article ? <input type="hidden" name="id" value={article.id} /> : null}
      <input type="hidden" name="content" value={content} />
      <input type="hidden" name="image" value={image} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Titel" htmlFor="article-title" required>
          <Input
            id="article-title"
            name="title"
            required
            minLength={3}
            defaultValue={translation?.title}
          />
        </Field>
        <Field label="URL-Slug (leer = automatisch)" htmlFor="article-slug">
          <Input
            id="article-slug"
            name="slug"
            defaultValue={translation?.slug}
          />
        </Field>
      </div>

      <Field label="Teaser (Kurzbeschreibung)" htmlFor="article-excerpt" required>
        <Textarea
          id="article-excerpt"
          name="excerpt"
          required
          minLength={10}
          maxLength={500}
          className="min-h-20"
          defaultValue={translation?.excerpt}
        />
      </Field>

      <Field label="Titelbild (optional)" htmlFor="article-image">
        <ImageField value={image} onChange={setImage} />
      </Field>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-night-900">
          Inhalt
        </span>
        <RichTextField value={content} onChange={setContent} />
      </div>

      <Field label="Status" htmlFor="article-status" required>
        <Select
          id="article-status"
          name="status"
          required
          defaultValue={article?.status ?? "DRAFT"}
          className="sm:max-w-xs"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>

      <button
        type="submit"
        className="rounded-full bg-accent-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-600"
      >
        Speichern
      </button>
    </form>
  );
}
