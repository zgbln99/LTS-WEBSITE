import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/auth";
import { prisma } from "@/server/db";
import { safeQuery } from "@/server/safe";
import { AdminCard } from "@/components/admin/admin-ui";
import { ArticleForm } from "@/components/admin/article-form";
import { articleHtml, articleImage } from "@/server/content";
import { getTranslationSettings } from "@/server/site-settings";

export const dynamic = "force-dynamic";

export const metadata = { title: "Artikel bearbeiten" };

export default async function EditArticlePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(["SUPER_ADMIN", "MARKETING", "EDITOR"]);
  if (!session) redirect("/admin");

  const { id } = await params;
  const article = await safeQuery(() =>
    prisma.blogPost.findUnique({
      where: { id },
      include: { translations: true }
    })
  );
  if (!article) notFound();

  const { sourceLocale } = await getTranslationSettings();
  const sourceTranslation =
    article.translations.find((entry) => entry.locale === sourceLocale) ??
    article.translations.find((entry) => entry.locale === "de") ??
    article.translations[0];
  const initialHtml = articleHtml(sourceTranslation?.content);
  const initialImage = articleImage(sourceTranslation?.content);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/artikel"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-mist-500 hover:text-night-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Alle Artikel
        </Link>
        <h1 className="mt-2 font-display text-2xl font-extrabold text-night-900">
          Artikel bearbeiten
        </h1>
      </div>
      <AdminCard>
        <ArticleForm
          article={article}
          sourceLocale={sourceLocale}
          initialHtml={initialHtml}
          initialImage={initialImage}
        />
      </AdminCard>
    </div>
  );
}
