"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, Phone, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { AppPathname, Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { company } from "@/data/company";
import { cn } from "@/lib/utils";

const navItems: {
  key: string;
  href: Exclude<AppPathname, "/leistungen/[slug]">;
}[] = [
  { key: "about", href: "/unternehmen" },
  { key: "services", href: "/leistungen" },
  { key: "fleet", href: "/fuhrpark" },
  { key: "career", href: "/karriere" },
  { key: "knowledge", href: "/wissen" },
  { key: "contact", href: "/kontakt" }
];

export function Header({ locale }: { locale: Locale }) {
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="glass border-b border-white/10">
        <Container className="flex h-16 items-center justify-between gap-4 lg:h-20">
          <Link
            href="/"
            className="flex items-center gap-2 text-white"
            onClick={() => setOpen(false)}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-500 font-display text-sm font-extrabold text-white">
              LTS
            </span>
            <span className="font-display text-lg font-bold tracking-tight">
              Logistik
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-mist-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                {t(`nav.${item.key}`)}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <LanguageSwitcher locale={locale} />
            <Button asChild size="sm">
              <Link href="/transportanfrage">{t("cta.inquiry")}</Link>
            </Button>
          </div>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10 lg:hidden"
            aria-label={open ? t("close") : t("menu")}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </Container>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "glass max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-white/10 lg:hidden",
          open ? "block" : "hidden"
        )}
      >
        <Container className="flex flex-col gap-1 py-4">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="rounded-xl px-4 py-3 text-base font-medium text-mist-200 hover:bg-white/10 hover:text-white"
              onClick={() => setOpen(false)}
            >
              {t(`nav.${item.key}`)}
            </Link>
          ))}
          <div className="mt-3 flex flex-col gap-3 border-t border-white/10 pt-4">
            <LanguageSwitcher locale={locale} />
            <Button asChild className="w-full">
              <Link href="/transportanfrage" onClick={() => setOpen(false)}>
                {t("cta.inquiry")}
              </Link>
            </Button>
            <a
              href={company.phoneHref}
              className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-mist-300"
            >
              <Phone className="h-4 w-4" />
              {company.phone}
            </a>
          </div>
        </Container>
      </div>
    </header>
  );
}
