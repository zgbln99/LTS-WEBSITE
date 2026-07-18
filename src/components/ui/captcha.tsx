"use client";

import { createElement, useEffect } from "react";

// Vereinheitlichtes CAPTCHA-Widget: Cloudflare Turnstile (bevorzugt) oder Cap.
// Wird nur angezeigt, wenn der jeweilige öffentliche Schlüssel gesetzt ist.
// Beide legen ihr Token als verstecktes Feld im umgebenden <form> ab
// (Turnstile: "cf-turnstile-response", Cap: "cap-token").

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const CAP_ENDPOINT = process.env.NEXT_PUBLIC_CAP_API_ENDPOINT;
const CAP_SCRIPT =
  process.env.NEXT_PUBLIC_CAP_WIDGET_SRC ||
  "https://cdn.jsdelivr.net/npm/@cap.js/widget";

function loadScriptOnce(src: string, marker: string) {
  if (typeof document === "undefined") return;
  if (document.querySelector(`script[${marker}]`)) return;
  const script = document.createElement("script");
  script.src = src;
  script.async = true;
  script.defer = true;
  script.setAttribute(marker, "");
  document.head.appendChild(script);
}

export function CaptchaWidget() {
  useEffect(() => {
    if (TURNSTILE_SITE_KEY) {
      loadScriptOnce(
        "https://challenges.cloudflare.com/turnstile/v0/api.js",
        "data-turnstile"
      );
    } else if (CAP_ENDPOINT) {
      loadScriptOnce(CAP_SCRIPT, "data-cap-widget");
    }
  }, []);

  if (TURNSTILE_SITE_KEY) {
    return (
      <div className="pt-1">
        <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} />
      </div>
    );
  }

  if (CAP_ENDPOINT) {
    return (
      <div className="pt-1">
        {createElement("cap-widget", { "data-cap-api-endpoint": CAP_ENDPOINT })}
      </div>
    );
  }

  return null;
}
