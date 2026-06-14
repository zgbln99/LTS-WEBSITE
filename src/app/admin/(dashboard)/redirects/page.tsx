import { redirect } from "next/navigation";
import { Plus, Trash2, ArrowRight } from "lucide-react";
import { requireRole } from "@/auth";
import { prisma } from "@/server/db";
import { safeQuery } from "@/server/safe";
import { saveRedirect, deleteRedirect } from "@/server/actions/redirects";
import { Field, Input, Select } from "@/components/ui/field";
import { DbErrorBanner, EmptyState } from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

export const metadata = { title: "Weiterleitungen" };

export default async function RedirectsPage() {
  const session = await requireRole(["SUPER_ADMIN", "MARKETING"]);
  if (!session) redirect("/admin");

  const redirects = await safeQuery(() =>
    prisma.redirect.findMany({ orderBy: { createdAt: "desc" }, take: 500 })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-night-900">
          Weiterleitungen
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-mist-500">
          301-/302-Weiterleitungen für alte Adressen. Pfad inklusive
          Sprachpräfix angeben, z.B. /de/alte-seite. Änderungen greifen
          innerhalb einer Minute.
        </p>
      </div>

      <form
        action={saveRedirect}
        className="grid gap-4 rounded-2xl bg-white p-5 shadow-card sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end sm:p-6"
      >
        <Field label="Von (alter Pfad)" htmlFor="from">
          <Input id="from" name="fromPath" placeholder="/de/alte-seite" required />
        </Field>
        <Field label="Nach (Ziel)" htmlFor="to">
          <Input id="to" name="toPath" placeholder="/de/karriere" required />
        </Field>
        <Field label="Typ" htmlFor="status">
          <Select id="status" name="statusCode" defaultValue="301" className="sm:w-28">
            <option value="301">301</option>
            <option value="302">302</option>
          </Select>
        </Field>
        <button
          type="submit"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent-500 px-5 text-sm font-semibold text-white hover:bg-accent-600"
        >
          <Plus className="h-4 w-4" />
          Hinzufügen
        </button>
      </form>

      {!redirects ? (
        <DbErrorBanner />
      ) : redirects.length === 0 ? (
        <EmptyState text="Noch keine Weiterleitungen angelegt." />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-card">
          <ul className="divide-y divide-mist-100">
            {redirects.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-wrap items-center gap-3 px-5 py-3.5 text-sm"
              >
                <span className="font-mono text-night-900">{entry.fromPath}</span>
                <ArrowRight className="h-4 w-4 text-mist-400" />
                <span className="font-mono text-mist-600">{entry.toPath}</span>
                <span className="rounded-full bg-mist-100 px-2 py-0.5 text-xs font-semibold text-mist-500">
                  {entry.statusCode}
                </span>
                <form action={deleteRedirect} className="ml-auto">
                  <input type="hidden" name="id" value={entry.id} />
                  <button
                    type="submit"
                    className="rounded-lg p-2 text-mist-400 hover:bg-red-50 hover:text-red-600"
                    title="Löschen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
