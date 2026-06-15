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
  TestimonialsBlock,
  LeistungenBlock,
  ArtikelBlock,
  HtmlBlock
} from "@/builder/blocks";
import { RichTextField } from "@/builder/rich-text-field";
import { ImageField } from "@/builder/fields/image-field";
import { LinkField } from "@/builder/fields/link-field";
import { VideoField } from "@/builder/fields/video-field";

const themeField = {
  type: "select" as const,
  label: "Hintergrund",
  options: [
    { label: "Hell", value: "light" },
    { label: "Weiß", value: "white" },
    { label: "Dunkel", value: "dark" }
  ]
};

const imageField = (label: string) => ({
  type: "custom" as const,
  label,
  render: ({
    value,
    onChange
  }: {
    value: string;
    onChange: (value: string) => void;
  }) => <ImageField value={value ?? ""} onChange={onChange} />
});

const linkField = (label: string) => ({
  type: "custom" as const,
  label,
  render: ({
    value,
    onChange
  }: {
    value: string;
    onChange: (value: string) => void;
  }) => <LinkField value={value ?? ""} onChange={onChange} />
});

const paddingField = {
  type: "select" as const,
  label: "Abstand oben/unten",
  options: [
    { label: "Ohne", value: "none" },
    { label: "Klein", value: "small" },
    { label: "Normal", value: "normal" },
    { label: "Groß", value: "large" }
  ]
};

const spacingFields = {
  padTopPx: {
    type: "number" as const,
    label: "Abstand oben in px (leer = Auswahl)",
    min: 0,
    max: 400
  },
  padBottomPx: {
    type: "number" as const,
    label: "Abstand unten in px (leer = Auswahl)",
    min: 0,
    max: 400
  }
};

const textSizeField = {
  type: "select" as const,
  label: "Textgröße",
  options: [
    { label: "Normal", value: "normal" },
    { label: "Groß", value: "large" },
    { label: "Sehr groß", value: "xl" }
  ]
};

const videoField = {
  type: "custom" as const,
  label: "Hintergrundvideo (optional)",
  render: ({
    value,
    onChange
  }: {
    value: string;
    onChange: (value: string) => void;
  }) => <VideoField value={value ?? ""} onChange={onChange} />
};

const richText = (label: string) => ({
  type: "custom" as const,
  label,
  render: ({
    value,
    onChange
  }: {
    value: string;
    onChange: (value: string) => void;
  }) => <RichTextField value={value ?? ""} onChange={onChange} />
});

