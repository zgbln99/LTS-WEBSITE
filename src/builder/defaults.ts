import type { Data } from "@measured/puck";
import { getPathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getServices } from "@/data/services";
import { company } from "@/data/company";

import { serviceOrder, type ServiceKey } from "@/data/services";

export interface BuilderPageDef {
  label: string;
  /** statische Route oder Leistungs-Schlüssel für dynamische Slugs */
  route: string;
  group: "haupt" | "leistungen" | "rechtliches";
  serviceKey?: ServiceKey;
}

const servicePages = Object.fromEntries(
  serviceOrder.map((key) => [
    `leistung-${key}`,
    {
      label: `Leistung: ${key}`, // wird in der Liste durch den Namen ersetzt
      route: "/leistungen/[slug]",
      group: "leistungen" as const,
      serviceKey: key
    }
  ])
);

// Seiten, die im Page-Builder bearbeitet werden können.
export const BUILDER_PAGES: Record<string, BuilderPageDef> = {
  home: { label: "Startseite", route: "/", group: "haupt" },
  karriere: { label: "Karriere", route: "/karriere", group: "haupt" },
  "lkw-fahrer": {
    label: "LKW-Fahrer Landingpage",
    route: "/karriere/lkw-fahrer",
    group: "haupt"
  },
  fuhrpark: { label: "Fuhrpark", route: "/fuhrpark", group: "haupt" },
  unternehmen: { label: "Unternehmen", route: "/unternehmen", group: "haupt" },
  kontakt: { label: "Kontakt", route: "/kontakt", group: "haupt" },
  wissen: { label: "Wissenszentrum", route: "/wissen", group: "haupt" },
  leistungen: {
    label: "Leistungen (Übersicht)",
    route: "/leistungen",
    group: "leistungen"
  },
  ...servicePages,
  impressum: { label: "Impressum", route: "/impressum", group: "rechtliches" },
  datenschutz: {
    label: "Datenschutzerklärung",
    route: "/datenschutz",
    group: "rechtliches"
  }
} as const;

export type BuilderPageKey = keyof typeof BUILDER_PAGES & string;

export function isBuilderPageKey(key: string): key is BuilderPageKey {
  return key in BUILDER_PAGES;
}

const IMAGES = {
  heroHome:
    "https://images.unsplash.com/photo-1591768793355-74d04bb6608f?q=80&w=2400&auto=format&fit=crop",
  heroCareer:
    "https://images.unsplash.com/photo-1591768793355-74d04bb6608f?q=80&w=2400&auto=format&fit=crop",
  heroDriver:
    "https://images.unsplash.com/photo-1616432043562-3671ea2e5242?q=80&w=2400&auto=format&fit=crop",
  heroFleet:
    "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2400&auto=format&fit=crop",
  heroCompany:
    "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?q=80&w=2400&auto=format&fit=crop",
  heroContact:
    "https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=2400&auto=format&fit=crop",
  fleet: [
    "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1591768793355-74d04bb6608f?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=1600&auto=format&fit=crop"
  ]
};

type Messages = Record<string, any>;

let counter = 0;
function block(type: string, props: Record<string, unknown>) {
  counter += 1;
  return { type, props: { id: `${type}-${counter}`, ...props } };
}

function paragraphs(texts: string[]) {
  return texts.map((text) => `<p>${text}</p>`).join("");
}

