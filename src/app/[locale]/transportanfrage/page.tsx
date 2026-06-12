import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Check, Clock, Mail, Phone } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/sections/page-hero";
import { TransportInquiryForm } from "@/components/forms/transport-inquiry-form";
import { pageMetadata } from "@/lib/seo";
import { company } from "@/data/company";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.inquiry" });
  return pageMetadata(locale, "/transportanfrage", t("title"), t("description"));
}

export default async function InquiryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("inquiry");
  const checklist = t.raw("checklist") as string[];

  return (
    <>
      <PageHero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        description={t("hero.description")}
      />

      <section className="bg-mist-50 py-16 sm:py-24">
        <Container>
          <div className="grid items-start gap-6 lg:grid-cols-5">
            <Reveal className="lg:col-span-3">
              <div className="rounded-3xl bg-white p-6 shadow-card sm:p-10">
                <TransportInquiryForm />
              </div>
            </Reveal>

            <div className="space-y-6 lg:col-span-2">
              <Reveal delay={0.1}>
                <div className="rounded-3xl bg-white p-6 shadow-card sm:p-8">
                  <h2 className="font-display text-lg font-bold text-night-900">
                    {t("checklistTitle")}
                  </h2>
                  <ul className="mt-5 space-y-3">
                    {checklist.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-sm text-night-800"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 flex items-start gap-2.5 rounded-2xl bg-mist-50 p-4 text-xs leading-relaxed text-mist-500">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" />
                    {t("responseNote")}
                  </p>
                </div>
              </Reveal>

              <Reveal delay={0.15}>
                <div className="rounded-3xl bg-night-950 p-6 sm:p-8">
                  <h2 className="font-display text-lg font-bold text-white">
                    {t("channelsTitle")}
                  </h2>
                  <div className="mt-5 space-y-3">
                    <a
                      href={company.phoneHref}
                      className="flex items-center gap-3 rounded-2xl bg-night-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-night-800"
                    >
                      <Phone className="h-4 w-4 text-accent-400" />
                      {company.phone}
                    </a>
                    <a
                      href={`mailto:${company.email}?subject=${encodeURIComponent(t("emailSubject"))}`}
                      className="flex items-center gap-3 rounded-2xl bg-night-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-night-800"
                    >
                      <Mail className="h-4 w-4 text-accent-400" />
                      {company.email}
                    </a>
                  </div>
                  <p className="mt-4 text-xs text-mist-400">
                    {company.openingHours}
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
