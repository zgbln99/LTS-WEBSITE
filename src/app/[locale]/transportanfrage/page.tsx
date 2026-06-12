import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

// LTS Logistik nimmt keine Transportanfragen über die Website an
// (Tätigkeit als Subunternehmer). Alte Links leiten zur Karriereseite.
export default async function InquiryRedirect({
  params
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  redirect({ href: "/karriere", locale });
}
