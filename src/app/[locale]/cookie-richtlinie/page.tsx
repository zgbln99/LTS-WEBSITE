import type { Metadata } from "next";
import { getPublishedPageData } from "@/server/builder";
import { BuilderPage } from "@/builder/builder-page";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/sections/page-hero";
import { buildAlternates } from "@/lib/seo";
import { company } from "@/data/company";

export const revalidate = 300;

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Cookie-Richtlinie (EU)",
    robots: { index: false },
    alternates: buildAlternates(locale, "/cookie-richtlinie")
  };
}

// Die Cookie-Richtlinie wird in allen Sprachversionen auf Deutsch geführt.
// Vor dem Livegang ist eine rechtliche Prüfung erforderlich.
export default async function CookiePolicyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const builderData = await getPublishedPageData("cookie-richtlinie", locale);
  if (builderData) {
    return <BuilderPage data={builderData} locale={locale} />;
  }

  return (
    <>
      <PageHero
        eyebrow="Rechtliches"
        title="Cookie-Richtlinie (EU)"
        description="Informationen über den Einsatz von Cookies und ähnlichen Technologien auf dieser Website."
      />
      <section className="bg-mist-50 py-16 sm:py-24">
        <Container className="max-w-3xl space-y-8 text-base leading-relaxed text-night-800">
          <div>
            <h2 className="font-display text-xl font-bold text-night-900">
              1. Was sind Cookies?
            </h2>
            <p className="mt-3">
              Cookies sind kleine Textdateien, die beim Besuch einer Website auf
              Ihrem Endgerät gespeichert werden. Sie ermöglichen es, Ihr Gerät
              bei einem erneuten Besuch wiederzuerkennen, und dienen unter
              anderem der Funktionsfähigkeit, Sicherheit und Reichweitenmessung
              der Website. Vergleichbare Technologien wie Local Storage oder
              Zählpixel werden im Folgenden einheitlich als „Cookies" bezeichnet.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-night-900">
              2. Rechtsgrundlage
            </h2>
            <p className="mt-3">
              Das Speichern von und der Zugriff auf nicht zwingend erforderliche
              Cookies erfolgt ausschließlich auf Grundlage Ihrer Einwilligung
              gemäß Art. 6 Abs. 1 lit. a DSGVO in Verbindung mit § 25 Abs. 1
              TDDDG. Technisch notwendige Cookies werden gemäß § 25 Abs. 2 TDDDG
              sowie auf Grundlage unseres berechtigten Interesses (Art. 6 Abs. 1
              lit. f DSGVO) eingesetzt und sind einwilligungsfrei.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-night-900">
              3. Kategorien von Cookies
            </h2>
            <p className="mt-3">
              <strong>Notwendige Cookies</strong> sind für den Betrieb der
              Website unerlässlich, etwa zur Speicherung Ihrer Cookie-Auswahl
              oder zur Absicherung von Formularen. Sie können nicht deaktiviert
              werden.
            </p>
            <p className="mt-3">
              <strong>Statistik-/Analyse-Cookies</strong> helfen uns, die
              Nutzung der Website anonymisiert auszuwerten und sie zu verbessern.
              Sie werden nur mit Ihrer Einwilligung gesetzt.
            </p>
            <p className="mt-3">
              <strong>Marketing-Cookies</strong> dienen dazu, Inhalte und
              Kampagnen auf Ihre Interessen abzustimmen und deren Erfolg zu
              messen. Sie werden nur mit Ihrer Einwilligung gesetzt.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-night-900">
              4. Eingesetzte Cookies und Dienste
            </h2>
            <p className="mt-3">
              Sofern Analyse- oder Marketingdienste aktiv sind, werden diese
              erst nach Ihrer ausdrücklichen Einwilligung über das
              Consent-Banner geladen. Welche Dienste konkret eingebunden sind,
              hängt von Ihrer Auswahl ab; eine technisch notwendige Cookie
              speichert ausschließlich Ihre Consent-Entscheidung für bis zu 180
              Tage.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-night-900">
              5. Speicherdauer
            </h2>
            <p className="mt-3">
              Die Speicherdauer einzelner Cookies variiert. Session-Cookies
              werden nach dem Schließen des Browsers gelöscht; persistente
              Cookies bleiben bis zu ihrem festgelegten Ablaufdatum oder bis zu
              ihrer manuellen Löschung gespeichert.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-night-900">
              6. Einwilligung widerrufen und Cookies verwalten
            </h2>
            <p className="mt-3">
              Sie können Ihre Einwilligung jederzeit mit Wirkung für die Zukunft
              widerrufen oder anpassen, indem Sie die in Ihrem Browser
              gespeicherten Cookies löschen. Darüber hinaus können Sie in den
              Einstellungen Ihres Browsers das Setzen von Cookies generell
              einschränken oder unterbinden; dadurch kann die Funktionsfähigkeit
              der Website eingeschränkt werden.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-night-900">
              7. Weitere Informationen
            </h2>
            <p className="mt-3">
              Einzelheiten zur Verarbeitung personenbezogener Daten, zu
              Empfängern und zu Ihren Betroffenenrechten entnehmen Sie unserer
              Datenschutzerklärung. Verantwortlich im Sinne der DSGVO ist die{" "}
              {company.legalName}, {company.address.street},{" "}
              {company.address.zip} {company.address.city},{" "}
              {company.address.district}, E-Mail: {company.email}, Telefon:{" "}
              {company.phone}.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
