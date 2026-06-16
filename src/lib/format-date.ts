// Robuste Datumsformatierung. Die Optionen `dateStyle`/`timeStyle` benötigen
// ein neueres ICU, das in manchen (Alpine-)Node-Images fehlt und dann
// "RangeError: Incorrect locale information provided" wirft. Daher werden
// explizite Felder verwendet und jede Variante zusätzlich abgesichert.

const MONTHS_DE = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember"
];

function manualLongDate(date: Date): string {
  return `${date.getDate()}. ${MONTHS_DE[date.getMonth()]} ${date.getFullYear()}`;
}

// Langes Datum (z.B. "16. Juni 2026"), das nie einen Renderfehler auslöst.
export function formatLongDate(date: Date, locale = "de"): string {
  const attempts: [string, Intl.DateTimeFormatOptions][] = [
    [locale || "de", { year: "numeric", month: "long", day: "numeric" }],
    ["de", { year: "numeric", month: "long", day: "numeric" }]
  ];
  for (const [loc, options] of attempts) {
    try {
      return new Intl.DateTimeFormat(loc, options).format(date);
    } catch {
      // nächste Variante versuchen
    }
  }
  return manualLongDate(date);
}

// Datum + Uhrzeit auf Deutsch (für E-Mails / interne Anzeigen).
export function formatDateTimeDe(date: Date): string {
  try {
    return new Intl.DateTimeFormat("de-DE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  } catch {
    const pad = (value: number) => String(value).padStart(2, "0");
    return `${manualLongDate(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
}
