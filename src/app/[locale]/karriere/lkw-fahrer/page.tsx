import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, Check, Euro, Mail, Phone } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { pageMetadata } from "@/lib/seo";
import { company } from "@/data/company";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.driver" });
  return pageMetadata(
    locale,
    "/karriere/lkw-fahrer",
    t("title"),
    t("description")
  );
}

export default async function DriverLandingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("driver");

  const facts = t.raw("facts") as { title: string; text: string }[];
  const requirements = t.raw("requirements") as string[];
  const applySteps = t.raw("applySteps") as string[];
  const mailto = `mailto:${company.email}?subject=${encodeURIComponent("Bewerbung LKW-Fahrer")}`;

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[85svh] items-end overflow-hidden bg-night-950 pb-16 pt-32">
        <Image
          src="https://images.unsplash.com/photo-1616432043562-3671ea2e5242?q=80&w=2400&auto=format&fit=crop"
          alt={t("hero.title")}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/70 to-night-950/30" />
        <Container className="relative">
          <span className="inline-flex items-center rounded-full bg-accent-500 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
            {t("hero.eyebrow")}
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.05] text-white sm:text-6xl">
            {t("hero.title")}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-mist-200 sm:text-lg">
            {t("hero.description")}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href={mailto}>
                {t("hero.cta")}
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline-light">
              <a href={company.phoneHref}>
                <Phone className="h-4 w-4" />
                {company.phone}
              </a>
            </Button>
          </div>
        </Container>
      </section>

      {/* Gehalt */}
      <section className="bg-night-950 pb-16 sm:pb-24">
        <Container>
          <Reveal>
            <div className="flex flex-col gap-6 rounded-3xl bg-gradient-to-br from-accent-500 to-accent-600 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
              <div className="flex items-center gap-5">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20">
                  <Euro className="h-7 w-7 text-white" />
                </span>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-white/80">
                    {t("salary.title")}
                  </p>
                  <p className="font-display text-3xl font-extrabold text-white sm:text-4xl">
                    {t("salary.value")}
                  </p>
                </div>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-white/90">
                {t("salary.note")}
              </p>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Fakten */}
      <section className="bg-mist-50 py-16 sm:py-24">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {facts.map((fact, index) => (
              <Reveal key={fact.title} delay={(index % 4) * 0.07}>
                <div className="h-full rounded-3xl bg-white p-6 shadow-card">
                  <h3 className="font-display text-lg font-bold text-night-900">
                    {fact.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist-500">
                    {fact.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Anforderungen + Ablauf */}
      <section className="bg-white py-16 sm:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading title={t("requirementsTitle")} />
              <ul className="mt-8 space-y-3.5">
                {requirements.map((requirement) => (
                  <Reveal key={requirement}>
                    <li className="flex items-start gap-3 text-base text-night-800">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-accent-500" />
                      {requirement}
                    </li>
                  </Reveal>
                ))}
              </ul>
            </div>
            <div>
              <SectionHeading title={t("applyTitle")} />
              <ol className="mt-8 space-y-5">
                {applySteps.map((step, index) => (
                  <Reveal key={step} delay={index * 0.06}>
                    <li className="flex items-start gap-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-night-950 font-display text-sm font-bold text-white">
                        {index + 1}
                      </span>
                      <p className="pt-1 text-base leading-relaxed text-night-800">
                        {step}
                      </p>
                    </li>
                  </Reveal>
                ))}
              </ol>
            </div>
          </div>

          <Reveal>
            <div className="mt-14 flex flex-col gap-3 rounded-[2rem] bg-night-950 p-8 sm:flex-row sm:items-center sm:justify-center sm:p-10">
              <Button asChild size="lg">
                <a href={mailto}>
                  <Mail className="h-4 w-4" />
                  {t("ctaEmail")}
                </a>
              </Button>
              <Button asChild size="lg" variant="outline-light">
                <a href={company.phoneHref}>
                  <Phone className="h-4 w-4" />
                  {t("ctaPhone")}
                </a>
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
