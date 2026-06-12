import { ArrowRight, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { company } from "@/data/company";

interface CtaBannerProps {
  title: string;
  description: string;
  primaryLabel: string;
  secondaryLabel: string;
  primaryHref?: "/karriere" | "/kontakt" | "/leistungen";
}

export function CtaBanner({
  title,
  description,
  primaryLabel,
  secondaryLabel,
  primaryHref = "/karriere"
}: CtaBannerProps) {
  return (
    <section className="bg-mist-50 py-16 sm:py-24">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-night-950 px-6 py-14 sm:px-12 sm:py-20 lg:px-20">
            <div
              className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent-500/20 blur-3xl"
              aria-hidden
            />
            <div className="relative max-w-2xl">
              <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
                {title}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-mist-300 sm:text-lg">
                {description}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href={primaryHref}>
                    {primaryLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline-light">
                  <a href={company.phoneHref}>
                    <Phone className="h-4 w-4" />
                    {secondaryLabel}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
