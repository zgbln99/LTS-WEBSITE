import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Check, Clock, Mail, Phone } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/sections/page-hero";
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
  const mailto = `mailto:${company.email}?subject=${encodeURIComponent(t("emailSubject"))}`;

  return (
    <>
      <PageHero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        description={t("hero.description")}
      />

      <section className="bg-mist-50 py-16 sm:py-24">
        <Container>
          <div className="grid gap-6 lg:grid-cols-5">
            <Reveal className="lg:col-span-3">
              <div className="h-full rounded-3xl bg-white p-6 shadow-card sm:p-10">
                <h2 className="font-display text-2xl font-bold text-night-900">
                  {t("checklistTitle")}
                </h2>
                <ul className="mt-6 space-y-3.5">
                  {checklist.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-base text-night-800"
                    >
                      <Check className="mt-1 h-4 w-4 shrink-0 text-accent-500" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-8 flex items-start gap-2.5 rounded-2xl bg-mist-50 p-4 text-sm leading-relaxed text-mist-500">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" />
                  {t("responseNote")}
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.1} className="lg:col-span-2">
              <div className="flex h-full flex-col justify-center rounded-3xl bg-night-950 p-6 sm:p-10">
                <h2 className="font-display text-2xl font-bold text-white">
                  {t("channelsTitle")}
                </h2>
                <div className="mt-8 flex flex-col gap-3">
                  <Button asChild size="lg">
                    <a href={mailto}>
                      <Mail className="h-4 w-4" />
                      {t("emailCta")}
                    </a>
                  </Button>
                  <Button asChild size="lg" variant="outline-light">
                    <a href={company.phoneHref}>
                      <Phone className="h-4 w-4" />
                      {t("phoneCta")}
                    </a>
                  </Button>
                </div>
                <p className="mt-8 text-center font-display text-lg font-bold text-white">
                  {company.phone}
                </p>
                <p className="mt-1 text-center text-sm text-mist-400">
                  {company.openingHours}
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  );
}
