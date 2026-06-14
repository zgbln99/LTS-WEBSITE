import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/auth";
import { AdminCard } from "@/components/admin/admin-ui";
import { JobForm } from "@/components/admin/job-form";
import { getTranslationSettings } from "@/server/site-settings";

export const dynamic = "force-dynamic";

export const metadata = { title: "Neue Stelle" };

export default async function NewJobPage() {
  const session = await requireRole(["SUPER_ADMIN", "HR"]);
  if (!session) redirect("/admin");

  const { sourceLocale } = await getTranslationSettings();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/stellen"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-mist-500 hover:text-night-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Alle Stellenanzeigen
        </Link>
        <h1 className="mt-2 font-display text-2xl font-extrabold text-night-900">
          Neue Stellenanzeige
        </h1>
      </div>
      <AdminCard>
        <JobForm sourceLocale={sourceLocale} />
      </AdminCard>
    </div>
  );
}
