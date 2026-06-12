import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { requireRole } from "@/auth";
import { prisma } from "@/server/db";
import { safeQuery } from "@/server/safe";
import { deleteArticle } from "@/server/actions/content";
import {
  DbErrorBanner,
  EmptyState,
  StatusBadge,
  formatDateTime
} from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

export const metadata = { title: "Wissenszentrum" };

const publishLabels: Record<string, string> = {
  DRAFT: "Entwurf",
  PUBLISHED: "Veröffentlicht",
  ARCHIVED: "Archiviert"
};

const publishColors: Record<string, string> = {
  DRAFT: "NEW",
  PUBLISHED: "HIRED",
  ARCHIVED: "CLOSED"
};

export default async function ArticlesAdminPage() {
  const session = await requireRole(["SUPER_ADMIN", "MARKETING", "EDITOR"]);
  if (!session) redirect("/admin");

  const articles = await safeQuery(() =>
    prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
      include: { translations: { where: { locale: "de" } } }
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-extrabold text-night-900">
          Wissenszentrum
        </h1>
        <Link
          href="/admin/artikel/neu"
          className="flex items-center gap-2 rounded-full bg-accent-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-600"
        >
          <Plus className="h-4 w-4" />
          Neuer Artikel
        </Link>
      </div>

      {!articles ? (
        <DbErrorBanner />
      ) : articles.length === 0 ? (
        <EmptyState text="Noch keine Artikel angelegt." />
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-mist-100 text-xs uppercase tracking-wide text-mist-400">
                <th className="px-5 py-3.5 font-semibold">Titel</th>
                <th className="px-5 py-3.5 font-semibold">Veröffentlicht</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-mist-100">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-mist-50">
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/artikel/${article.id}`}
                      className="font-semibold text-accent-600 hover:underline"
                    >
                      {article.translations[0]?.title ?? "Ohne Titel"}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-mist-500">
                    {formatDateTime(article.publishedAt)}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge
                      status={publishColors[article.status]}
                      label={publishLabels[article.status]}
                    />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <form action={deleteArticle} className="inline">
                      <input type="hidden" name="id" value={article.id} />
                      <button
                        type="submit"
                        className="rounded-lg p-2 text-mist-400 hover:bg-red-50 hover:text-red-600"
                        title="Löschen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
