"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
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

export function CookieConsent() {
  const t = useTranslations("consent");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(readConsent() === null);
  }, []);

  if (!visible) return null;

  function decide(analytics: boolean, marketing: boolean) {
    writeConsent({ analytics, marketing });
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
          </Link>
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button onClick={() => decide(true, true)}>{t("acceptAll")}</Button>
          <Button
            variant="outline-light"
            onClick={() => decide(false, false)}
          >
            {t("necessaryOnly")}
          </Button>
        </div>
      </div>
    </div>
  );
}
