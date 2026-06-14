"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import {
  onConsentChange,
  readConsent,
  type ConsentState
} from "@/components/consent/cookie-consent";
import type { AnalyticsSettings } from "@/server/site-settings";

// Lädt Analyse- und Marketing-Skripte ausschließlich nach Einwilligung (DSGVO).
// Die Konfiguration kommt aus dem Admin-Panel (mit Fallback auf .env).
export function Analytics({ config }: { config: AnalyticsSettings }) {
  const [consent, setConsent] = useState<ConsentState | null>(null);

  useEffect(() => {
    setConsent(readConsent());
    return onConsentChange(setConsent);
  }, []);

  return (
    <>
      {consent?.analytics && config.gaId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${config.gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${config.gaId}', { anonymize_ip: true });`}
          </Script>
        </>
      ) : null}

      {consent?.analytics && config.matomoUrl && config.matomoSiteId ? (
        <Script id="matomo" strategy="afterInteractive">
          {`var _paq = window._paq = window._paq || [];
_paq.push(['trackPageView']);
_paq.push(['enableLinkTracking']);
(function() {
  var u='${config.matomoUrl.replace(/\/$/, "")}/';
  _paq.push(['setTrackerUrl', u+'matomo.php']);
  _paq.push(['setSiteId', '${config.matomoSiteId}']);
  var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
  g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
})();`}
        </Script>
      ) : null}

      {consent?.marketing && config.pixelId ? (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${config.pixelId}');
fbq('track', 'PageView');`}
        </Script>
      ) : null}
    </>
  );
}
