import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Inter, Manrope } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import {
  getAnalyticsSettings,
  getGeneralSettings
} from "@/server/site-settings";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CookieConsent } from "@/components/consent/cookie-consent";
import { Analytics } from "@/components/consent/analytics";
import "../globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-inter",
  display: "swap"
});

const manrope = Manrope({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-manrope",
  display: "swap"
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.home" });
  const general = await getGeneralSettings();
  const siteName = general.siteName || "LTS Logistik";
  const homeTitle = general.metaTitle
    ? general.metaTitle
    : `${siteName} | ${general.slogan || t("title")}`;

  return {
    title: {
      template: `%s | ${siteName}`,
      default: homeTitle
    },
    description: general.metaDescription || t("description")
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const messages = await getMessages();
  const general = await getGeneralSettings();
  const analytics = await getAnalyticsSettings();

  return (
    <html lang={locale} className={`${inter.variable} ${manrope.variable}`}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Header
            locale={locale as Locale}
            siteName={general.siteName}
            slogan={general.slogan}
          />
          <main id="content">{children}</main>
          <Footer locale={locale as Locale} />
          <CookieConsent />
          <Analytics config={analytics} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
