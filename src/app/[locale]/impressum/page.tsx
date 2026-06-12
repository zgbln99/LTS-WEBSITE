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
    title: "Impressum",
    robots: { index: false },
    alternates: buildAlternates(locale, "/impressum")
  };
}

// Das Impressum wird gemäß § 5 TMG in allen Sprachversionen auf Deutsch geführt.
export default async function ImprintPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <PageHero eyebrow="Rechtliches" title="Impressum" />
      <section className="bg-mist-50 py-16 sm:py-24">
        <Container className="max-w-3xl space-y-8 text-base leading-relaxed text-night-800">
          <div>
            <h2 className="font-display text-xl font-bold text-night-900">
              Angaben gemäß § 5 TMG
            </h2>
            <p className="mt-3">
              {company.legalName}
              <br />
              {company.address.street}
              <br />
              {company.address.zip} {company.address.city}
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-night-900">
              Kontakt
            </h2>
            <p className="mt-3">
              Telefon: {company.phone}
              <br />
              E-Mail: {company.email}
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-night-900">
              Vertretungsberechtigte Geschäftsführung
            </h2>
            <p className="mt-3">
              Die Angaben zur Geschäftsführung, zum Handelsregister und zur
              Umsatzsteuer-Identifikationsnummer werden vor Veröffentlichung
              durch die Geschäftsleitung ergänzt und geprüft.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-night-900">
              Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
            </h2>
            <p className="mt-3">
              {company.legalName}, {company.address.street},{" "}
              {company.address.zip} {company.address.city}
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-night-900">
              Streitschlichtung
            </h2>
            <p className="mt-3">
              Die Europäische Kommission stellt eine Plattform zur
              Online-Streitbeilegung (OS) bereit:{" "}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                className="text-accent-600 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://ec.europa.eu/consumers/odr/
              </a>
              . Wir sind nicht bereit oder verpflichtet, an
              Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
