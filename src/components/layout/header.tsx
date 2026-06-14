"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, Phone, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { AppPathname, Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Logo } from "@/components/layout/logo";
import { company } from "@/data/company";
import { cn } from "@/lib/utils";

const navItems: {
  key: string;
  href: Exclude<
    AppPathname,
    | "/leistungen/[slug]"
    | "/karriere/stelle/[slug]"
    | "/karriere/orte/[stadt]"
    | "/wissen/[slug]"
  >;
}[] = [
  { key: "about", href: "/unternehmen" },
  { key: "services", href: "/leistungen" },
  { key: "fleet", href: "/fuhrpark" },
  { key: "career", href: "/karriere" },
  { key: "knowledge", href: "/wissen" },
  { key: "contact", href: "/kontakt" }
];

export function Header({
  locale,
  siteName,
  slogan
}: {
  locale: Locale;
  siteName: string;
  slogan?: string;
}) {
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="glass border-b border-white/10">
        <Container className="flex h-16 items-center justify-between gap-4 lg:h-20">
          <Link
            href="/"
            className="flex items-center gap-3"
            onClick={() => setOpen(false)}
          >
            <Logo name={siteName} />
            {slogan ? (
              <span className="hidden max-w-[18rem] border-l border-white/15 pl-3 text-xs font-medium leading-tight text-mist-400 xl:block">
                {slogan}
              </span>
            ) : null}
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
              <Link href="/karriere">{t("cta.apply")}</Link>
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
          {slogan ? (
            <p className="px-4 pb-3 text-sm font-medium leading-snug text-mist-300">
              {slogan}
            </p>
          ) : null}
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
              <Link href="/karriere" onClick={() => setOpen(false)}>
                {t("cta.apply")}
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
