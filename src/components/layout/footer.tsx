import { getTranslations } from "next-intl/server";
import { Facebook, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { Link, getPathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/layout/logo";
import { company } from "@/data/company";
import { getServices } from "@/data/services";
import {
  getFooterSettings,
  getGeneralSettings,
  type FooterColumn
} from "@/server/site-settings";

export async function Footer({ locale }: { locale: Locale }) {
  const t = await getTranslations("common");
  const settings = await getFooterSettings(locale);
  const general = await getGeneralSettings();

  // Standard-Spalten (werden durch eigene Spalten aus dem Admin ersetzt)
  const defaultColumns: FooterColumn[] = [
    {
      title: t("footer.company"),
      links: [
        { label: t("nav.about"), href: getPathname({ locale, href: "/unternehmen" }) },
        { label: t("nav.fleet"), href: getPathname({ locale, href: "/fuhrpark" }) },
        { label: t("nav.career"), href: getPathname({ locale, href: "/karriere" }) },
        { label: t("nav.knowledge"), href: getPathname({ locale, href: "/wissen" }) },
        { label: t("nav.contact"), href: getPathname({ locale, href: "/kontakt" }) }
      ]
    },
    {
      title: t("footer.services"),
      links: getServices(locale)
        .slice(0, 5)
        .map((service) => ({
          label: service.name,
          href: getPathname({
            locale,
            href: {
              pathname: "/leistungen/[slug]",
              params: { slug: service.slug }
            }
          })
        }))
    }
  ];

  const columns =
    settings.locale?.columns && settings.locale.columns.length > 0
      ? settings.locale.columns
      : defaultColumns;
  const tagline =
    settings.locale?.tagline || general.slogan || t("footer.tagline");

  const phone = settings.global?.phone || company.phone;
  const phoneHref = `tel:${phone.replace(/[^+\d]/g, "")}`;
  const email = settings.global?.email || company.email;
  const addressLines =
    settings.global?.addressLines && settings.global.addressLines.length > 0
      ? settings.global.addressLines
      : [
          t("footer.headquarters"),
          company.address.street,
          `${company.address.zip} ${company.address.city}`,
          company.address.district
        ];
  const facebook = settings.global?.facebook ?? company.social.facebook;
  const linkedin = settings.global?.linkedin ?? company.social.linkedin;

  const year = new Date().getFullYear();

  return (
    <footer className="bg-night-950 text-mist-300">
      <Container className="py-14 lg:py-20">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo name={general.siteName} />
            <p className="mt-4 max-w-xs text-sm leading-relaxed">{tagline}</p>
            {(facebook || linkedin) && (
              <div className="mt-5 flex gap-3">
                {facebook ? (
                  <a
                    href={facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-mist-300 transition-colors hover:bg-accent-500 hover:text-white"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                ) : null}
                {linkedin ? (
                  <a
                    href={linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-mist-300 transition-colors hover:bg-accent-500 hover:text-white"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                ) : null}
              </div>
            )}
          </div>

          {columns.slice(0, 2).map((column, index) => (
            <div key={`${column.title}-${index}`}>
              <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {column.links.map((link, linkIndex) => (
                  <li key={`${link.href}-${linkIndex}`}>
                    <a href={link.href || "#"} className="hover:text-white">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
              {t("footer.contact")}
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a
                  href={phoneHref}
                  className="flex items-center gap-2.5 hover:text-white"
                >
                  <Phone className="h-4 w-4 shrink-0 text-accent-400" />
                  {phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-2.5 hover:text-white"
                >
                  <Mail className="h-4 w-4 shrink-0 text-accent-400" />
                  {email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" />
                <span>
                  {addressLines.map((line, index) => (
                    <span key={index}>
                      {line}
                      {index < addressLines.length - 1 ? <br /> : null}
                    </span>
                  ))}
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
