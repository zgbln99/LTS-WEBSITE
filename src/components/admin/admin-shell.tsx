"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ExternalLink,
  LogOut,
  Menu,
  Search,
  X
} from "lucide-react";
import type { Role } from "@prisma/client";
import { logoutAction } from "@/server/actions/admin";
import { CommandPalette } from "@/components/admin/command-palette";
import { isActive, visibleSections } from "@/components/admin/nav-config";
import { cn } from "@/lib/utils";

const COLLAPSE_KEY = "lts-admin-collapsed";

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
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  const sections = visibleSections(role);
  const allItems = sections.flatMap((section) => section.items);
  const active = [...allItems]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => isActive(pathname, item.href));
  const pageTitle = active?.label ?? "Admin";

  // Zustand der eingeklappten Gruppen aus dem Browser laden/speichern.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(COLLAPSE_KEY);
      if (stored) setCollapsed(JSON.parse(stored));
    } catch {
      // ignorieren
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(COLLAPSE_KEY, JSON.stringify(collapsed));
  }, [collapsed, ready]);

  // Tastenkürzel zum Öffnen der Befehlspalette (Ctrl/Cmd + K).
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const toggleSection = (title: string) =>
    setCollapsed((current) =>
      current.includes(title)
        ? current.filter((entry) => entry !== title)
        : [...current, title]
    );

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

      <nav className="mt-6 flex flex-1 flex-col gap-4 overflow-y-auto pr-1">
        {sections.map((section, index) => {
          const isCollapsed = section.title
            ? collapsed.includes(section.title)
            : false;
          const sectionActive = section.items.some((item) =>
            isActive(pathname, item.href)
          );
          return (
            <div key={section.title ?? `s-${index}`} className="flex flex-col gap-0.5">
              {section.title ? (
                <button
                  type="button"
                  onClick={() => toggleSection(section.title!)}
                  className="flex items-center justify-between gap-2 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-mist-500 transition-colors hover:text-mist-300"
                >
                  {section.title}
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform",
                      isCollapsed && "-rotate-90"
                    )}
                  />
                </button>
              ) : null}
              {!isCollapsed || sectionActive
                ? section.items.map((item) => {
                    const activeItem = isActive(pathname, item.href);
                    if (isCollapsed && !activeItem) return null;
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
                  })
                : null}
            </div>
          );
        })}
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
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col bg-night-950 p-4 lg:flex">
        {sidebar}
      </aside>

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
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-mist-300 bg-white px-3 py-1.5 text-sm text-mist-500 transition-colors hover:bg-mist-100"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Suchen</span>
              <kbd className="hidden rounded border border-mist-200 px-1.5 text-[10px] font-semibold sm:inline">
                ⌘K
              </kbd>
            </button>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-mist-300 px-3.5 py-1.5 text-sm font-medium text-night-900 transition-colors hover:bg-mist-100"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Website</span>
            </a>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      <CommandPalette
        items={allItems}
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
      />
    </div>
  );
}
