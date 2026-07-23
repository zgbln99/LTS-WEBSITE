"use client";

import { createElement, useEffect, useRef } from "react";

// Vereinheitlichtes CAPTCHA-Widget: Cloudflare Turnstile (bevorzugt) oder Cap.
// Turnstile wird EXPLIZIT gerendert (turnstile.render), damit das Widget auch
// nach Client-Navigation und in animierten/sticky Containern zuverlässig
// erscheint. Das Token landet als verstecktes Feld "cf-turnstile-response"
// (bzw. "cap-token") im umgebenden <form>.

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const CAP_ENDPOINT = process.env.NEXT_PUBLIC_CAP_API_ENDPOINT;
const CAP_SCRIPT =
  process.env.NEXT_PUBLIC_CAP_WIDGET_SRC ||
  "https://cdn.jsdelivr.net/npm/@cap.js/widget";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: { sitekey: string }) => string;
    };
  }
}

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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (TURNSTILE_SITE_KEY) {
      loadScriptOnce(
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit",
        "data-turnstile"
      );
      let cancelled = false;
      let timer: ReturnType<typeof setTimeout>;
      const tryRender = () => {
        if (cancelled) return;
        const el = ref.current;
        if (window.turnstile && el && !el.dataset.rendered) {
          window.turnstile.render(el, { sitekey: TURNSTILE_SITE_KEY });
          el.dataset.rendered = "true";
          return;
        }
        timer = setTimeout(tryRender, 200);
      };
      tryRender();
      return () => {
        cancelled = true;
        clearTimeout(timer);
      };
    }
    if (CAP_ENDPOINT) {
      loadScriptOnce(CAP_SCRIPT, "data-cap-widget");
    }
  }, []);

  if (TURNSTILE_SITE_KEY) {
    return (
      <div className="pt-1">
        <div ref={ref} />
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
