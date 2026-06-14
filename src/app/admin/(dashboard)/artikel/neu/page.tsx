import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/auth";
import { AdminCard } from "@/components/admin/admin-ui";
import { ArticleForm } from "@/components/admin/article-form";
import { getTranslationSettings } from "@/server/site-settings";

export const dynamic = "force-dynamic";

export const metadata = { title: "Neuer Artikel" };

export default async function NewArticlePage() {
  const session = await requireRole(["SUPER_ADMIN", "MARKETING", "EDITOR"]);
  if (!session) redirect("/admin");

  const { sourceLocale } = await getTranslationSettings();

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
          Neuer Artikel
        </h1>
      </div>
      <AdminCard>
        <ArticleForm sourceLocale={sourceLocale} />
      </AdminCard>
    </div>
  );
}
