"use client";

import { useTransition } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";

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

  function onChange(next: string) {
    startTransition(() => {
      router.replace(
        // @ts-expect-error params are matched dynamically per route
        { pathname, params },
        { locale: next as Locale }
      );
    });
  }

  return (
    <label className="relative flex items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-sm text-mist-300 transition-colors hover:border-white/40 hover:text-white">
      <Globe className="h-4 w-4" aria-hidden />
      <span className="sr-only">{t("language")}</span>
      <select
        value={locale}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-transparent pr-1 text-sm font-medium uppercase outline-none [&>option]:text-night-900"
        aria-label={t("language")}
      >
        {locales.map((l) => (
          <option key={l} value={l}>
            {labels[l]}
          </option>
        ))}
      </select>
    </label>
  );
}
