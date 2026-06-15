"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Check, ChevronDown, Globe } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const labels: Record<Locale, string> = {
  de: "Deutsch",
  en: "English",
  pl: "Polski",
  tr: "Türkçe",
  uk: "Українська"
};

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const t = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Schließen bei Klick außerhalb oder Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function onChange(next: string) {
    setOpen(false);
    if (next === locale) return;
    startTransition(() => {
      router.replace(
        // @ts-expect-error params are matched dynamically per route
        { pathname, params },
        { locale: next as Locale }
      );
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("language")}
        className={cn(
          "flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-colors",
          open
            ? "border-white/40 text-white"
            : "border-white/15 text-mist-300 hover:border-white/40 hover:text-white"
        )}
      >
        <Globe className="h-4 w-4" aria-hidden />
        <span className="uppercase">{locale}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-2 min-w-44 overflow-hidden rounded-2xl border border-white/10 bg-night-950/95 p-1.5 shadow-xl backdrop-blur"
        >
          {locales.map((entry) => {
            const active = entry === locale;
            return (
              <li key={entry}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => onChange(entry)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-white/10 text-white"
                      : "text-mist-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="w-7 text-xs font-semibold uppercase tracking-wide text-mist-400">
                      {entry}
                    </span>
                    {labels[entry]}
                  </span>
                  {active ? (
                    <Check className="h-4 w-4 text-accent-400" aria-hidden />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
