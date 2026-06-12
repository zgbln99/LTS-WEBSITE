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
import { submitContactRequest } from "@/server/actions/forms";
import { idleFormState } from "@/lib/forms";

const departments = ["general", "dispo", "hr", "billing"] as const;

export function ContactForm() {
  const t = useTranslations("forms");
  const locale = useLocale();
  const [state, action, pending] = useActionState(
    submitContactRequest,
    idleFormState
  );

  if (state.status === "success") {
    return (
      <SuccessPanel
        title={t("contact.success.title")}
        text={t("contact.success.text")}
      />
    );
  }

  return (
    <form action={action} className="relative space-y-5">
      <HoneypotField />
      <input type="hidden" name="locale" value={locale} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("labels.name")} htmlFor="contact-name" required>
          <Input id="contact-name" name="name" required minLength={2} autoComplete="name" />
        </Field>
        <Field label={t("labels.email")} htmlFor="contact-email" required>
          <Input id="contact-email" name="email" type="email" required autoComplete="email" />
        </Field>
        <Field label={t("labels.phone")} htmlFor="contact-phone">
          <Input id="contact-phone" name="phone" type="tel" autoComplete="tel" />
        </Field>
        <Field label={t("labels.company")} htmlFor="contact-company">
          <Input id="contact-company" name="company" autoComplete="organization" />
        </Field>
      </div>

      <Field label={t("contact.department")} htmlFor="contact-department" required>
        <Select id="contact-department" name="department" required defaultValue="general">
          {departments.map((department) => (
            <option key={department} value={department}>
              {t(`contact.departments.${department}`)}
            </option>
          ))}
        </Select>
      </Field>

      <Field label={t("labels.message")} htmlFor="contact-message" required>
        <Textarea id="contact-message" name="message" required minLength={5} />
      </Field>

      <ConsentCheckbox label={t("labels.gdpr")} />
      <FormStatusMessage
        status={state.status}
        errorText={state.code ? t(`errors.${state.code}`) : undefined}
      />

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? t("labels.sending") : t("labels.submit")}
      </Button>
    </form>
  );
}
