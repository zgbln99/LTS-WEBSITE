"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export interface ConsentState {
  analytics: boolean;
  marketing: boolean;
}

const CONSENT_COOKIE = "lts-consent";
const CONSENT_EVENT = "lts-consent-changed";

export function readConsent(): ConsentState | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${CONSENT_COOKIE}=`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match.split("=")[1]));
  } catch {
    return null;
  }
}

function writeConsent(state: ConsentState) {
  const value = encodeURIComponent(JSON.stringify(state));
  document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=${60 * 60 * 24 * 180}; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: state }));
}

export function onConsentChange(handler: (state: ConsentState) => void) {
  const listener = (event: Event) =>
    handler((event as CustomEvent<ConsentState>).detail);
  window.addEventListener(CONSENT_EVENT, listener);
  return () => window.removeEventListener(CONSENT_EVENT, listener);
}

function ConsentToggle({
  label,
  description,
  checked,
  disabled,
  onChange
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-2xl bg-white/5 p-4">
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-white">{label}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-mist-400">
          {description}
        </span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked)}
        className="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded border-mist-500 accent-[#e11d24] disabled:opacity-60"
      />
    </label>
  );
}

export function CookieConsent() {
  const t = useTranslations("consent");
  const locale = useLocale();
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    setVisible(readConsent() === null);
  }, []);

  if (!visible) return null;

  function decide(analyticsValue: boolean, marketingValue: boolean) {
    writeConsent({ analytics: analyticsValue, marketing: marketingValue });
    // DSGVO-Nachweis protokollieren (Fehler ignorieren, blockiert nicht).
    void fetch("/api/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        analytics: analyticsValue,
        marketing: marketingValue,
        locale
      }),
      keepalive: true
    }).catch(() => {});
    setVisible(false);
  }

  return (
    <div
      role="dialog"
      aria-label={t("title")}
      className="fixed inset-x-0 bottom-0 z-[60] p-4 sm:p-6"
    >
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-night-950/95 p-6 shadow-card-hover backdrop-blur-md sm:p-8">
        <h2 className="font-display text-lg font-bold text-white">
          {t("title")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-mist-300">
          {t("text")}{" "}
          <Link href="/datenschutz" className="underline hover:text-white">
            {t("privacy")}
          </Link>{" "}
          <Link
            href="/cookie-richtlinie"
            className="underline hover:text-white"
          >
            {t("cookies")}
          </Link>
        </p>

        {showSettings ? (
          <div className="mt-5 space-y-2.5">
            <ConsentToggle
              label={t("necessaryLabel")}
              description={t("necessaryDesc")}
              checked
              disabled
            />
            <ConsentToggle
              label={t("analyticsLabel")}
              description={t("analyticsDesc")}
              checked={analytics}
              onChange={setAnalytics}
            />
            <ConsentToggle
              label={t("marketingLabel")}
              description={t("marketingDesc")}
              checked={marketing}
              onChange={setMarketing}
            />
          </div>
        ) : null}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button onClick={() => decide(true, true)}>{t("acceptAll")}</Button>
          {showSettings ? (
            <Button
              variant="outline-light"
              onClick={() => decide(analytics, marketing)}
            >
              {t("savePreferences")}
            </Button>
          ) : (
            <Button
              variant="outline-light"
              onClick={() => setShowSettings(true)}
            >
              {t("customize")}
            </Button>
          )}
          <Button variant="outline-light" onClick={() => decide(false, false)}>
            {t("necessaryOnly")}
          </Button>
        </div>
      </div>
    </div>
  );
}
