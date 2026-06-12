import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { PageHero } from "@/components/sections/page-hero";
import { ContactForm } from "@/components/forms/contact-form";
import { pageMetadata } from "@/lib/seo";
import { JsonLdScript, organizationSchema } from "@/lib/schema";
import { company, fullAddress } from "@/data/company";
import { getServiceCities } from "@/server/content";

export const revalidate = 300;

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.contact" });
  return pageMetadata(locale, "/kontakt", t("title"), t("description"));
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("contact");
  const departments = t.raw("departments") as { name: string; text: string }[];
  const cities = await getServiceCities();

  const cards = [
    {
      icon: Phone,
      title: t("cards.phone"),
      value: company.phone,
      note: t("cards.phoneNote"),
      href: company.phoneHref
    },
    {
      icon: Mail,
      title: t("cards.email"),
      value: company.email,
      note: t("cards.emailNote"),
      href: `mailto:${company.email}`
    },
    {
      icon: MapPin,
      title: t("cards.address"),
      value: fullAddress(),
      note: null,
      href: "https://maps.google.com/?q=Hennickendorfer+Str.+1,+14947+Nuthe-Urstromtal"
    }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JsonLdScript(organizationSchema()) }}
      />

      <PageHero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        description={t("hero.description")}
        image="https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=2400&auto=format&fit=crop"
      />

      {/* Kontaktkarten */}
      <section className="bg-mist-50 py-16 sm:py-24">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card, index) => (
              <Reveal key={card.title} delay={index * 0.07}>
                <a
                  href={card.href}
                  target={card.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    card.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="flex h-full flex-col rounded-3xl bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover sm:p-8"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500/10 text-accent-600">
                    <card.icon className="h-5 w-5" />
                  </span>
                  <h2 className="mt-4 font-display text-sm font-semibold uppercase tracking-wider text-mist-500">
                    {card.title}
                  </h2>
                  <p className="mt-1.5 font-display text-lg font-bold text-night-900">
                    {card.value}
                  </p>
                  {card.note ? (
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-mist-500">
                      <Clock className="h-3.5 w-3.5" />
                      {card.note}
                    </p>
                  ) : null}
                </a>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Kontaktformular */}
      <section className="bg-white py-16 sm:py-24">
        <Container className="max-w-3xl">
          <SectionHeading title={t("formTitle")} description={t("formDescription")} />
          <Reveal className="mt-10">
            <div className="rounded-3xl bg-mist-50 p-6 sm:p-10">
              <ContactForm />
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Abteilungen */}
      <section className="bg-mist-50 py-16 sm:py-24">
        <Container>
          <SectionHeading title={t("departmentsTitle")} />
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {departments.map((department, index) => (
              <Reveal key={department.name} delay={index * 0.07}>
                <div className="h-full rounded-3xl bg-white p-6 shadow-card sm:p-8">
                  <h3 className="font-display text-lg font-bold text-night-900">
                    {department.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist-500">
                    {department.text}
                  </p>
                  <a
                    href={`mailto:${company.email}`}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent-600 hover:text-accent-500"
                  >
                    <Mail className="h-4 w-4" />
                    {company.email}
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Standorte */}
      <section className="bg-night-950 py-16 sm:py-24">
        <Container>
          <SectionHeading dark title={t("locationsTitle")} />
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {cities.map((location) => (
              <div
                key={location.city}
                className="rounded-3xl bg-night-900 p-5"
              >
                <MapPin className="h-5 w-5 text-accent-400" />
                <h3 className="mt-3 font-display text-base font-bold text-white">
                  {location.city}
                </h3>
                <p className="mt-1 text-xs text-mist-400">{location.region}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
