"use client";

import { createElement, useEffect } from "react";

// Cap-CAPTCHA-Widget (capjs). Wird nur angezeigt, wenn der Endpoint per
// NEXT_PUBLIC_CAP_API_ENDPOINT gesetzt ist. Liegt das Widget im <form>, fügt
// Cap automatisch ein verstecktes Feld "cap-token" hinzu.

const ENDPOINT = process.env.NEXT_PUBLIC_CAP_API_ENDPOINT;
const SCRIPT_SRC =
  process.env.NEXT_PUBLIC_CAP_WIDGET_SRC ||
  "https://cdn.jsdelivr.net/npm/@cap.js/widget";

export function CapWidget() {
  useEffect(() => {
    if (!ENDPOINT) return;
    if (document.querySelector("script[data-cap-widget]")) return;
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.setAttribute("data-cap-widget", "");
    document.head.appendChild(script);
  }, []);

  if (!ENDPOINT) return null;

  // createElement statt JSX, weil <cap-widget> ein zur Laufzeit registriertes
  // Custom-Element ist (keine bekannte JSX-Intrinsic).
  return (
    <div className="pt-1">
      {createElement("cap-widget", { "data-cap-api-endpoint": ENDPOINT })}
    </div>
  );
}
