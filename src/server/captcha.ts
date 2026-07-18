// Optionale CAPTCHA-Prüfung. Unterstützt Cloudflare Turnstile (bevorzugt,
// echte Bot-Erkennung) und als Alternative das selbst gehostete Cap (PoW).
// Aktiv, sobald für einen der Anbieter die Secrets gesetzt sind. Ohne
// Konfiguration greift weiterhin der bisherige Bot-Schutz (Honeypot/Zeitfalle).

type Provider = "turnstile" | "cap" | null;

function provider(): Provider {
  if (
    process.env.TURNSTILE_SECRET &&
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  ) {
    return "turnstile";
  }
  if (process.env.CAP_VERIFY_URL && process.env.CAP_SECRET) return "cap";
  return null;
}

export function isCaptchaConfigured(): boolean {
  return provider() !== null;
}

// Prüft das vom Widget erzeugte Token. true = bestanden, false = abgelehnt.
export async function verifyCaptcha(formData: FormData): Promise<boolean> {
  const active = provider();
  if (!active) return true; // nicht erzwungen
  return active === "turnstile"
    ? verifyTurnstile(formData.get("cf-turnstile-response"))
    : verifyCap(formData.get("cap-token"));
}

async function verifyTurnstile(
  token: FormDataEntryValue | null
): Promise<boolean> {
  if (!token || typeof token !== "string" || !token.trim()) return false;
  try {
    const body = new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET as string,
      response: token
    });
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body }
    );
    if (!response.ok) {
      console.error("Turnstile-Verify HTTP-Fehler:", response.status);
      return false;
    }
    const data = (await response.json()) as {
      success?: boolean;
      "error-codes"?: string[];
    };
    if (!data?.success) {
      console.warn(
        "Turnstile abgelehnt:",
        JSON.stringify(data?.["error-codes"] ?? data)
      );
    }
    return Boolean(data?.success);
  } catch (error) {
    console.error("Turnstile-Verify fehlgeschlagen:", error);
    return false;
  }
}

async function verifyCap(token: FormDataEntryValue | null): Promise<boolean> {
  if (!token || typeof token !== "string" || !token.trim()) return false;
  try {
    const response = await fetch(process.env.CAP_VERIFY_URL as string, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: process.env.CAP_SECRET, response: token })
    });
    if (!response.ok) {
      console.error(
        "Cap-Verify HTTP-Fehler:",
        response.status,
        await response.text().catch(() => "")
      );
      return false;
    }
    const data = (await response.json()) as { success?: boolean };
    if (!data?.success) {
      console.warn("Cap-Verify abgelehnt, Antwort:", JSON.stringify(data));
    }
    return Boolean(data?.success);
  } catch (error) {
    console.error("Cap-Verify fehlgeschlagen:", error);
    return false;
  }
}
