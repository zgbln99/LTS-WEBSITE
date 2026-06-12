import Image from "next/image";
import { Container } from "@/components/ui/container";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description?: string;
  /** Optionales Hintergrundbild (z.B. Flottenfoto) */
  image?: string;
  children?: React.ReactNode;
}

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  children
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-night-950 pb-16 pt-32 sm:pb-24 sm:pt-44">
      {image ? (
        <>
          <Image
            src={image}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/70 to-night-950/40" />
        </>
      ) : (
        <div
          className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-accent-500/15 blur-3xl"
          aria-hidden
        />
      )}
      <Container className="relative">
        <span className="inline-flex items-center rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent-400 backdrop-blur-sm">
          {eyebrow}
        </span>
        <h1 className="mt-5 max-w-5xl text-4xl font-extrabold leading-[1.08] text-white sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-5 max-w-4xl text-base leading-relaxed text-mist-300 sm:text-lg">
            {description}
          </p>
        ) : null}
        {children}
      </Container>
    </section>
  );
}
