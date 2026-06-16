// Optionale CAPTCHA-Prüfung über eine selbst gehostete Cap-Instanz (capjs).
// Aktiv, sobald CAP_VERIFY_URL und CAP_SECRET gesetzt sind. Ohne Konfiguration
// greift weiterhin der bisherige Bot-Schutz (Honeypot + Zeitfalle).

export function isCaptchaConfigured(): boolean {
  return Boolean(process.env.CAP_VERIFY_URL && process.env.CAP_SECRET);
}

// Prüft das vom Cap-Widget erzeugte Token gegen die Cap-Instanz.
// Liefert true = bestanden, false = abgelehnt.
export async function verifyCaptcha(
  token: string | null | undefined
): Promise<boolean> {
  if (!isCaptchaConfigured()) return true; // nicht erzwungen
  if (!token || !token.trim()) return false;

  try {
    const response = await fetch(process.env.CAP_VERIFY_URL as string, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: process.env.CAP_SECRET,
        response: token
      })
    });
    if (!response.ok) {
      console.error("Cap-Verify HTTP-Fehler:", response.status);
      return false;
    }
    const data = (await response.json()) as { success?: boolean };
    return Boolean(data?.success);
  } catch (error) {
    console.error("Cap-Verify fehlgeschlagen:", error);
    return false;
  }
}
