"use client";

import type { Config } from "@measured/puck";
import {
  ApplicationFormBlock,
  CallbackBlock,
  CardsBlock,
  ChecklistBlock,
  CityChipsBlock,
  ContactFormBlock,
  CtaBlock,
  FaqBlock,
  HeadingBlock,
  HeroBlock,
  ImageBlock,
  JobBoardBlock,
  MapBlock,
  PageHeaderBlock,
  RichTextBlock,
  SpacerBlock,
  SplitBlock,
  StatsBlock,
  TestimonialsBlock
} from "@/builder/blocks";
import { RichTextField } from "@/builder/rich-text-field";

const themeField = {
  type: "select" as const,
  label: "Hintergrund",
  options: [
    { label: "Hell", value: "light" },
    { label: "Weiß", value: "white" },
    { label: "Dunkel", value: "dark" }
  ]
};

const richTextField = {
  type: "custom" as const,
  label: "Text",
  render: ({
    value,
    onChange
  }: {
    value: string;
    onChange: (value: string) => void;
  }) => <RichTextField value={value ?? ""} onChange={onChange} />
};

export const builderConfig: Config = {
  categories: {
    kopf: {
      title: "Seitenkopf",
      components: ["Hero", "Seitenkopf"]
    },
    inhalt: {
      title: "Inhalt",
      components: [
        "Ueberschrift",
        "Text",
        "BildText",
        "Bild",
        "Karten",
        "Checkliste",
        "Statistiken",
        "FAQ",
        "Abstand"
      ]
    },
    dynamisch: {
      title: "Funktionen",
      components: [
        "Jobboerse",
        "RueckrufPanel",
        "Karte",
        "Einsatzorte",
        "Referenzen",
        "Bewerbungsformular",
        "Kontaktformular",
        "CTABanner"
      ]
    }
  },
  components: {
    Hero: {
      label: "Hero (große Startfläche)",
      fields: {
        eyebrow: { type: "text", label: "Badge-Text" },
        title: { type: "textarea", label: "Überschrift" },
        subtitle: { type: "textarea", label: "Untertitel" },
        image: { type: "text", label: "Hintergrundbild (URL)" },
        height: {
          type: "select",
          label: "Höhe",
          options: [
            { label: "Vollbild", value: "full" },
            { label: "Groß", value: "large" },
            { label: "Mittel", value: "medium" }
          ]
        },
        primaryLabel: { type: "text", label: "Button 1: Text" },
        primaryHref: { type: "text", label: "Button 1: Link" },
        secondaryLabel: { type: "text", label: "Button 2: Text" },
        secondaryHref: { type: "text", label: "Button 2: Link" }
      },
      defaultProps: {
        eyebrow: "",
        title: "Überschrift",
        subtitle: "",
        image: "",
        height: "large",
        primaryLabel: "",
        primaryHref: "",
        secondaryLabel: "",
        secondaryHref: ""
      },
      render: (props) => <HeroBlock {...(props as any)} />
    },

    Seitenkopf: {
      label: "Seitenkopf (Unterseite)",
      fields: {
        eyebrow: { type: "text", label: "Badge-Text" },
        title: { type: "textarea", label: "Überschrift" },
        description: { type: "textarea", label: "Beschreibung" },
        image: { type: "text", label: "Hintergrundbild (URL)" }
      },
      defaultProps: {
        eyebrow: "",
        title: "Überschrift",
        description: "",
        image: ""
      },
      render: (props) => <PageHeaderBlock {...(props as any)} />
    },

    Ueberschrift: {
      label: "Überschrift",
      fields: {
        eyebrow: { type: "text", label: "Badge-Text" },
        title: { type: "textarea", label: "Überschrift" },
        description: { type: "textarea", label: "Beschreibung" },
        theme: themeField,
        align: {
          type: "radio",
          label: "Ausrichtung",
          options: [
            { label: "Links", value: "left" },
            { label: "Zentriert", value: "center" }
          ]
        }
      },
      defaultProps: {
        eyebrow: "",
        title: "Überschrift",
        description: "",
        theme: "light",
        align: "left"
      },
      render: (props) => <HeadingBlock {...(props as any)} />
    },

    Text: {
      label: "Fließtext (formatierbar)",
      fields: {
        html: richTextField,
        theme: themeField,
        width: {
          type: "select",
          label: "Breite",
          options: [
            { label: "Schmal", value: "narrow" },
            { label: "Normal", value: "normal" },
            { label: "Volle Breite", value: "wide" }
          ]
        }
      },
      defaultProps: {
        html: "<p>Ihr Text...</p>",
        theme: "white",
        width: "normal"
      },
      render: (props) => <RichTextBlock {...(props as any)} />
    },

    BildText: {
      label: "Bild + Text",
      fields: {
        html: richTextField,
        image: { type: "text", label: "Bild (URL)" },
        reverse: {
          type: "radio",
          label: "Bildposition",
          options: [
            { label: "Rechts", value: false },
            { label: "Links", value: true }
          ]
        },
        theme: themeField
      },
      defaultProps: {
        html: "<p>Ihr Text...</p>",
        image: "",
        reverse: false,
        theme: "light"
      },
      render: (props) => <SplitBlock {...(props as any)} />
    },

    Bild: {
      label: "Bild",
      fields: {
        image: { type: "text", label: "Bild (URL)" },
        alt: { type: "text", label: "Alt-Text" },
        height: {
          type: "select",
          label: "Höhe",
          options: [
            { label: "Klein", value: "small" },
            { label: "Mittel", value: "medium" },
            { label: "Groß", value: "large" }
          ]
        }
      },
      defaultProps: { image: "", alt: "", height: "medium" },
      render: (props) => <ImageBlock {...(props as any)} />
    },

    Karten: {
      label: "Karten-Raster",
      fields: {
        theme: themeField,
        columns: {
          type: "select",
          label: "Spalten",
          options: [
            { label: "2", value: "2" },
            { label: "3", value: "3" },
            { label: "4", value: "4" }
          ]
        },
        style: {
          type: "select",
          label: "Stil",
          options: [
            { label: "Mit Foto", value: "photo" },
            { label: "Nur Text", value: "plain" }
          ]
        },
        items: {
          type: "array",
          label: "Karten",
          getItemSummary: (item: { title?: string }) =>
            item.title || "Karte",
          arrayFields: {
            title: { type: "text", label: "Titel" },
            specs: { type: "text", label: "Hervorgehobene Zeile (rot)" },
            text: { type: "textarea", label: "Text" },
            image: { type: "text", label: "Bild (URL)" },
            href: { type: "text", label: "Link (optional)" }
          },
          defaultItemProps: {
            title: "Titel",
            specs: "",
            text: "",
            image: "",
            href: ""
          }
        }
      },
      defaultProps: {
        theme: "light",
        columns: "3",
        style: "plain",
        items: []
      },
      render: (props) => <CardsBlock {...(props as any)} />
    },

    Checkliste: {
      label: "Checkliste",
      fields: {
        theme: themeField,
        items: {
          type: "array",
          label: "Punkte",
          getItemSummary: (item: { text?: string }) =>
            item.text || "Punkt",
          arrayFields: { text: { type: "textarea", label: "Text" } },
          defaultItemProps: { text: "" }
        }
      },
      defaultProps: { theme: "white", items: [] },
      render: (props) => <ChecklistBlock {...(props as any)} />
    },

    Statistiken: {
      label: "Statistiken",
      fields: {
        items: {
          type: "array",
          label: "Zahlen",
          getItemSummary: (item: { label?: string }) =>
            item.label || "Zahl",
          arrayFields: {
            value: { type: "text", label: "Wert (z.B. 260+)" },
            label: { type: "text", label: "Beschriftung" }
          },
          defaultItemProps: { value: "0", label: "" }
        }
      },
      defaultProps: { items: [] },
      render: (props) => <StatsBlock {...(props as any)} />
    },

    FAQ: {
      label: "FAQ (Aufklappliste)",
      fields: {
        items: {
          type: "array",
          label: "Fragen",
          getItemSummary: (item: { question?: string }) =>
            item.question || "Frage",
          arrayFields: {
            question: { type: "text", label: "Frage" },
            answer: { type: "textarea", label: "Antwort" }
          },
          defaultItemProps: { question: "", answer: "" }
        }
      },
      defaultProps: { items: [] },
      render: (props) => <FaqBlock {...(props as any)} />
    },

    Abstand: {
      label: "Abstand",
      fields: {
        size: {
          type: "select",
          label: "Größe",
          options: [
            { label: "Klein", value: "small" },
            { label: "Mittel", value: "medium" },
            { label: "Groß", value: "large" }
          ]
        }
      },
      defaultProps: { size: "medium" },
      render: (props) => <SpacerBlock {...(props as any)} />
    },

    Jobboerse: {
      label: "Jobbörse (Stellenliste)",
      fields: {},
      render: () => <JobBoardBlock />
    },

    RueckrufPanel: {
      label: "Schneller Kontakt (Rückruf)",
      fields: {},
      render: () => <CallbackBlock />
    },

    Karte: {
      label: "Einsatzorte-Karte",
      fields: {
        height: {
          type: "select",
          label: "Höhe",
          options: [
            { label: "Mittel", value: "medium" },
            { label: "Groß", value: "large" }
          ]
        }
      },
      defaultProps: { height: "large" },
      render: (props) => <MapBlock {...(props as any)} />
    },

    Einsatzorte: {
      label: "Einsatzorte (Chips)",
      fields: { title: { type: "text", label: "Titel" } },
      defaultProps: { title: "Einsatzorte" },
      render: (props) => <CityChipsBlock {...(props as any)} />
    },

    Referenzen: {
      label: "Referenzen",
      fields: {
        eyebrow: { type: "text", label: "Badge-Text" },
        title: { type: "text", label: "Überschrift" }
      },
      defaultProps: { eyebrow: "Referenzen", title: "Was unsere Kunden sagen" },
      render: (props) => <TestimonialsBlock {...(props as any)} />
    },

    Bewerbungsformular: {
      label: "Bewerbungsformular",
      fields: {
        title: { type: "text", label: "Überschrift" },
        category: {
          type: "select",
          label: "Vorausgewählter Bereich",
          options: [
            { label: "Auswahl durch Bewerber", value: "" },
            { label: "Fahrer", value: "drivers" },
            { label: "Disposition", value: "dispatchers" },
            { label: "Büro", value: "office" },
            { label: "Logistik", value: "logistics" },
            { label: "Lager", value: "warehouse" }
          ]
        }
      },
      defaultProps: { title: "Jetzt bewerben", category: "" },
      render: (props) => <ApplicationFormBlock {...(props as any)} />
    },

    Kontaktformular: {
      label: "Kontaktformular",
      fields: { title: { type: "text", label: "Überschrift" } },
      defaultProps: { title: "Schreiben Sie uns" },
      render: (props) => <ContactFormBlock {...(props as any)} />
    },

    CTABanner: {
      label: "CTA-Banner (dunkel)",
      fields: {
        title: { type: "textarea", label: "Überschrift" },
        description: { type: "textarea", label: "Beschreibung" },
        primaryLabel: { type: "text", label: "Button 1: Text" },
        primaryHref: { type: "text", label: "Button 1: Link" },
        secondaryLabel: { type: "text", label: "Button 2: Text (Telefon)" },
        secondaryHref: { type: "text", label: "Button 2: Link" }
      },
      defaultProps: {
        title: "Überschrift",
        description: "",
        primaryLabel: "",
        primaryHref: "",
        secondaryLabel: "",
        secondaryHref: ""
      },
      render: (props) => <CtaBlock {...(props as any)} />
    }
  }
};
