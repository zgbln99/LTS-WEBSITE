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
import { submitAppointmentRequest } from "@/server/actions/forms";
import { idleFormState } from "@/lib/forms";

export function AppointmentForm() {
  const t = useTranslations("appointment");
  const tForms = useTranslations("forms");
  const locale = useLocale();
  const [state, action, pending] = useActionState(
    submitAppointmentRequest,
    idleFormState
  );

  if (state.status === "success") {
    return (
      <SuccessPanel title={t("successTitle")} text={t("successText")} />
    );
  }

  return (
    <form action={action} className="relative space-y-5">
      <HoneypotField />
      <TimeTrapField />
      <input type="hidden" name="locale" value={locale} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("name")} htmlFor="appt-name" required>
          <Input id="appt-name" name="name" required minLength={2} autoComplete="name" />
        </Field>
        <Field label={t("phone")} htmlFor="appt-phone" required>
          <Input id="appt-phone" name="phone" type="tel" required autoComplete="tel" />
        </Field>
        <Field label={t("email")} htmlFor="appt-email">
          <Input id="appt-email" name="email" type="email" autoComplete="email" />
        </Field>
        <Field label={t("type")} htmlFor="appt-type" required>
          <Select id="appt-type" name="type" required defaultValue="interview">
            <option value="interview">{t("typeInterview")}</option>
            <option value="trial_day">{t("typeTrial")}</option>
          </Select>
        </Field>
        <Field label={t("date")} htmlFor="appt-date">
          <Input id="appt-date" name="preferredDate" type="date" />
        </Field>
        <Field label={t("timeWindow")} htmlFor="appt-window" required>
          <Select id="appt-window" name="timeWindow" required defaultValue="flexible">
            <option value="morning">{t("windowMorning")}</option>
            <option value="afternoon">{t("windowAfternoon")}</option>
            <option value="flexible">{t("windowFlexible")}</option>
          </Select>
        </Field>
      </div>

      <Field label={t("message")} htmlFor="appt-message">
        <Textarea id="appt-message" name="message" />
      </Field>

      <ConsentCheckbox label={tForms("labels.gdpr")} />
      <CaptchaWidget />
      <FormStatusMessage
        status={state.status}
        errorText={state.code ? tForms(`errors.${state.code}`) : undefined}
      />

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? tForms("labels.sending") : tForms("labels.submit")}
      </Button>
    </form>
  );
}
