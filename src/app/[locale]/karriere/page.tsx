import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ArrowRight,
  Check,
  ClipboardList,
  Headset,
  Mail,
  Phone,
  Truck,
  Users,
  Warehouse,
  type LucideIcon
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { PageHero } from "@/components/sections/page-hero";
import { pageMetadata } from "@/lib/seo";
import { company } from "@/data/company";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.career" });
  return pageMetadata(locale, "/karriere", t("title"), t("description"));
}

const categoryIcons: LucideIcon[] = [
  Truck,
  Headset,
  ClipboardList,
  Users,
  Warehouse
];

export default async function CareerPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("career");

  const categories = t.raw("categories") as { name: string; text: string }[];
  const benefits = t.raw("benefits") as string[];

  return (
    <>
      <PageHero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        description={t("hero.description")}
      />

      {/* Bereiche */}
      <section className="bg-mist-50 py-16 sm:py-24">
        <Container>
          <SectionHeading title={t("categoriesTitle")} />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => {
              const Icon = categoryIcons[index % categoryIcons.length];
              return (
                <Reveal key={category.name} delay={(index % 3) * 0.07}>
                  <div className="flex h-full flex-col rounded-3xl border border-mist-200 bg-white p-6 shadow-card sm:p-8">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500/10 text-accent-600">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 font-display text-lg font-bold text-night-900">
                      {category.name}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-mist-500">
                      {category.text}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Benefits */}
      <section className="bg-night-950 py-16 sm:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <SectionHeading dark title={t("benefitsTitle")} />
            <ul className="space-y-3.5">
              {benefits.map((benefit) => (
                <Reveal key={benefit}>
                  <li className="flex items-start gap-3 text-base text-mist-200">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-mint-400" />
                    {benefit}
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* Bewerbung */}
      <section className="bg-mist-50 py-16 sm:py-24">
        <Container>
          <Reveal>
            <div className="rounded-[2rem] bg-white p-8 shadow-card sm:p-12">
              <div className="max-w-2xl">
                <h2 className="font-display text-3xl font-extrabold text-night-900 sm:text-4xl">
                  {t("apply.title")}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-mist-500">
                  {t("apply.description")}
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg">
                    <a
                      href={`mailto:${company.email}?subject=Bewerbung`}
                    >
                      <Mail className="h-4 w-4" />
                      {t("apply.emailCta")}
                    </a>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <a href={company.phoneHref}>
                      <Phone className="h-4 w-4" />
                      {t("apply.phoneCta")}
                    </a>
                  </Button>
                </div>
              </div>
              <div className="mt-10 flex flex-col gap-4 rounded-3xl bg-night-950 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                <p className="max-w-xl text-sm leading-relaxed text-mist-300">
                  {t("apply.driverTeaser")}
                </p>
                <Button asChild variant="light" className="shrink-0">
                  <Link href="/karriere/lkw-fahrer">
                    {t("apply.driverCta")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
