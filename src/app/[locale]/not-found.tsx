import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default async function NotFoundPage() {
  const t = await getTranslations("notFound");

  return (
    <section className="flex min-h-[70svh] items-center bg-night-950 pt-24">
      <Container className="text-center">
        <p className="font-display text-7xl font-extrabold text-accent-500">
          404
        </p>
        <h1 className="mt-4 font-display text-3xl font-extrabold text-white sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base text-mist-400">
          {t("description")}
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/">{t("cta")}</Link>
        </Button>
      </Container>
    </section>
  );
}
