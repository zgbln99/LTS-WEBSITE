import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/auth";
import { prisma } from "@/server/db";
import { safeQuery } from "@/server/safe";
import { AdminCard } from "@/components/admin/admin-ui";
import { JobForm } from "@/components/admin/job-form";

export const dynamic = "force-dynamic";

export const metadata = { title: "Stelle bearbeiten" };

export default async function EditJobPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(["SUPER_ADMIN", "HR"]);
  if (!session) redirect("/admin");

  const { id } = await params;
  const job = await safeQuery(() =>
    prisma.jobPosting.findUnique({
      where: { id },
      include: { translations: true, category: true }
    })
  );
  if (!job) notFound();

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
          Stelle bearbeiten
        </h1>
      </div>
      <AdminCard>
        <JobForm job={job} />
      </AdminCard>
    </div>
  );
}
