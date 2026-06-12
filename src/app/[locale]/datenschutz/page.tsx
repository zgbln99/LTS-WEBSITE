import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/sections/page-hero";
import { buildAlternates } from "@/lib/seo";
import { company } from "@/data/company";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Datenschutzerklärung",
    robots: { index: false },
    alternates: buildAlternates(locale, "/datenschutz")
  };
}

// Die Datenschutzerklärung wird in allen Sprachversionen auf Deutsch geführt.
// Vor dem Livegang ist eine rechtliche Prüfung durch einen Datenschutzbeauftragten erforderlich.
export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <PageHero eyebrow="Rechtliches" title="Datenschutzerklärung" />
      <section className="bg-mist-50 py-16 sm:py-24">
        <Container className="max-w-3xl space-y-8 text-base leading-relaxed text-night-800">
          <div>
            <h2 className="font-display text-xl font-bold text-night-900">
              1. Verantwortlicher
            </h2>
            <p className="mt-3">
              Verantwortlich für die Verarbeitung personenbezogener Daten auf
              dieser Website ist die {company.legalName},{" "}
              {company.address.street}, {company.address.zip}{" "}
              {company.address.city}, E-Mail: {company.email}, Telefon:{" "}
              {company.phone}.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-night-900">
              2. Erhebung und Speicherung personenbezogener Daten
            </h2>
            <p className="mt-3">
              Beim Aufruf dieser Website werden durch den Hostinganbieter
              automatisch Informationen in sogenannten Server-Logfiles
              gespeichert (IP-Adresse, Datum und Uhrzeit des Zugriffs,
              aufgerufene Seite, verwendeter Browser). Diese Daten dienen der
              Sicherstellung eines störungsfreien Betriebs und werden nach
              kurzer Zeit gelöscht. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f
              DSGVO.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-night-900">
              3. Kontaktaufnahme
            </h2>
            <p className="mt-3">
              Wenn Sie uns per E-Mail oder Telefon kontaktieren, verarbeiten
              wir die von Ihnen übermittelten Daten zur Bearbeitung Ihrer
              Anfrage. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO,
              soweit die Anfrage der Anbahnung oder Durchführung eines
              Vertrags dient, im Übrigen Art. 6 Abs. 1 lit. f DSGVO.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-night-900">
              4. Bewerbungen
            </h2>
            <p className="mt-3">
              Bewerbungsunterlagen verarbeiten wir ausschließlich zum Zweck
              des Bewerbungsverfahrens auf Grundlage von Art. 6 Abs. 1 lit. b
              DSGVO und § 26 BDSG. Unterlagen nicht berücksichtigter
              Bewerbungen werden spätestens sechs Monate nach Abschluss des
              Verfahrens gelöscht, sofern keine Einwilligung zur längeren
              Speicherung vorliegt.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-night-900">
              5. Ihre Rechte
            </h2>
            <p className="mt-3">
              Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung
              (Art. 16 DSGVO), Löschung (Art. 17 DSGVO), Einschränkung der
              Verarbeitung (Art. 18 DSGVO), Datenübertragbarkeit (Art. 20
              DSGVO) sowie Widerspruch gegen die Verarbeitung (Art. 21
              DSGVO). Außerdem besteht ein Beschwerderecht bei der
              zuständigen Datenschutzaufsichtsbehörde, in Berlin der
              Berliner Beauftragten für Datenschutz und Informationsfreiheit.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-night-900">
              6. Cookies und Analysedienste
            </h2>
            <p className="mt-3">
              Diese Website setzt derzeit keine Analyse- oder Marketingcookies
              ein. Sollten künftig einwilligungspflichtige Dienste eingebunden
              werden, erfolgt dies ausschließlich nach Ihrer ausdrücklichen
              Einwilligung über ein Consent-Banner (Art. 6 Abs. 1 lit. a
              DSGVO, § 25 TDDDG).
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
