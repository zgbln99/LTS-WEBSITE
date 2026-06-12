import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  Newspaper,
  PanelBottom,
  PencilRuler,
  Quote,
  Type,
  Users
} from "lucide-react";
import { auth } from "@/auth";
import { logoutAction } from "@/server/actions/admin";
import type { Role } from "@prisma/client";

const roleLabels: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  HR: "HR",
  MARKETING: "Marketing",
  EDITOR: "Redaktion"
};

const navItems = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["SUPER_ADMIN", "HR", "MARKETING", "EDITOR"] as Role[]
  },
  {
    href: "/admin/anfragen",
    label: "Transportanfragen",
    icon: Inbox,
    roles: ["SUPER_ADMIN", "MARKETING"] as Role[]
  },
  {
    href: "/admin/kontaktanfragen",
    label: "Kontaktanfragen",
    icon: Mail,
    roles: ["SUPER_ADMIN", "MARKETING"] as Role[]
  },
  {
    href: "/admin/bewerbungen",
    label: "Bewerbungen",
    icon: Users,
    roles: ["SUPER_ADMIN", "HR"] as Role[]
  },
  {
    href: "/admin/stellen",
    label: "Stellenanzeigen",
    icon: Briefcase,
    roles: ["SUPER_ADMIN", "HR"] as Role[]
  },
  {
    href: "/admin/artikel",
    label: "Wissenszentrum",
    icon: Newspaper,
    roles: ["SUPER_ADMIN", "MARKETING", "EDITOR"] as Role[]
  },
  {
    href: "/admin/testimonials",
    label: "Testimonials",
    icon: Quote,
    roles: ["SUPER_ADMIN", "MARKETING", "EDITOR"] as Role[]
  },
  {
    href: "/admin/einsatzorte",
    label: "Einsatzorte",
    icon: MapPin,
    roles: ["SUPER_ADMIN", "MARKETING", "EDITOR"] as Role[]
  },
  {
    href: "/admin/texte",
    label: "Website-Texte",
    icon: Type,
    roles: ["SUPER_ADMIN", "MARKETING", "EDITOR"] as Role[]
  },
  {
    href: "/admin/seiten",
    label: "Seiten-Editor",
    icon: PencilRuler,
    roles: ["SUPER_ADMIN", "MARKETING", "EDITOR"] as Role[]
  },
  {
    href: "/admin/fusszeile",
    label: "Fußzeile",
    icon: PanelBottom,
    roles: ["SUPER_ADMIN", "MARKETING", "EDITOR"] as Role[]
  }
];

export default async function AdminDashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const items = navItems.filter((item) =>
    item.roles.includes(session.user.role)
  );

  return (
    <div className="flex min-h-svh">
      <aside className="hidden w-64 shrink-0 flex-col bg-night-950 p-5 lg:flex">
        <Link href="/admin" className="flex items-center gap-2 text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-500 font-display text-sm font-extrabold">
            LTS
          </span>
          <span className="font-display text-base font-bold">Admin</span>
        </Link>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-mist-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/10 pt-4">
          <p className="truncate text-sm font-semibold text-white">
            {session.user.name}
          </p>
          <p className="text-xs text-mist-400">
            {roleLabels[session.user.role]}
          </p>
          <form action={logoutAction} className="mt-3">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-mist-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Abmelden
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile Topbar */}
        <header className="flex items-center justify-between gap-3 bg-night-950 px-4 py-3 lg:hidden">
          <Link href="/admin" className="flex items-center gap-2 text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500 font-display text-xs font-extrabold">
              LTS
            </span>
            <span className="font-display text-sm font-bold">Admin</span>
          </Link>
          <nav className="flex items-center gap-1 overflow-x-auto">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg p-2 text-mist-300 hover:bg-white/10 hover:text-white"
                title={item.label}
              >
                <item.icon className="h-4 w-4" />
              </Link>
            ))}
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-lg p-2 text-mist-300 hover:bg-white/10 hover:text-white"
                title="Abmelden"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </nav>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
