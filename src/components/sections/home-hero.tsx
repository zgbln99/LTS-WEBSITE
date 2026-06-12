import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export async function HomeHero() {
  const t = await getTranslations("home.hero");

  return (
    <section className="relative flex min-h-[100svh] items-end overflow-hidden bg-night-950 pb-16 pt-32 sm:pb-24">
      {/* Hintergrundbild, Platzhalter für späteres Hero-Video */}
      <Image
        src="https://images.unsplash.com/photo-1591768793355-74d04bb6608f?q=80&w=2400&auto=format&fit=crop"
        alt={t("imageAlt")}
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-50"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/60 to-night-950/30" />

      <Container className="relative">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-mint-400" />
          {t("badge")}
        </span>

        <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.05] text-white sm:text-6xl lg:text-7xl">
          {t("title")}
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-mist-200 sm:text-lg">
          {t("subtitle")}
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/karriere">
              {t("ctaPrimary")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline-light">
            <Link href="/leistungen">{t("ctaSecondary")}</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}