const richTextField = richText("Text");

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
        "HTMLCode",
        "Checkliste",
        "Statistiken",
        "FAQ",
        "Abstand"
      ]
    },
    dynamisch: {
      title: "Funktionen",
      components: [
        "Leistungen",
        "Artikel",
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
        eyebrow: { type: "text", label: "Badge-Text", contentEditable: true },
        title: richText("Überschrift (formatierbar)"),
        subtitle: richText("Untertitel (formatierbar)"),
        image: imageField("Hintergrundbild (auch Video-Vorschau)"),
        video: videoField,
        height: {
          type: "select",
          label: "Höhe",
          options: [
            { label: "Vollbild", value: "full" },
            { label: "Groß", value: "large" },
            { label: "Mittel", value: "medium" }
          ]
        },
        titleSize: {
          type: "select",
          label: "Überschriftgröße",
          options: [
            { label: "Normal", value: "normal" },
            { label: "Sehr groß", value: "large" }
          ]
        },
        primaryLabel: { type: "text", label: "Button 1: Text", contentEditable: true },
        primaryHref: linkField("Button 1: Link"),
        secondaryLabel: { type: "text", label: "Button 2: Text", contentEditable: true },
        secondaryHref: linkField("Button 2: Link")
      },
      defaultProps: {
        eyebrow: "",
        title: "Überschrift",
        subtitle: "",
        image: "",
        video: "",
        height: "large",
        titleSize: "normal",
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
        eyebrow: { type: "text", label: "Badge-Text", contentEditable: true },
        title: richText("Überschrift (formatierbar)"),
        description: richText("Beschreibung (formatierbar)"),
        image: imageField("Hintergrundbild")
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
        eyebrow: { type: "text", label: "Badge-Text", contentEditable: true },
        title: richText("Überschrift (formatierbar)"),
        description: richText("Beschreibung (formatierbar)"),
        theme: themeField,
        align: {
          type: "radio",
          label: "Ausrichtung",
          options: [
            { label: "Links", value: "left" },
            { label: "Zentriert", value: "center" }
          ]
        },
        size: {
          type: "select",
          label: "Überschriftgröße",
          options: [
            { label: "Normal", value: "normal" },
            { label: "Groß", value: "large" },
            { label: "Sehr groß", value: "xl" }
          ]
        },
        width: {
          type: "select",
          label: "Breite",
          options: [
            { label: "Normal", value: "normal" },
            { label: "Breit", value: "wide" },
            { label: "Volle Breite", value: "full" }
          ]
        },
        padding: paddingField,
        ...spacingFields,
        customWidth: {
          type: "number",
          label: "Eigene Breite in px (leer = Auswahl oben)",
          min: 200,
          max: 1600
        },
        customFontSize: {
          type: "number",
          label: "Eigene Überschriftgröße in px (leer = Auswahl oben)",
          min: 16,
          max: 120
        }
      },
      defaultProps: {
        eyebrow: "",
        title: "Überschrift",
        description: "",
        theme: "light",
        align: "left",
        size: "normal",
        width: "normal",
        padding: "small"
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
        },
        size: textSizeField,
        padding: paddingField,
        ...spacingFields,
        customWidth: {
          type: "number",
          label: "Eigene Breite in px (leer = Auswahl oben)",
          min: 200,
          max: 1600
        },
        customFontSize: {
          type: "number",
          label: "Eigene Schriftgröße in px (leer = Auswahl oben)",
          min: 10,
          max: 60
        }
      },
      defaultProps: {
        html: "<p>Ihr Text...</p>",
        theme: "white",
        width: "normal",
        size: "normal",
        padding: "normal"
      },
      render: (props) => <RichTextBlock {...(props as any)} />
    },

    BildText: {
      label: "Bild + Text",
      fields: {
        html: richTextField,
        image: imageField("Bild"),
        reverse: {
          type: "radio",
          label: "Bildposition",
          options: [
            { label: "Rechts", value: false },
            { label: "Links", value: true }
          ]
        },
        theme: themeField,
        padding: paddingField,
        ...spacingFields
      },
      defaultProps: {
        html: "<p>Ihr Text...</p>",
        image: "",
        reverse: false,
        theme: "light",
        padding: "normal"
      },
      render: (props) => <SplitBlock {...(props as any)} />
    },

    Bild: {
      label: "Bild",
      fields: {
        image: imageField("Bild"),
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
        padding: paddingField,
        ...spacingFields,
        columns: {
          type: "select",
          label: "Spalten",
          options: [
            { label: "2", value: "2" },
            { label: "3", value: "3" },
            { label: "4", value: "4" },
            { label: "5", value: "5" },
            { label: "6", value: "6" }
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
            text: richText("Text (formatierbar)"),
            image: imageField("Bild"),
            href: linkField("Link (optional)")
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
        padding: "normal",
        columns: "3",
        style: "plain",
        items: []
      },
      render: (props) => <CardsBlock {...(props as any)} />
    },

    HTMLCode: {
      label: "HTML (eigener Code)",
      fields: {
        html: {
          type: "textarea",
          label: "HTML-Code"
        },
        theme: themeField,
        ...spacingFields
      },
      defaultProps: {
        html: "<p>Eigener <strong>HTML</strong>-Inhalt...</p>",
        theme: "white"
      },
      render: (props) => <HtmlBlock {...(props as any)} />
    },

    Checkliste: {
      label: "Checkliste",
      fields: {
        theme: themeField,
        padding: paddingField,
        ...spacingFields,
        items: {
          type: "array",
          label: "Punkte",
          getItemSummary: (item: { text?: string }) =>
            item.text || "Punkt",
          arrayFields: { text: { type: "textarea", label: "Text" } },
          defaultItemProps: { text: "" }
        }
      },
      defaultProps: { theme: "white", padding: "small", items: [] },
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

    Leistungen: {
      label: "Leistungs-Raster",
      fields: {
        ctaLabel: { type: "text", label: "Button-Text auf den Karten" }
      },
      defaultProps: { ctaLabel: "Mehr erfahren" },
      render: (props) => <LeistungenBlock {...(props as any)} />
    },

    Artikel: {
      label: "Artikel (Wissenszentrum)",
      fields: {},
      render: () => <ArtikelBlock />
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
        eyebrow: { type: "text", label: "Badge-Text", contentEditable: true },
        title: { type: "text", label: "Überschrift", contentEditable: true }
      },
      defaultProps: { eyebrow: "Referenzen", title: "Was unsere Kunden sagen" },
      render: (props) => <TestimonialsBlock {...(props as any)} />
    },

    Bewerbungsformular: {
      label: "Bewerbungsformular",
      fields: {
        title: { type: "text", label: "Überschrift", contentEditable: true },
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
      fields: { title: { type: "text", label: "Überschrift", contentEditable: true } },
      defaultProps: { title: "Schreiben Sie uns" },
      render: (props) => <ContactFormBlock {...(props as any)} />
    },

    CTABanner: {
      label: "CTA-Banner (dunkel)",
      fields: {
        title: richText("Überschrift (formatierbar)"),
        description: richText("Beschreibung (formatierbar)"),
        primaryLabel: { type: "text", label: "Button 1: Text", contentEditable: true },
        primaryHref: linkField("Button 1: Link"),
        secondaryLabel: { type: "text", label: "Button 2: Text (Telefon)" },
        secondaryHref: linkField("Button 2: Link")
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
