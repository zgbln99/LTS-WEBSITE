import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Award, Handshake, MapPin, Timer } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { PageHero } from "@/components/sections/page-hero";
import { CtaBanner } from "@/components/sections/cta-banner";
import { pageMetadata } from "@/lib/seo";
import { getServiceCities } from "@/server/content";

export const revalidate = 300;

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.about" });
  return pageMetadata(locale, "/unternehmen", t("title"), t("description"));
}

const valueIcons = [Award, Timer, Handshake, MapPin];

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("about");
  const tHome = await getTranslations("home");

  const story = t.raw("story") as string[];
  const timeline = t.raw("timeline.items") as {
    year: string;
    title: string;
    text: string;
  }[];
  const values = t.raw("values.items") as { title: string; text: string }[];
  const cities = await getServiceCities();

  return (
    <>
      <PageHero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        description={t("hero.description")}
      />

      {/* Geschichte */}
      <section className="bg-mist-50 py-16 sm:py-24">
        <Container className="max-w-3xl">
          <Reveal>
            <div className="space-y-5">
              {story.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 32)}
                  className="text-base leading-relaxed text-night-800 sm:text-lg"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Timeline */}
      <section className="bg-night-950 py-16 sm:py-24">
        <Container>
          <SectionHeading
            dark
            eyebrow={t("timeline.eyebrow")}
            title={t("timeline.title")}
          />
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {timeline.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.08}>
                <li className="h-full rounded-3xl bg-night-900 p-6">
                  <span className="font-display text-sm font-bold uppercase tracking-wider text-accent-400">
                    {item.year}
                  </span>
                  <h3 className="mt-3 font-display text-lg font-bold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist-400">
                    {item.text}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      {/* Werte */}
      <section className="bg-white py-16 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow={t("values.eyebrow")}
            title={t("values.title")}
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => {
              const Icon = valueIcons[index % valueIcons.length];
              return (
                <Reveal key={value.title} delay={index * 0.06}>
                  <div className="h-full rounded-3xl bg-mist-50 p-6">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500/10 text-accent-600">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 font-display text-base font-bold text-night-900">
                      {value.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-mist-500">
                      {value.text}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Standorte */}
      <section className="bg-mist-50 py-16 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow={t("locations.eyebrow")}
            title={t("locations.title")}
            description={t("locations.description")}
          />
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {cities.map((location, index) => (
              <Reveal key={location.city} delay={(index % 5) * 0.05}>
                <div className="h-full rounded-3xl border border-mist-200 bg-white p-5 shadow-card">
                  <MapPin className="h-5 w-5 text-accent-500" />
                  <h3 className="mt-3 font-display text-base font-bold text-night-900">
                    {location.city}
                  </h3>
                  <p className="mt-1 text-xs text-mist-500">{location.region}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <CtaBanner
        title={tHome("contactCta.title")}
        description={tHome("contactCta.description")}
        primaryLabel={tHome("contactCta.primary")}
        secondaryLabel={tHome("contactCta.secondary")}
      />
    </>
  );
}
