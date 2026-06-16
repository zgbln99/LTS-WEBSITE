// Einheitliche Gehaltsformatierung für Stellenanzeigen.
// - beide Werte (verschieden): "3.000-3.300 EUR"
// - nur Minimum: "ab 3.000 EUR"
// - nur Maximum: "bis 3.300 EUR"
// - ein Wert / gleich: "3.000 EUR"
export function formatSalaryRange(
  min: number | null | undefined,
  max: number | null | undefined,
  labels: { from: string; to: string } = { from: "ab", to: "bis" }
): string {
  const value = (n: number) => `${n.toLocaleString("de-DE")} EUR`;
  if (min && max && min !== max) {
    return `${min.toLocaleString("de-DE")}-${max.toLocaleString("de-DE")} EUR`;
  }
  if (min && max) return value(min);
  if (min) return `${labels.from} ${value(min)}`;
  if (max) return `${labels.to} ${value(max)}`;
  return "";
}
