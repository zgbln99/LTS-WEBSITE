"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HoneypotField, Input } from "@/components/ui/field";
import { TimeTrapField } from "@/components/ui/time-trap";
import { CaptchaWidget } from "@/components/ui/captcha";
import { submitJobAlert } from "@/server/actions/forms";
import { idleFormState } from "@/lib/forms";

// Kompaktes Anmeldeformular für Job-Benachrichtigungen.
export function JobAlertForm({ defaultRegion }: { defaultRegion?: string }) {
  const t = useTranslations("jobAlert");
  const tForms = useTranslations("forms");
  const locale = useLocale();
  const [state, action, pending] = useActionState(submitJobAlert, idleFormState);

  if (state.status === "success") {
    return (
      <div className="rounded-2xl bg-white/10 p-6 text-center">
        <BellRing className="mx-auto h-7 w-7 text-mint-400" />
        <h3 className="mt-3 font-display text-lg font-bold text-white">
          {t("successTitle")}
        </h3>
        <p className="mt-1 text-sm text-mist-300">{t("successText")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-night-950 p-6 sm:p-8">
      <div className="flex items-center gap-2 text-accent-400">
        <BellRing className="h-5 w-5" />
        <span className="text-xs font-semibold uppercase tracking-wider">
          {t("title")}
        </span>
      </div>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-mist-300">
        {t("text")}
      </p>
      <form action={action} className="relative mt-5 space-y-3">
        <HoneypotField />
        <TimeTrapField />
        <input type="hidden" name="locale" value={locale} />
        {defaultRegion ? (
          <input type="hidden" name="region" value={defaultRegion} />
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            name="email"
            type="email"
            required
            placeholder={t("email")}
            className="border-white/15 bg-white/5 text-white placeholder:text-mist-400"
          />
          {!defaultRegion ? (
            <Input
              name="region"
              placeholder={t("region")}
              className="border-white/15 bg-white/5 text-white placeholder:text-mist-400 sm:w-48"
            />
          ) : null}
        </div>
        <label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-mist-400">
          <input
            type="checkbox"
            name="consent"
            required
            className="mt-0.5 h-4 w-4 shrink-0 accent-[#e11d24]"
          />
          {tForms("labels.gdpr")}
        </label>
        {state.status === "error" ? (
          <p role="alert" className="rounded-xl bg-red-500/15 px-4 py-2.5 text-sm text-red-300">
            {tForms(`errors.${state.code ?? "generic"}`)}
          </p>
        ) : null}
        <CaptchaWidget />
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? tForms("labels.sending") : t("submit")}
        </Button>
      </form>
    </div>
  );
}
