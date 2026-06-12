import { getTranslations } from "next-intl/server";
import { Mail, MapPin, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Container } from "@/components/ui/container";
import { company } from "@/data/company";
import { getServices } from "@/data/services";

export async function Footer({ locale }: { locale: Locale }) {
  const t = await getTranslations("common");
  const services = getServices(locale).slice(0, 5);
  const year = new Date().getFullYear();

  return (
    <footer className="bg-night-950 text-mist-300">
      <Container className="py-14 lg:py-20">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className="inline-flex items-center rounded-xl bg-white px-2.5 py-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="LTS Logistik GmbH"
                className="h-7 w-auto"
              />
            </span>
            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              {t("footer.tagline")}
            </p>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
              {t("footer.company")}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/unternehmen" className="hover:text-white">
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <Link href="/fuhrpark" className="hover:text-white">
                  {t("nav.fleet")}
                </Link>
              </li>
              <li>
                <Link href="/karriere" className="hover:text-white">
                  {t("nav.career")}
                </Link>
              </li>
              <li>
                <Link href="/wissen" className="hover:text-white">
                  {t("nav.knowledge")}
                </Link>
              </li>
              <li>
                <Link href="/kontakt" className="hover:text-white">
                  {t("nav.contact")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
              {t("footer.services")}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {services.map((service) => (
                <li key={service.key}>
                  <Link
                    href={{
                      pathname: "/leistungen/[slug]",
                      params: { slug: service.slug }
                    }}
                    className="hover:text-white"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
              {t("footer.contact")}
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a
                  href={company.phoneHref}
                  className="flex items-center gap-2.5 hover:text-white"
                >
                  <Phone className="h-4 w-4 shrink-0 text-accent-400" />
                  {company.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${company.email}`}
                  className="flex items-center gap-2.5 hover:text-white"
                >
                  <Mail className="h-4 w-4 shrink-0 text-accent-400" />
                  {company.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" />
                <span>
                  {t("footer.headquarters")}
                  <br />
                  {company.address.street}
                  <br />
                  {company.address.zip} {company.address.city}
                  <br />
                  {company.address.district}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-mist-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {company.legalName}. {t("footer.rights")}
          </p>
          <div className="flex gap-5">
            <Link href="/impressum" className="hover:text-white">
              {t("footer.imprint")}
            </Link>
            <Link href="/datenschutz" className="hover:text-white">
              {t("footer.privacy")}
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
