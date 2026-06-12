import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Reveal } from "@/components/ui/reveal";
import { company } from "@/data/company";

export async function StatBar() {
  const t = await getTranslations("home.stats");

  const stats = [
    { value: company.stats.vehicles, suffix: "+", label: t("vehicles") },
    { value: company.stats.employees, suffix: "+", label: t("employees") },
    { value: company.stats.locations, suffix: "", label: t("locations") },
    { value: company.stats.foundedYear, suffix: "", label: t("founded"), plain: true }
  ];

  return (
    <section className="bg-night-950 pb-16 sm:pb-24">
      <Container>
        <Reveal>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-white/10 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-night-900 p-6 sm:p-8"
              >
                <dd className="font-display text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
                  {stat.plain ? (
                    <span>{stat.value}</span>
                  ) : (
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  )}
                </dd>
                <dt className="mt-2 text-sm text-mist-400">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </Reveal>
      </Container>
    </section>
  );
}
