import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import type { Role } from "@prisma/client";

const roleLabels: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  HR: "HR",
  MARKETING: "Marketing",
  EDITOR: "Redaktion"
};

export default async function AdminDashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <AdminShell
      role={session.user.role}
      userName={session.user.name}
      roleLabel={roleLabels[session.user.role]}
    >
      {children}
    </AdminShell>
  );
}