// Erzeugt den Startinhalt einer Seite aus den aktuellen Website-Texten.
export function generateDefaultData(
  key: BuilderPageKey,
  locale: Locale,
  m: Messages
): Data {
  counter = 0;
  const href = (pathname: string, params?: Record<string, string>) =>
    getPathname({
      locale,
      href: (params ? { pathname, params } : pathname) as never
    });
  const tel = company.phoneHref;

  const statsItems = [
    { value: `${company.stats.vehicles}+`, label: m.home.stats.vehicles },
    { value: `${company.stats.employees}+`, label: m.home.stats.employees },
    { value: `${company.stats.locations}`, label: m.home.stats.locations },
    { value: `${company.stats.foundedYear}`, label: m.home.stats.founded }
  ];

  const content: { type: string; props: Record<string, unknown> }[] = [];

  if (key === "home") {
    const services = getServices(locale).slice(0, 4);
    content.push(
      block("Hero", {
        eyebrow: m.home.hero.badge,
        title: m.home.hero.title,
        subtitle: m.home.hero.subtitle,
        image: IMAGES.heroHome,
        height: "full",
        primaryLabel: m.home.hero.ctaPrimary,
        primaryHref: href("/karriere"),
        secondaryLabel: m.home.hero.ctaSecondary,
        secondaryHref: href("/leistungen")
      }),
      block("Statistiken", { items: statsItems }),
      block("Ueberschrift", {
        eyebrow: m.home.services.eyebrow,
        title: m.home.services.title,
        description: m.home.services.description,
        theme: "light",
        align: "left"
      }),
      block("Karten", {
        theme: "light",
        columns: "4",
        style: "photo",
        items: services.map((service) => ({
          title: service.name,
          specs: "",
          text: service.excerpt,
          image: service.image,
          href: href("/leistungen/[slug]", { slug: service.slug })
        }))
      }),
      block("Ueberschrift", {
        eyebrow: m.home.coverage.eyebrow,
        title: m.home.coverage.title,
        description: m.home.coverage.description,
        theme: "dark",
        align: "left"
      }),
      block("Karte", { height: "large" }),
      block("Einsatzorte", { title: m.home.coverage.locationsTitle }),
      block("Ueberschrift", {
        eyebrow: m.home.fleet.eyebrow,
        title: m.home.fleet.title,
        description: m.home.fleet.description,
        theme: "light",
        align: "left"
      }),
      block("Karten", {
        theme: "light",
        columns: "4",
        style: "plain",
        items: (m.fleetPage.categories as any[])
          .slice(0, 4)
          .map((category) => ({
            title: category.name,
            specs: category.specs,
            text: category.text,
            image: "",
            href: href("/fuhrpark")
          }))
      }),
      block("Referenzen", {
        eyebrow: m.home.testimonials.eyebrow,
        title: m.home.testimonials.title
      }),
      block("CTABanner", {
        title: m.home.contactCta.title,
        description: m.home.contactCta.description,
        primaryLabel: m.home.contactCta.primary,
        primaryHref: href("/karriere"),
        secondaryLabel: m.home.contactCta.secondary,
        secondaryHref: tel
      })
    );
  }

  if (key === "karriere") {
    content.push(
      block("Seitenkopf", {
        eyebrow: m.career.hero.eyebrow,
        title: m.career.hero.title,
        description: m.career.hero.description,
        image: IMAGES.heroCareer
      }),
      block("Ueberschrift", {
        eyebrow: m.career.jobs.eyebrow,
        title: m.career.jobs.title,
        description: "",
        theme: "light",
        align: "left"
      }),
      block("Jobboerse", {}),
      block("RueckrufPanel", {}),
      block("Ueberschrift", {
        eyebrow: "",
        title: m.career.categoriesTitle,
        description: "",
        theme: "white",
        align: "left"
      }),
      block("Karten", {
        theme: "white",
        columns: "3",
        style: "plain",
        items: (m.career.categories as any[]).map((category) => ({
          title: category.name,
          specs: "",
          text: category.text,
          image: "",
          href: ""
        }))
      }),
      block("Ueberschrift", {
        eyebrow: "",
        title: m.career.benefitsTitle,
        description: "",
        theme: "dark",
        align: "left"
      }),
      block("Checkliste", {
        theme: "dark",
        items: (m.career.benefits as string[]).map((text) => ({ text }))
      }),
      block("Bewerbungsformular", {
        title: m.career.apply.title,
        category: ""
      })
    );
  }

  if (key === "lkw-fahrer") {
    content.push(
      block("Hero", {
        eyebrow: m.driver.hero.eyebrow,
        title: m.driver.hero.title,
        subtitle: m.driver.hero.description,
        image: IMAGES.heroDriver,
        height: "large",
        primaryLabel: m.driver.hero.cta,
        primaryHref: "#bewerbung",
        secondaryLabel: company.phone,
        secondaryHref: tel
      }),
      block("Statistiken", {
        items: [
          { value: m.driver.salary.value, label: m.driver.salary.note },
          ...statsItems.slice(0, 2)
        ]
      }),
      block("Karten", {
        theme: "light",
        columns: "4",
        style: "plain",
        items: (m.driver.facts as any[]).map((fact) => ({
          title: fact.title,
          specs: "",
          text: fact.text,
          image: "",
          href: ""
        }))
      }),
      block("Ueberschrift", {
        eyebrow: "",
        title: m.driver.requirementsTitle,
        description: "",
        theme: "white",
        align: "left"
      }),
      block("Checkliste", {
        theme: "white",
        items: (m.driver.requirements as string[]).map((text) => ({ text }))
      }),
      block("Ueberschrift", {
        eyebrow: "",
        title: m.driver.applyTitle,
        description: "",
        theme: "light",
        align: "left"
      }),
      block("Checkliste", {
        theme: "light",
        items: (m.driver.applySteps as string[]).map((text) => ({ text }))
      }),
      block("Bewerbungsformular", {
        title: m.career.apply.title,
        category: "drivers"
      })
    );
  }

  if (key === "fuhrpark") {
    content.push(
      block("Seitenkopf", {
        eyebrow: m.fleetPage.hero.eyebrow,
        title: m.fleetPage.hero.title,
        description: m.fleetPage.hero.description,
        image: IMAGES.heroFleet
      }),
      block("Statistiken", { items: statsItems }),
      block("Karten", {
        theme: "light",
        columns: "3",
        style: "photo",
        items: (m.fleetPage.categories as any[]).map((category, index) => ({
          title: category.name,
          specs: category.specs,
          text: category.text,
          image: IMAGES.fleet[index % IMAGES.fleet.length],
          href: ""
        }))
      }),
      block("CTABanner", {
        title: m.home.contactCta.title,
        description: m.home.contactCta.description,
        primaryLabel: m.home.contactCta.primary,
        primaryHref: href("/karriere"),
        secondaryLabel: m.home.contactCta.secondary,
        secondaryHref: tel
      })
    );
  }

  if (key === "unternehmen") {
    content.push(
      block("Seitenkopf", {
        eyebrow: m.about.hero.eyebrow,
        title: m.about.hero.title,
        description: m.about.hero.description,
        image: IMAGES.heroCompany
      }),
      block("Text", {
        html: paragraphs(m.about.story as string[]),
        theme: "light",
        width: "normal"
      }),
      block("Ueberschrift", {
        eyebrow: m.about.timeline.eyebrow,
        title: m.about.timeline.title,
        description: "",
        theme: "dark",
        align: "left"
      }),
      block("Karten", {
        theme: "dark",
        columns: "4",
        style: "plain",
        items: (m.about.timeline.items as any[]).map((item) => ({
          title: item.title,
          specs: item.year,
          text: item.text,
          image: "",
          href: ""
        }))
      }),
      block("Ueberschrift", {
        eyebrow: m.about.values.eyebrow,
        title: m.about.values.title,
        description: "",
        theme: "white",
        align: "left"
      }),
      block("Karten", {
        theme: "white",
        columns: "4",
        style: "plain",
        items: (m.about.values.items as any[]).map((item) => ({
          title: item.title,
          specs: "",
          text: item.text,
          image: "",
          href: ""
        }))
      }),
      block("Ueberschrift", {
        eyebrow: m.about.locations.eyebrow,
        title: m.about.locations.title,
        description: m.about.locations.description,
        theme: "dark",
        align: "left"
      }),
      block("Einsatzorte", { title: m.home.coverage.locationsTitle }),
      block("CTABanner", {
        title: m.home.contactCta.title,
        description: m.home.contactCta.description,
        primaryLabel: m.home.contactCta.primary,
        primaryHref: href("/karriere"),
        secondaryLabel: m.home.contactCta.secondary,
        secondaryHref: tel
      })
    );
  }

  if (key === "kontakt") {
    content.push(
      block("Seitenkopf", {
        eyebrow: m.contact.hero.eyebrow,
        title: m.contact.hero.title,
        description: m.contact.hero.description,
        image: IMAGES.heroContact
      }),
      block("Karten", {
        theme: "light",
        columns: "3",
        style: "plain",
        items: [
          {
            title: company.phone,
            specs: m.contact.cards.phone,
            text: m.contact.cards.phoneNote,
            image: "",
            href: tel
          },
          {
            title: company.email,
            specs: m.contact.cards.email,
            text: m.contact.cards.emailNote,
            image: "",
            href: `mailto:${company.email}`
          },
          {
            title: `${company.address.street}, ${company.address.zip} ${company.address.city}`,
            specs: m.contact.cards.address,
            text: company.address.district,
            image: "",
            href: "https://maps.google.com/?q=Hennickendorfer+Str.+1,+14947+Nuthe-Urstromtal"
          }
        ]
      }),
      block("Kontaktformular", { title: m.contact.formTitle }),
      block("Ueberschrift", {
        eyebrow: "",
        title: m.contact.departmentsTitle,
        description: "",
        theme: "light",
        align: "left"
      }),
      block("Karten", {
        theme: "light",
        columns: "3",
        style: "plain",
        items: (m.contact.departments as any[]).map((department) => ({
          title: department.name,
          specs: "",
          text: department.text,
          image: "",
          href: `mailto:${company.email}`
        }))
      }),
      block("Ueberschrift", {
        eyebrow: "",
        title: m.contact.locationsTitle,
        description: "",
        theme: "dark",
        align: "left"
      }),
      block("Einsatzorte", { title: "" })
    );
  }

  if (key === "leistungen") {
    content.push(
      block("Seitenkopf", {
        eyebrow: m.servicesPage.hero.eyebrow,
        title: m.servicesPage.hero.title,
        description: m.servicesPage.hero.description,
        image: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=2400&auto=format&fit=crop"
      }),
      block("Leistungen", { ctaLabel: m.common.cta.learnMore }),
      block("CTABanner", {
        title: m.servicesPage.cta.title,
        description: m.servicesPage.cta.description,
        primaryLabel: m.servicesPage.cta.primary,
        primaryHref: href("/kontakt"),
        secondaryLabel: m.servicesPage.cta.secondary,
        secondaryHref: tel
      })
    );
  }

  if (key.startsWith("leistung-")) {
    const serviceKey = BUILDER_PAGES[key]?.serviceKey;
    const service = getServices(locale).find(
      (entry) => entry.key === serviceKey
    );
    if (service) {
      content.push(
        block("Seitenkopf", {
          eyebrow: m.servicesPage.hero.eyebrow,
          title: service.name,
          description: service.excerpt,
          image: service.image
        }),
        block("BildText", {
          html: paragraphs(service.description),
          image: service.image,
          reverse: false,
          theme: "light"
        }),
        block("Ueberschrift", {
          eyebrow: "",
          title: m.servicesPage.benefitsTitle,
          description: "",
          theme: "white",
          align: "left"
        }),
        block("Karten", {
          theme: "white",
          columns: "4",
          style: "plain",
          items: service.benefits.map((benefit) => ({
            title: benefit.title,
            specs: "",
            text: benefit.text,
            image: "",
            href: ""
          }))
        }),
        block("Ueberschrift", {
          eyebrow: "",
          title: m.servicesPage.processTitle,
          description: "",
          theme: "dark",
          align: "left"
        }),
        block("Karten", {
          theme: "dark",
          columns: "4",
          style: "plain",
          items: service.steps.map((step, index) => ({
            title: step.title,
            specs: String(index + 1).padStart(2, "0"),
            text: step.text,
            image: "",
            href: ""
          }))
        }),
        block("Ueberschrift", {
          eyebrow: "",
          title: m.servicesPage.faqTitle,
          description: "",
          theme: "light",
          align: "center"
        }),
        block("FAQ", {
          items: service.faqs.map((faq) => ({
            question: faq.question,
            answer: faq.answer
          }))
        }),
        block("CTABanner", {
          title: m.servicesPage.cta.title,
          description: m.servicesPage.cta.description,
          primaryLabel: m.servicesPage.cta.primary,
          primaryHref: href("/kontakt"),
          secondaryLabel: m.servicesPage.cta.secondary,
          secondaryHref: tel
        })
      );
    }
  }

  if (key === "wissen") {
    content.push(
      block("Seitenkopf", {
        eyebrow: m.knowledge.hero.eyebrow,
        title: m.knowledge.hero.title,
        description: m.knowledge.hero.description,
        image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2400&auto=format&fit=crop"
      }),
      block("Artikel", {}),
      block("Ueberschrift", {
        eyebrow: "",
        title: m.knowledge.categoriesTitle,
        description: "",
        theme: "light",
        align: "left"
      }),
      block("Karten", {
        theme: "light",
        columns: "4",
        style: "plain",
        items: (m.knowledge.categories as any[]).map((category) => ({
          title: category.name,
          specs: "",
          text: category.text,
          image: "",
          href: ""
        }))
      })
    );
  }

  if (key === "impressum") {
    const address = `${company.address.street}<br/>${company.address.zip} ${company.address.city}<br/>${company.address.district}`;
    content.push(
      block("Seitenkopf", {
        eyebrow: "Rechtliches",
        title: "Impressum",
        description: "",
        image: ""
      }),
      block("Text", {
        theme: "light",
        width: "normal",
        html:
          `<h2>Angaben gemäß § 5 TMG</h2><p>${company.legalName}<br/>${address}</p>` +
          `<h2>Kontakt</h2><p>Telefon: ${company.phone}<br/>E-Mail: ${company.email}</p>` +
          `<h2>Vertretungsberechtigte Geschäftsführung</h2><p>Die Angaben zur Geschäftsführung, zum Handelsregister und zur Umsatzsteuer-Identifikationsnummer werden vor Veröffentlichung durch die Geschäftsleitung ergänzt und geprüft.</p>` +
          `<h2>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2><p>${company.legalName}, ${company.address.street}, ${company.address.zip} ${company.address.city}, ${company.address.district}</p>` +
          `<h2>Streitschlichtung</h2><p>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr/</a>. Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>`
      })
    );
  }

  if (key === "datenschutz") {
    content.push(
      block("Seitenkopf", {
        eyebrow: "Rechtliches",
        title: "Datenschutzerklärung",
        description: "",
        image: ""
      }),
      block("Text", {
        theme: "light",
        width: "normal",
        html:
          `<h2>1. Verantwortlicher</h2><p>Verantwortlich für die Verarbeitung personenbezogener Daten auf dieser Website ist die ${company.legalName}, ${company.address.street}, ${company.address.zip} ${company.address.city}, ${company.address.district}, E-Mail: ${company.email}, Telefon: ${company.phone}.</p>` +
          `<h2>2. Erhebung und Speicherung personenbezogener Daten</h2><p>Beim Aufruf dieser Website werden durch den Hostinganbieter automatisch Informationen in sogenannten Server-Logfiles gespeichert (IP-Adresse, Datum und Uhrzeit des Zugriffs, aufgerufene Seite, verwendeter Browser). Diese Daten dienen der Sicherstellung eines störungsfreien Betriebs und werden nach kurzer Zeit gelöscht. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.</p>` +
          `<h2>3. Kontaktaufnahme</h2><p>Wenn Sie uns per E-Mail oder Telefon kontaktieren, verarbeiten wir die von Ihnen übermittelten Daten zur Bearbeitung Ihrer Anfrage. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, soweit die Anfrage der Anbahnung oder Durchführung eines Vertrags dient, im Übrigen Art. 6 Abs. 1 lit. f DSGVO.</p>` +
          `<h2>4. Bewerbungen</h2><p>Bewerbungsunterlagen verarbeiten wir ausschließlich zum Zweck des Bewerbungsverfahrens auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO und § 26 BDSG. Unterlagen nicht berücksichtigter Bewerbungen werden spätestens sechs Monate nach Abschluss des Verfahrens gelöscht, sofern keine Einwilligung zur längeren Speicherung vorliegt.</p>` +
          `<h2>5. Ihre Rechte</h2><p>Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16 DSGVO), Löschung (Art. 17 DSGVO), Einschränkung der Verarbeitung (Art. 18 DSGVO), Datenübertragbarkeit (Art. 20 DSGVO) sowie Widerspruch gegen die Verarbeitung (Art. 21 DSGVO). Außerdem besteht ein Beschwerderecht bei der zuständigen Datenschutzaufsichtsbehörde.</p>` +
          `<h2>6. Cookies und Analysedienste</h2><p>Analyse- und Marketingdienste werden ausschließlich nach Ihrer ausdrücklichen Einwilligung über das Consent-Banner geladen (Art. 6 Abs. 1 lit. a DSGVO, § 25 TDDDG). Ihre Auswahl können Sie jederzeit über das Löschen der Cookies widerrufen.</p>`
      })
    );
  }

  return { root: { props: {} }, content, zones: {} } as Data;
}
