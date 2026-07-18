"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  ConsentCheckbox,
  Field,
  FormStatusMessage,
  HoneypotField,
  Input,
  Select,
  SuccessPanel,
  Textarea
} from "@/components/ui/field";
import { TimeTrapField } from "@/components/ui/time-trap";
import { CaptchaWidget } from "@/components/ui/captcha";
import { SourceField } from "@/components/ui/source-field";
import { submitApplication } from "@/server/actions/forms";
import { idleFormState, jobCategoryKeys } from "@/lib/forms";

const licenseClasses = ["", "B", "C1", "C", "CE"] as const;

export function ApplicationForm({
  presetCategory,
  jobId
}: {
  presetCategory?: (typeof jobCategoryKeys)[number];
  jobId?: string;
}) {
  const t = useTranslations("forms");
  const locale = useLocale();
  const [state, action, pending] = useActionState(
    submitApplication,
    idleFormState
  );

  const showDriverFields =
    presetCategory === "drivers" || presetCategory === undefined;

  if (state.status === "success") {
    return (
      <SuccessPanel
        title={t("application.success.title")}
        text={t("application.success.text")}
      />
    );
  }

  return (
    <form action={action} className="relative space-y-5">
      <HoneypotField />
      <TimeTrapField />
      <SourceField />
      <input type="hidden" name="locale" value={locale} />
      {jobId ? <input type="hidden" name="jobId" value={jobId} /> : null}

      {/* Es werden ausschließlich Fahrer gesucht - keine Bereichsauswahl. */}
      <input type="hidden" name="category" value={presetCategory ?? "drivers"} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("labels.firstName")} htmlFor="app-first-name" required>
          <Input id="app-first-name" name="firstName" required minLength={2} autoComplete="given-name" />
        </Field>
        <Field label={t("labels.lastName")} htmlFor="app-last-name" required>
          <Input id="app-last-name" name="lastName" required minLength={2} autoComplete="family-name" />
        </Field>
        <Field label={t("labels.email")} htmlFor="app-email" required>
          <Input id="app-email" name="email" type="email" required autoComplete="email" />
        </Field>
        <Field label={t("labels.phone")} htmlFor="app-phone" required>
          <Input id="app-phone" name="phone" type="tel" required minLength={5} autoComplete="tel" />
        </Field>
      </div>

      {showDriverFields ? (
        <Field label={t("application.licenseClass")} htmlFor="app-license-class">
          <Select id="app-license-class" name="licenseClass" defaultValue="" className="sm:max-w-xs">
            {licenseClasses.map((licenseClass) => (
              <option key={licenseClass} value={licenseClass}>
                {licenseClass === "" ? "-" : licenseClass}
              </option>
            ))}
          </Select>
        </Field>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label={t("application.cv")} htmlFor="app-cv">
          <Input id="app-cv" name="cv" type="file" accept=".pdf,.jpg,.jpeg,.png" className="p-2.5" />
        </Field>
        <Field label={t("application.licenseFile")} htmlFor="app-license-file">
          <Input id="app-license-file" name="licenseFile" type="file" accept=".pdf,.jpg,.jpeg,.png" className="p-2.5" />
        </Field>
        <Field label={t("application.certificates")} htmlFor="app-certificates">
          <Input id="app-certificates" name="certificates" type="file" accept=".pdf,.jpg,.jpeg,.png" multiple className="p-2.5" />
        </Field>
      </div>
      <p className="text-xs text-mist-400">{t("application.fileHint")}</p>

      <Field label={t("labels.message")} htmlFor="app-message">
        <Textarea id="app-message" name="message" />
      </Field>

      <ConsentCheckbox label={t("labels.gdpr")} />
      <CaptchaWidget />
      <FormStatusMessage
        status={state.status}
        errorText={state.code ? t(`errors.${state.code}`) : undefined}
      />

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? t("labels.sending") : t("application.submit")}
      </Button>
    </form>
  );
}
