import type { Data } from "@measured/puck";
import { getPathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getServices } from "@/data/services";
import { company } from "@/data/company";

// Seiten, die im Page-Builder bearbeitet werden können.
export const BUILDER_PAGES = {
  home: { label: "Startseite", route: "/" },
  karriere: { label: "Karriere", route: "/karriere" },
  "lkw-fahrer": { label: "LKW-Fahrer Landingpage", route: "/karriere/lkw-fahrer" },
  fuhrpark: { label: "Fuhrpark", route: "/fuhrpark" },
  unternehmen: { label: "Unternehmen", route: "/unternehmen" },
  kontakt: { label: "Kontakt", route: "/kontakt" }
} as const;

export type BuilderPageKey = keyof typeof BUILDER_PAGES;

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

  return { root: { props: {} }, content, zones: {} } as Data;
}
