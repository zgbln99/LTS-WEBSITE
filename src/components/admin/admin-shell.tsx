"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BellPlus,
  BellRing,
  Briefcase,
  CalendarClock,
  Cookie as CookieIcon,
  ExternalLink,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mail,
  MailCheck,
  MapPin,
  Menu,
  Newspaper,
  PanelBottom,
  PencilRuler,
  Quote,
  ScrollText,
  Search,
  Settings,
  ShieldCheck,
  Shuffle,
  Type,
  Users,
  X,
  type LucideIcon
} from "lucide-react";
import type { Role } from "@prisma/client";
import { logoutAction } from "@/server/actions/admin";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: Role[];
}

const navSections: { title: string | null; items: NavItem[] }[] = [
  {
    title: null,
    items: [
      {
        href: "/admin",
        label: "Dashboard",
        icon: LayoutDashboard,
        roles: ["SUPER_ADMIN", "HR", "MARKETING", "EDITOR"]
      }
    ]
  },
  {
    title: "Anfragen",
    items: [
      { href: "/admin/anfragen", label: "Transportanfragen", icon: Inbox, roles: ["SUPER_ADMIN", "MARKETING"] },
      { href: "/admin/kontaktanfragen", label: "Kontaktanfragen", icon: Mail, roles: ["SUPER_ADMIN", "MARKETING"] }
    ]
  },
  {
    title: "Recruiting",
    items: [
      { href: "/admin/bewerbungen", label: "Bewerbungen", icon: Users, roles: ["SUPER_ADMIN", "HR"] },
      { href: "/admin/stellen", label: "Stellenanzeigen", icon: Briefcase, roles: ["SUPER_ADMIN", "HR"] },
      { href: "/admin/termine", label: "Termine", icon: CalendarClock, roles: ["SUPER_ADMIN", "HR"] },
      { href: "/admin/benachrichtigungen", label: "Benachrichtigungen", icon: BellRing, roles: ["SUPER_ADMIN", "HR", "MARKETING"] },
      { href: "/admin/job-alerts", label: "Job-Benachrichtigungen", icon: BellPlus, roles: ["SUPER_ADMIN", "HR", "MARKETING"] },
      { href: "/admin/kpi", label: "Auswertungen", icon: BarChart3, roles: ["SUPER_ADMIN", "HR", "MARKETING"] }
    ]
  },
  {
    title: "Inhalte",
    items: [
      { href: "/admin/seiten", label: "Seiten-Editor", icon: PencilRuler, roles: ["SUPER_ADMIN", "MARKETING", "EDITOR"] },
      { href: "/admin/artikel", label: "Wissenszentrum", icon: Newspaper, roles: ["SUPER_ADMIN", "MARKETING", "EDITOR"] },
      { href: "/admin/testimonials", label: "Testimonials", icon: Quote, roles: ["SUPER_ADMIN", "MARKETING", "EDITOR"] },
      { href: "/admin/einsatzorte", label: "Einsatzorte", icon: MapPin, roles: ["SUPER_ADMIN", "MARKETING", "EDITOR"] },
      { href: "/admin/texte", label: "Website-Texte", icon: Type, roles: ["SUPER_ADMIN", "MARKETING", "EDITOR"] },
      { href: "/admin/email-vorlagen", label: "E-Mail-Vorlagen", icon: MailCheck, roles: ["SUPER_ADMIN", "MARKETING", "EDITOR"] },
      { href: "/admin/seo", label: "SEO", icon: Search, roles: ["SUPER_ADMIN", "MARKETING", "EDITOR"] },
      { href: "/admin/fusszeile", label: "Fußzeile", icon: PanelBottom, roles: ["SUPER_ADMIN", "MARKETING", "EDITOR"] },
      { href: "/admin/redirects", label: "Weiterleitungen", icon: Shuffle, roles: ["SUPER_ADMIN", "MARKETING"] }
    ]
  },
  {
    title: "System",
    items: [
      { href: "/admin/einstellungen", label: "Einstellungen", icon: Settings, roles: ["SUPER_ADMIN"] },
      { href: "/admin/consent", label: "Einwilligungen", icon: CookieIcon, roles: ["SUPER_ADMIN"] },
      { href: "/admin/audit", label: "Protokoll", icon: ScrollText, roles: ["SUPER_ADMIN"] },
      { href: "/admin/system", label: "System", icon: ShieldCheck, roles: ["SUPER_ADMIN"] }
    ]
  }
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({
  role,
  userName,
  roleLabel,
  children
}: {
  role: Role;
  userName: string;
  roleLabel: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const sections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.roles.includes(role))
    }))
    .filter((section) => section.items.length > 0);

  const allItems = sections.flatMap((section) => section.items);
  const active = [...allItems]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => isActive(pathname, item.href));
  const pageTitle = active?.label ?? "Admin";

  const sidebar = (
    <>
      <Link
        href="/admin"
        onClick={() => setOpen(false)}
        className="flex items-center gap-2.5 px-2 text-white"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-500 font-display text-sm font-extrabold">
          LTS
        </span>
        <span className="font-display text-base font-bold">Admin</span>
      </Link>

      <nav className="mt-6 flex flex-1 flex-col gap-5 overflow-y-auto">
        {sections.map((section, index) => (
          <div key={section.title ?? `s-${index}`} className="flex flex-col gap-0.5">
            {section.title ? (
              <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-mist-500">
                {section.title}
              </p>
            ) : null}
            {section.items.map((item) => {
              const activeItem = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={activeItem ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    activeItem
                      ? "bg-accent-500 text-white shadow-sm"
                      : "text-mist-300 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="mt-4 border-t border-white/10 pt-4">
        <div className="flex items-center gap-3 px-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 font-display text-sm font-bold text-white">
            {userName.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{userName}</p>
            <p className="text-xs text-mist-400">{roleLabel}</p>
          </div>
        </div>
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
    </>
  );

  return (
    <div className="flex min-h-svh bg-mist-50">
      {/* Desktop-Sidebar */}
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col bg-night-950 p-4 lg:flex">
        {sidebar}
      </aside>

      {/* Mobile-Drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Menü schließen"
            className="absolute inset-0 bg-night-950/60"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-night-950 p-4">
            <button
              type="button"
              aria-label="Schließen"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-mist-300 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-mist-200 bg-white/90 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Menü öffnen"
              onClick={() => setOpen(true)}
              className="rounded-lg p-2 text-night-700 hover:bg-mist-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-display text-base font-bold text-night-900">
              {pageTitle}
            </h1>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-mist-300 px-3.5 py-1.5 text-sm font-medium text-night-900 transition-colors hover:bg-mist-100"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Website ansehen</span>
          </a>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
