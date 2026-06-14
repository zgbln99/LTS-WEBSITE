import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/sections/page-hero";
import { AppointmentForm } from "@/components/career/appointment-form";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "appointment" });
  return pageMetadata(locale, "/karriere/termin", t("title"), t("intro"));
}

export default async function AppointmentPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "appointment" });

  return (
    <>
      <PageHero
        eyebrow={t("type")}
        title={t("title")}
        image="https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=2400&auto=format&fit=crop"
      />
      <section className="bg-mist-50 py-16 sm:py-24">
        <Container className="max-w-2xl">
          <p className="text-lg leading-relaxed text-night-700">{t("intro")}</p>
          <div className="mt-8 rounded-3xl bg-white p-6 shadow-card sm:p-8">
            <AppointmentForm />
          </div>
        </Container>
      </section>
    </>
  );
}
