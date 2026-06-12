import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Check } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { PageHero } from "@/components/sections/page-hero";
import { CtaBanner } from "@/components/sections/cta-banner";
import {
  getAllServiceParams,
  getServiceBySlug
} from "@/data/services";
import { localizedUrl, pageMetadata } from "@/lib/seo";
import {
  JsonLdScript,
  breadcrumbSchema,
  faqSchema,
  serviceSchema
} from "@/lib/schema";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export function generateStaticParams() {
  return getAllServiceParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const service = getServiceBySlug(locale, slug);
  if (!service) return {};
  return pageMetadata(
    locale,
    { pathname: "/leistungen/[slug]", params: { slug } },
    service.seoTitle,
    service.seoDescription
  );
}

export default async function ServiceDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const service = getServiceBySlug(locale, slug);
  if (!service) notFound();

  const t = await getTranslations("servicesPage");
  const url = localizedUrl(locale, {
    pathname: "/leistungen/[slug]",
    params: { slug }
  });

  const jsonLd = [
    serviceSchema({ name: service.name, description: service.excerpt, url }),
    faqSchema(service.faqs),
    breadcrumbSchema([
      { name: "LTS Logistik", url: localizedUrl(locale, "/") },
      { name: t("hero.title"), url: localizedUrl(locale, "/leistungen") },
      { name: service.name, url }
    ])
  ];

  return (
    <>
      {jsonLd.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JsonLdScript(schema) }}
        />
      ))}

      <PageHero
        eyebrow={t("hero.eyebrow")}
        title={service.name}
        description={service.excerpt}
        image={service.image}
      />

      {/* Beschreibung + Bild */}
      <section className="bg-mist-50 py-16 sm:py-24">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <div className="space-y-5">
                {service.description.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 32)}
                    className="text-base leading-relaxed text-night-800 sm:text-lg"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-card">
                <Image
                  src={service.image}
                  alt={service.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Vorteile */}
      <section className="bg-white py-16 sm:py-24">
        <Container>
          <SectionHeading title={t("benefitsTitle")} />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {service.benefits.map((benefit, index) => (
              <Reveal key={benefit.title} delay={index * 0.06}>
                <div className="h-full rounded-3xl bg-mist-50 p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500/10 text-accent-600">
                    <Check className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-base font-bold text-night-900">
                    {benefit.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist-500">
                    {benefit.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Prozess */}
      <section className="bg-night-950 py-16 sm:py-24">
        <Container>
          <SectionHeading dark title={t("processTitle")} />
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {service.steps.map((step, index) => (
              <Reveal key={step.title} delay={index * 0.06}>
                <li className="h-full rounded-3xl bg-night-900 p-6">
                  <span className="font-display text-3xl font-extrabold text-accent-500">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 font-display text-base font-bold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist-400">
                    {step.text}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      {/* FAQ */}
      <section className="bg-mist-50 py-16 sm:py-24">
        <Container className="max-w-3xl">
          <SectionHeading align="center" title={t("faqTitle")} />
          <Accordion type="single" collapsible className="mt-10 space-y-3">
            {service.faqs.map((faq, index) => (
              <AccordionItem key={faq.question} value={`faq-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Container>
      </section>

      <CtaBanner
        primaryHref="/kontakt"
        title={t("cta.title")}
        description={t("cta.description")}
        primaryLabel={t("cta.primary")}
        secondaryLabel={t("cta.secondary")}
      />
    </>
  );
}
