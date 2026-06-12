"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HoneypotField } from "@/components/ui/field";
import { submitCallbackRequest } from "@/server/actions/forms";
import { idleFormState } from "@/lib/forms";

// Dunkles "Schneller Kontakt"-Panel: Nummer hinterlassen, HR ruft zurück.
export function CallbackPanel() {
  const t = useTranslations("career.callback");
  const tForms = useTranslations("forms");
  const locale = useLocale();
  const [state, action, pending] = useActionState(
    submitCallbackRequest,
    idleFormState
  );

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-night-950 px-6 py-12 sm:px-12 sm:py-14">
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent-500/15 blur-3xl"
        aria-hidden
      />
      <div className="relative grid items-center gap-10 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent-400">
            {t("eyebrow")}
          </span>
          <h2 className="mt-4 font-display text-3xl font-extrabold text-white sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-3 max-w-md text-base leading-relaxed text-mist-300">
            {t("text")}
          </p>
        </div>

        {state.status === "success" ? (
          <div className="rounded-3xl bg-white/10 p-8 text-center">
            <Phone className="mx-auto h-8 w-8 text-mint-400" />
            <h3 className="mt-3 font-display text-lg font-bold text-white">
              {t("successTitle")}
            </h3>
            <p className="mt-1 text-sm text-mist-300">{t("successText")}</p>
          </div>
        ) : (
          <form action={action} className="relative space-y-3">
            <HoneypotField />
            <input type="hidden" name="locale" value={locale} />
            <input
              name="name"
              placeholder={t("namePlaceholder")}
              autoComplete="name"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-sm text-white placeholder:text-mist-400 outline-none focus:border-accent-500"
            />
            <input
              name="phone"
              type="tel"
              required
              minLength={5}
              placeholder={t("phonePlaceholder")}
              autoComplete="tel"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-sm text-white placeholder:text-mist-400 outline-none focus:border-accent-500"
            />
            <label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-mist-400">
              <input
                type="checkbox"
                name="consent"
                required
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#e11d24]"
              />
              {t("consent")}
            </label>
            {state.status === "error" ? (
              <p role="alert" className="rounded-xl bg-red-500/15 px-4 py-2.5 text-sm text-red-300">
                {tForms(`errors.${state.code ?? "generic"}`)}
              </p>
            ) : null}
            <Button type="submit" size="lg" disabled={pending} className="w-full">
              {pending ? tForms("labels.sending") : t("submit")}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
