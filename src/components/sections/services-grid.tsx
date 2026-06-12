import Image from "next/image";
import {
  ArrowRight,
  FileCheck,
  Globe2,
  Handshake,
  Network,
  Recycle,
  Snowflake,
  Truck,
  Zap,
  type LucideIcon
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Reveal } from "@/components/ui/reveal";
import { getServices, type ServiceKey } from "@/data/services";

const icons: Record<string, LucideIcon> = {
  truck: Truck,
  globe: Globe2,
  zap: Zap,
  snowflake: Snowflake,
  network: Network,
  handshake: Handshake,
  "file-check": FileCheck,
  recycle: Recycle
};

interface ServicesGridProps {
  locale: Locale;
  exclude?: ServiceKey[];
  limit?: number;
  ctaLabel: string;
}

export function ServicesGrid({
  locale,
  exclude = [],
  limit,
  ctaLabel
}: ServicesGridProps) {
  let services = getServices(locale).filter(
    (service) => !exclude.includes(service.key)
  );
  if (limit) services = services.slice(0, limit);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
      {services.map((service, index) => {
        const Icon = icons[service.icon] ?? Truck;
        return (
          <Reveal key={service.key} delay={(index % 4) * 0.08}>
            <Link
              href={{
                pathname: "/leistungen/[slug]",
                params: { slug: service.slug }
              }}
              className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
            >
              <div className="relative h-40 overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-night-950/70 text-accent-400 backdrop-blur-sm">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-lg font-bold text-night-900">
                  {service.name}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-mist-500">
                  {service.excerpt}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-600">
                  {ctaLabel}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}
