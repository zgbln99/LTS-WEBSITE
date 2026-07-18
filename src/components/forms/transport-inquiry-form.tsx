"use client";

import { useActionState, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ConsentCheckbox,
  Field,
  FormStatusMessage,
  HoneypotField,
  Input,
  SuccessPanel,
  Textarea
} from "@/components/ui/field";
import { TimeTrapField } from "@/components/ui/time-trap";
import { CaptchaWidget } from "@/components/ui/captcha";
import { submitTransportRequest } from "@/server/actions/forms";
import { idleFormState } from "@/lib/forms";
import { cn } from "@/lib/utils";

const STEPS = [0, 1, 2] as const;

export function TransportInquiryForm() {
  const t = useTranslations("forms");
  const locale = useLocale();
  const [step, setStep] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(
    submitTransportRequest,
    idleFormState
  );

  const stepLabels = [
    t("inquiry.steps.route"),
    t("inquiry.steps.cargo"),
    t("inquiry.steps.contact")
  ];

  if (state.status === "success") {
    return (
      <SuccessPanel
        title={t("inquiry.success.title")}
        text={t("inquiry.success.text", { reference: state.reference ?? "" })}
      />
    );
  }

  function goNext() {
    const form = formRef.current;
    if (!form) return;
    const current = form.querySelector<HTMLElement>(`[data-step="${step}"]`);
    const inputs = current?.querySelectorAll<HTMLInputElement>("input, textarea") ?? [];
    for (const input of inputs) {
      if (!input.checkValidity()) {
        input.reportValidity();
        return;
      }
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  return (
    <form ref={formRef} action={action} className="relative">
      <HoneypotField />
      <TimeTrapField />
      <input type="hidden" name="locale" value={locale} />

      {/* Fortschritt */}
      <ol className="mb-8 flex items-center gap-2">
        {stepLabels.map((label, index) => (
          <li key={label} className="flex flex-1 flex-col gap-2">
            <span
              className={cn(
                "h-1.5 rounded-full transition-colors",
                index <= step ? "bg-accent-500" : "bg-mist-200"
              )}
            />
            <span
              className={cn(
                "text-xs font-semibold uppercase tracking-wide",
                index <= step ? "text-accent-600" : "text-mist-400"
              )}
            >
              {index + 1}. {label}
            </span>
          </li>
        ))}
      </ol>

      {/* Schritt 1: Route */}
      <div data-step="0" className={cn("space-y-5", step !== 0 && "hidden")}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("inquiry.pickupAddress")} htmlFor="ti-pickup" required>
            <Input id="ti-pickup" name="pickupAddress" required minLength={3} />
          </Field>
          <Field label={t("inquiry.pickupCountry")} htmlFor="ti-pickup-country" required>
            <Input id="ti-pickup-country" name="pickupCountry" required minLength={2} />
          </Field>
          <Field label={t("inquiry.deliveryAddress")} htmlFor="ti-delivery" required>
            <Input id="ti-delivery" name="deliveryAddress" required minLength={3} />
          </Field>
          <Field label={t("inquiry.deliveryCountry")} htmlFor="ti-delivery-country" required>
            <Input id="ti-delivery-country" name="deliveryCountry" required minLength={2} />
          </Field>
        </div>
        <Field label={t("inquiry.requestedDate")} htmlFor="ti-date">
          <Input id="ti-date" name="requestedDate" type="date" className="sm:max-w-xs" />
        </Field>
      </div>

      {/* Schritt 2: Ladung */}
      <div data-step="1" className={cn("space-y-5", step !== 1 && "hidden")}>
        <Field label={t("inquiry.cargoType")} htmlFor="ti-cargo" required>
          <Input id="ti-cargo" name="cargoType" required={step === 1} minLength={2} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("inquiry.palletCount")} htmlFor="ti-pallets">
            <Input id="ti-pallets" name="palletCount" type="number" min={0} max={1000} />
          </Field>
          <Field label={t("inquiry.weightKg")} htmlFor="ti-weight">
            <Input id="ti-weight" name="weightKg" type="number" min={0} max={40000} />
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label={t("inquiry.lengthM")} htmlFor="ti-length">
            <Input id="ti-length" name="lengthM" type="number" step="0.01" min={0} max={20} />
          </Field>
          <Field label={t("inquiry.widthM")} htmlFor="ti-width">
            <Input id="ti-width" name="widthM" type="number" step="0.01" min={0} max={5} />
          </Field>
          <Field label={t("inquiry.heightM")} htmlFor="ti-height">
            <Input id="ti-height" name="heightM" type="number" step="0.01" min={0} max={5} />
          </Field>
        </div>
        <div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={t("inquiry.temperatureMin")} htmlFor="ti-temp-min">
              <Input id="ti-temp-min" name="temperatureMin" type="number" min={-40} max={40} />
            </Field>
            <Field label={t("inquiry.temperatureMax")} htmlFor="ti-temp-max">
              <Input id="ti-temp-max" name="temperatureMax" type="number" min={-40} max={40} />
            </Field>
          </div>
          <p className="mt-2 text-xs text-mist-400">{t("inquiry.temperatureHint")}</p>
        </div>
      </div>

      {/* Schritt 3: Kontakt */}
      <div data-step="2" className={cn("space-y-5", step !== 2 && "hidden")}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("labels.company")} htmlFor="ti-company" required>
            <Input id="ti-company" name="company" required={step === 2} minLength={2} autoComplete="organization" />
          </Field>
          <Field label={t("labels.name")} htmlFor="ti-name" required>
            <Input id="ti-name" name="contactName" required={step === 2} minLength={2} autoComplete="name" />
          </Field>
          <Field label={t("labels.email")} htmlFor="ti-email" required>
            <Input id="ti-email" name="email" type="email" required={step === 2} autoComplete="email" />
          </Field>
          <Field label={t("labels.phone")} htmlFor="ti-phone" required>
            <Input id="ti-phone" name="phone" type="tel" required={step === 2} minLength={5} autoComplete="tel" />
          </Field>
        </div>
        <Field label={t("labels.message")} htmlFor="ti-message">
          <Textarea id="ti-message" name="message" />
        </Field>
        <ConsentCheckbox label={t("labels.gdpr")} />
        <CaptchaWidget />
      </div>

      <FormStatusMessage
        className="mt-5"
        status={state.status}
        errorText={state.code ? t(`errors.${state.code}`) : undefined}
      />

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep((s) => Math.max(s - 1, 0))}
          className={cn(step === 0 && "invisible")}
        >
          <ArrowLeft className="h-4 w-4" />
          {t("labels.back")}
        </Button>

        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={goNext}>
            {t("labels.next")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button type="submit" size="lg" disabled={pending}>
            {pending ? t("labels.sending") : t("inquiry.submit")}
          </Button>
        )}
      </div>
    </form>
  );
}
