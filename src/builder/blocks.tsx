"use client";

// Bausteine des Page-Builders. Alle Blöcke nutzen das Design-System der
// Website, damit bearbeitete Seiten exakt wie der Rest aussehen.

import Image from "next/image";
import { ArrowRight, Check, MapPin, Phone, Quote } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { JobBoard } from "@/components/career/job-board";
import { CallbackPanel } from "@/components/career/callback-form";
import { ApplicationForm } from "@/components/forms/application-form";
import { ContactForm } from "@/components/forms/contact-form";
import { EuropeMap } from "@/components/sections/europe-map";
import { useDynamicData } from "@/builder/dynamic-data";
import { getServices } from "@/data/services";
import { getPathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import type { jobCategoryKeys } from "@/lib/forms";

export type Theme = "light" | "white" | "dark";

const sectionTheme: Record<Theme, string> = {
  light: "bg-mist-50",
  white: "bg-white",
  dark: "bg-night-950"
};

export type Padding = "none" | "small" | "normal" | "large";

const sectionPadding: Record<Padding, string> = {
  none: "py-0",
  small: "py-8 sm:py-10",
  normal: "py-14 sm:py-20",
  large: "py-24 sm:py-32"
};

function Section({
  theme,
  padding = "normal",
  padTopPx,
  padBottomPx,
  children,
  className
}: {
  theme: Theme;
  padding?: Padding;
  /** manueller Abstand oben/unten in px (überschreibt die Auswahl) */
  padTopPx?: number;
  padBottomPx?: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      style={{
        paddingTop: padTopPx !== undefined && padTopPx !== null && `${padTopPx}px` || undefined,
        paddingBottom: padBottomPx !== undefined && padBottomPx !== null && `${padBottomPx}px` || undefined
      }}
      className={cn(sectionTheme[theme], sectionPadding[padding], className)}
    >
      <Container>{children}</Container>
    </section>
  );
}

export interface SpacingProps {
  padTopPx?: number;
  padBottomPx?: number;
}

export type TextSize = "normal" | "large" | "xl";

const textSizes: Record<TextSize, string> = {
  normal: "text-base sm:text-lg",
  large: "text-lg sm:text-xl",
  xl: "text-xl leading-relaxed sm:text-2xl"
};

export function RichTextContent({
  html,
  dark,
  className
}: {
  html: string;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rt-prose max-w-none leading-relaxed",
        dark ? "text-mist-200" : "text-night-800",
        className ?? "text-base sm:text-lg"
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

export interface HeroProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string;
  /** Hintergrundvideo (MP4/WebM), Bild dient als Poster/Fallback */
  video?: string;
  titleSize?: "normal" | "large";
  height: "full" | "large" | "medium";
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
}

export function HeroBlock(props: HeroProps) {
  const heights = {
    full: "min-h-[92svh]",
    large: "min-h-[60svh]",
    medium: "min-h-[40svh]"
  };
  return (
    <section
      className={cn(
        "relative flex items-end overflow-hidden bg-night-950 pb-16 pt-32 sm:pb-24",
        heights[props.height]
      )}
    >
      {props.video ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={props.image || undefined}
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        >
          <source src={props.video} />
        </video>
      ) : props.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <Image
          src={props.image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-50"
        />
      ) : null}
      {props.video || props.image ? (
        <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/60 to-night-950/30" />
      ) : null}
      <Container className="relative">
        {props.eyebrow ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-mint-400" />
            {props.eyebrow}
          </span>
        ) : null}
        <h1
          className={cn(
            "mt-6 max-w-5xl font-extrabold leading-[1.05] text-white",
            (props.titleSize ?? "normal") === "large"
              ? "text-5xl sm:text-7xl lg:text-8xl"
              : "text-4xl sm:text-6xl lg:text-7xl"
          )}
          dangerouslySetInnerHTML={{ __html: props.title }}
        />
        {props.subtitle ? (
          <div
            className="rt-prose mt-6 max-w-4xl text-base leading-relaxed text-mist-200 sm:text-lg lg:text-xl"
            dangerouslySetInnerHTML={{ __html: props.subtitle }}
          />
        ) : null}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          {props.primaryLabel ? (
            <Button asChild size="lg">
              <a href={props.primaryHref || "#"}>
                {props.primaryLabel}
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          ) : null}
          {props.secondaryLabel ? (
            <Button asChild size="lg" variant="outline-light">
              <a href={props.secondaryHref || "#"}>{props.secondaryLabel}</a>
            </Button>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Seitenkopf (Unterseiten)
// ---------------------------------------------------------------------------

export interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
}

export function PageHeaderBlock(props: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden bg-night-950 pb-16 pt-32 sm:pb-24 sm:pt-44">
      {props.image ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <Image
            src={props.image}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/70 to-night-950/40" />
        </>
      ) : null}
      <Container className="relative">
        {props.eyebrow ? (
          <span className="inline-flex items-center rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent-400 backdrop-blur-sm">
            {props.eyebrow}
          </span>
        ) : null}
        <h1
          className="mt-5 max-w-5xl text-4xl font-extrabold leading-[1.08] text-white sm:text-5xl lg:text-6xl"
          dangerouslySetInnerHTML={{ __html: props.title }}
        />
        {props.description ? (
          <div
            className="rt-prose mt-5 max-w-4xl text-base leading-relaxed text-mist-300 sm:text-lg"
            dangerouslySetInnerHTML={{ __html: props.description }}
          />
        ) : null}
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Überschrift + Fließtext
// ---------------------------------------------------------------------------

export interface HeadingProps {
  eyebrow: string;
  title: string;
  description: string;
  theme: Theme;
  align: "left" | "center";
  size?: "normal" | "large" | "xl";
  width?: "normal" | "wide" | "full";
  padding?: Padding;
  customWidth?: number;
  customFontSize?: number;
}

export interface HeadingPropsWithSpacing extends HeadingProps, SpacingProps {}

const headingSizes = {
  normal: "text-3xl sm:text-4xl lg:text-5xl",
  large: "text-4xl sm:text-5xl lg:text-6xl",
  xl: "text-5xl sm:text-6xl lg:text-7xl"
};

const headingWidths = {
  normal: "max-w-4xl",
  wide: "max-w-6xl",
  full: "max-w-none"
};

export function HeadingBlock(props: HeadingPropsWithSpacing) {
  const dark = props.theme === "dark";
  return (
    <Section
      theme={props.theme}
      padding={props.padding ?? "small"}
      padTopPx={props.padTopPx}
      padBottomPx={props.padBottomPx}
      className="pb-4 sm:pb-6"
    >
      <div
        style={{
          maxWidth: props.customWidth ? `${props.customWidth}px` : undefined
        }}
        className={cn(
          !props.customWidth && headingWidths[props.width ?? "normal"],
          props.align === "center" && "mx-auto text-center"
        )}
      >
        {props.eyebrow ? (
          <span
            className={cn(
              "mb-4 inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider",
              dark
                ? "bg-white/10 text-accent-400"
                : "bg-accent-500/10 text-accent-600"
            )}
          >
            {props.eyebrow}
          </span>
        ) : null}
        <h2
          style={{
            fontSize: props.customFontSize
              ? `${props.customFontSize}px`
              : undefined,
            lineHeight: props.customFontSize ? 1.15 : undefined
          }}
          className={cn(
            "font-bold",
            !props.customFontSize && headingSizes[props.size ?? "normal"],
            dark ? "text-white" : "text-night-900"
          )}
          dangerouslySetInnerHTML={{ __html: props.title }}
        />
        {props.description ? (
          <div
            className={cn(
              "rt-prose mt-4 leading-relaxed",
              textSizes[
                (props.size ?? "normal") === "normal" ? "normal" : "large"
              ],
              dark ? "text-mist-300" : "text-mist-500"
            )}
            dangerouslySetInnerHTML={{ __html: props.description }}
          />
        ) : null}
      </div>
    </Section>
  );
}

export interface RichTextProps extends SpacingProps {
  html: string;
  theme: Theme;
  width: "narrow" | "normal" | "wide";
  size?: TextSize;
  padding?: Padding;
  /** manuelle Breite in px (überschreibt die Auswahl) */
  customWidth?: number;
  /** manuelle Schriftgröße in px */
  customFontSize?: number;
}

export function RichTextBlock(props: RichTextProps) {
  const widths = {
    narrow: "max-w-3xl",
    normal: "max-w-4xl",
    wide: "max-w-none"
  };
  return (
    <Section
      theme={props.theme}
      padding={props.padding ?? "normal"}
      padTopPx={props.padTopPx}
      padBottomPx={props.padBottomPx}
    >
      <div
        style={{
          maxWidth: props.customWidth ? `${props.customWidth}px` : undefined,
          fontSize: props.customFontSize
            ? `${props.customFontSize}px`
            : undefined
        }}
        className={cn(!props.customWidth && widths[props.width])}
      >
        <RichTextContent
          html={props.html}
          dark={props.theme === "dark"}
          className={cn(
            "max-w-none",
            !props.customFontSize && textSizes[props.size ?? "normal"]
          )}
        />
      </div>
    </Section>
  );
}

// ---------------------------------------------------------------------------
// Statistiken
// ---------------------------------------------------------------------------

export interface StatsProps {
  items: { value: string; label: string }[];
}

export function StatsBlock(props: StatsProps) {
  return (
    <section className="bg-night-950 py-14 sm:py-20">
      <Container>
        <dl
          className={cn(
            "grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-white/10",
            props.items.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
          )}
        >
          {props.items.map((stat, index) => (
            <div key={index} className="bg-night-900 p-6 sm:p-8">
              <dd className="font-display text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
                {stat.value}
              </dd>
              <dt className="mt-2 text-sm text-mist-400">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Karten-Raster
// ---------------------------------------------------------------------------

export interface CardsProps extends SpacingProps {
  theme: Theme;
  padding?: Padding;
  columns: "2" | "3" | "4";
  style: "icon" | "photo" | "plain";
  items: {
    title: string;
    specs: string;
    text: string;
    image: string;
    href: string;
  }[];
}

export function CardsBlock(props: CardsProps) {
  const dark = props.theme === "dark";
  const cols = {
    "2": "sm:grid-cols-2",
    "3": "sm:grid-cols-2 lg:grid-cols-3",
    "4": "sm:grid-cols-2 lg:grid-cols-4"
  };
  return (
    <Section
      theme={props.theme}
      padding={props.padding ?? "normal"}
      padTopPx={props.padTopPx}
      padBottomPx={props.padBottomPx}
    >
      <div className={cn("grid gap-4", cols[props.columns])}>
        {props.items.map((item, index) => {
          const inner = (
            <div
              className={cn(
                "flex h-full flex-col overflow-hidden rounded-3xl transition-all duration-300",
                dark
                  ? "bg-night-900"
                  : "border border-mist-200 bg-white shadow-card",
                item.href && "hover:-translate-y-1 hover:shadow-card-hover"
              )}
            >
              {props.style === "photo" && item.image ? (
                <div className="relative h-44 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-night-950/60 to-transparent" />
                  <h3 className="absolute bottom-4 left-5 font-display text-xl font-bold text-white">
                    {item.title}
                  </h3>
                </div>
              ) : null}
              <div className="flex flex-1 flex-col p-6">
                {props.style !== "photo" ? (
                  <h3
                    className={cn(
                      "font-display text-lg font-bold",
                      dark ? "text-white" : "text-night-900"
                    )}
                  >
                    {item.title}
                  </h3>
                ) : null}
                {item.specs ? (
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-accent-600">
                    {item.specs}
                  </p>
                ) : null}
                {item.text ? (
                  <div
                    className={cn(
                      "rt-prose mt-3 flex-1 text-sm leading-relaxed",
                      dark ? "text-mist-400" : "text-mist-500"
                    )}
                    dangerouslySetInnerHTML={{ __html: item.text }}
                  />
                ) : null}
              </div>
            </div>
          );
          return item.href ? (
            <a key={index} href={item.href}>
              {inner}
            </a>
          ) : (
            <div key={index}>{inner}</div>
          );
        })}
      </div>
    </Section>
  );
}

// ---------------------------------------------------------------------------
// Bild + Text
// ---------------------------------------------------------------------------

export interface SplitProps extends SpacingProps {
  html: string;
  image: string;
  reverse: boolean;
  theme: Theme;
  padding?: Padding;
}

export function SplitBlock(props: SplitProps) {
  return (
    <Section
      theme={props.theme}
      padding={props.padding ?? "normal"}
      padTopPx={props.padTopPx}
      padBottomPx={props.padBottomPx}
    >
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div className={cn(props.reverse && "lg:order-2")}>
          <RichTextContent html={props.html} dark={props.theme === "dark"} />
        </div>
        <div
          className={cn(
            "relative aspect-[4/3] overflow-hidden rounded-3xl shadow-card",
            props.reverse && "lg:order-1"
          )}
        >
          <Image
            src={props.image}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </div>
    </Section>
  );
}

export interface ImageProps {
  image: string;
  alt: string;
  height: "small" | "medium" | "large";
}

export function ImageBlock(props: ImageProps) {
  const heights = { small: "h-56", medium: "h-80", large: "h-[32rem]" };
  return (
    <Section theme="white" className="py-8 sm:py-10">
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-3xl",
          heights[props.height]
        )}
      >
        <Image
          src={props.image}
          alt={props.alt}
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
    </Section>
  );
}

// ---------------------------------------------------------------------------
// CTA-Banner
// ---------------------------------------------------------------------------

export interface CtaProps {
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
}

export function CtaBlock(props: CtaProps) {
  return (
    <Section theme="light">
      <div className="relative overflow-hidden rounded-[2rem] bg-night-950 px-6 py-14 sm:px-12 sm:py-20 lg:px-20">
        <div
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent-500/20 blur-3xl"
          aria-hidden
        />
        <div className="relative max-w-3xl">
          <h2
            className="font-display text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl"
            dangerouslySetInnerHTML={{ __html: props.title }}
          />
          {props.description ? (
            <div
              className="rt-prose mt-4 text-base leading-relaxed text-mist-300 sm:text-lg"
              dangerouslySetInnerHTML={{ __html: props.description }}
            />
          ) : null}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {props.primaryLabel ? (
              <Button asChild size="lg">
                <a href={props.primaryHref || "#"}>
                  {props.primaryLabel}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            ) : null}
            {props.secondaryLabel ? (
              <Button asChild size="lg" variant="outline-light">
                <a href={props.secondaryHref || "#"}>
                  <Phone className="h-4 w-4" />
                  {props.secondaryLabel}
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </Section>
  );
}

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------

export interface FaqProps {
  items: { question: string; answer: string }[];
}

export function FaqBlock(props: FaqProps) {
  return (
    <Section theme="light">
      <div className="mx-auto max-w-3xl">
        <Accordion type="single" collapsible className="space-y-3">
          {props.items.map((faq, index) => (
            <AccordionItem key={index} value={`faq-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  );
}

export function SpacerBlock({ size }: { size: "small" | "medium" | "large" }) {
  const sizes = { small: "h-8", medium: "h-16", large: "h-28" };
  return <div className={sizes[size]} />;
}

// ---------------------------------------------------------------------------
// Dynamische Blöcke (Daten aus der Datenbank)
// ---------------------------------------------------------------------------

export function JobBoardBlock() {
  const { jobs, isEditor } = useDynamicData();
  if (isEditor && jobs.length === 0) {
    return (
      <Section theme="light">
        <div className="rounded-3xl border-2 border-dashed border-mist-300 p-10 text-center text-sm text-mist-500">
          Jobbörse: zeigt automatisch alle veröffentlichten Stellenanzeigen
          mit Suche und Filtern.
        </div>
      </Section>
    );
  }
  return (
    <Section theme="light">
      <JobBoard jobs={jobs} />
    </Section>
  );
}

export function CallbackBlock() {
  return (
    <Section theme="light" className="py-10 sm:py-14">
      <CallbackPanel />
    </Section>
  );
}

export function MapBlock({ height }: { height: "medium" | "large" }) {
  const { cities, isEditor } = useDynamicData();
  const heights = {
    medium: "h-[26rem] sm:h-[32rem]",
    large: "h-[30rem] sm:h-[42rem]"
  };
  if (isEditor) {
    return (
      <section className="bg-night-950 py-10">
        <Container>
          <div
            className={cn(
              "flex items-center justify-center rounded-3xl border-2 border-dashed border-white/20 text-sm text-mist-400",
              heights[height]
            )}
          >
            Karte: zeigt alle Einsatzorte aus dem Admin-Panel.
          </div>
        </Container>
      </section>
    );
  }
  return (
    <section className="bg-night-950">
      <EuropeMap
        markers={cities}
        className={cn("rounded-none", heights[height])}
      />
    </section>
  );
}

export function CityChipsBlock({ title }: { title: string }) {
  const { cities } = useDynamicData();
  return (
    <Section theme="dark" className="py-8 sm:py-10">
      <div className="rounded-3xl bg-night-900 p-5 sm:p-6">
        {title ? (
          <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-mist-400">
            {title}
          </h3>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          {(cities.length > 0
            ? cities
            : [{ city: "Berlin", lngLat: [0, 0] as [number, number] }]
          ).map((location) => (
            <span
              key={location.city}
              className="flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-sm text-white"
            >
              <MapPin className="h-3.5 w-3.5 text-accent-400" />
              {location.city}
            </span>
          ))}
        </div>
      </div>
    </Section>
  );
}

export function TestimonialsBlock({
  eyebrow,
  title
}: {
  eyebrow: string;
  title: string;
}) {
  const { testimonials } = useDynamicData();
  const items =
    testimonials.length > 0
      ? testimonials
      : [
          {
            quote: "Hier erscheinen die Referenzen aus dem Admin-Panel.",
            name: "Beispiel",
            role: "Vorschau"
          }
        ];
  return (
    <Section theme="white">
      <div className="mx-auto max-w-4xl text-center">
        {eyebrow ? (
          <span className="mb-4 inline-flex items-center rounded-full bg-accent-500/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent-600">
            {eyebrow}
          </span>
        ) : null}
        <h2 className="text-3xl font-bold text-night-900 sm:text-4xl">
          {title}
        </h2>
      </div>
      <div className="mt-12 grid gap-4 lg:grid-cols-5">
        {items[0] ? (
          <figure className="flex h-full flex-col rounded-3xl bg-night-950 p-8 sm:p-10 lg:col-span-3">
            <Quote className="h-8 w-8 text-accent-400" aria-hidden />
            <blockquote className="mt-6 flex-1 font-display text-xl font-semibold leading-snug text-white sm:text-2xl">
              {items[0].quote}
            </blockquote>
            <figcaption className="mt-8">
              <div className="font-display text-sm font-bold text-white">
                {items[0].name}
              </div>
              <div className="text-sm text-mist-400">{items[0].role}</div>
            </figcaption>
          </figure>
        ) : null}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {items.slice(1, 3).map((item, index) => (
            <figure
              key={index}
              className="flex flex-1 flex-col rounded-3xl border border-mist-200 bg-mist-50 p-6 sm:p-7"
            >
              <Quote className="h-6 w-6 text-accent-500" aria-hidden />
              <blockquote className="mt-3 flex-1 text-base leading-relaxed text-night-800">
                {item.quote}
              </blockquote>
              <figcaption className="mt-5">
                <div className="font-display text-sm font-bold text-night-900">
                  {item.name}
                </div>
                <div className="text-sm text-mist-500">{item.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </Section>
  );
}

export function ApplicationFormBlock({
  title,
  category
}: {
  title: string;
  category: string;
}) {
  return (
    <Section theme="light">
      <div className="rounded-[2rem] bg-white p-6 shadow-card sm:p-12">
        {title ? (
          <h2 className="mb-8 font-display text-3xl font-extrabold text-night-900 sm:text-4xl">
            {title}
          </h2>
        ) : null}
        <ApplicationForm
          presetCategory={
            (category || undefined) as
              | (typeof jobCategoryKeys)[number]
              | undefined
          }
        />
      </div>
    </Section>
  );
}

export function ContactFormBlock({ title }: { title: string }) {
  return (
    <Section theme="white">
      <div className="mx-auto max-w-3xl">
        {title ? (
          <h2 className="mb-8 font-display text-3xl font-extrabold text-night-900 sm:text-4xl">
            {title}
          </h2>
        ) : null}
        <div className="rounded-3xl bg-mist-50 p-6 sm:p-10">
          <ContactForm />
        </div>
      </div>
    </Section>
  );
}

export function ChecklistBlock({
  theme,
  items,
  padding,
  padTopPx,
  padBottomPx
}: {
  theme: Theme;
  items: { text: string }[];
  padding?: Padding;
} & SpacingProps) {
  const dark = theme === "dark";
  return (
    <Section
      theme={theme}
      padding={padding ?? "small"}
      padTopPx={padTopPx}
      padBottomPx={padBottomPx}
    >
      <ul className="max-w-3xl space-y-3">
        {items.map((item, index) => (
          <li
            key={index}
            className={cn(
              "flex items-start gap-3 text-base",
              dark ? "text-mist-200" : "text-night-800"
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                dark ? "bg-mint-400/15" : "bg-accent-500/10"
              )}
            >
              <Check
                className={cn(
                  "h-3.5 w-3.5",
                  dark ? "text-mint-400" : "text-accent-600"
                )}
              />
            </span>
            {item.text}
          </li>
        ))}
      </ul>
    </Section>
  );
}


// Leistungs-Raster: zeigt automatisch alle Leistungsseiten der Sprache.
export function LeistungenBlock({ ctaLabel }: { ctaLabel: string }) {
  const { locale } = useDynamicData();
  const services = getServices(locale as Locale);
  return (
    <Section theme="light">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => (
          <a
            key={service.key}
            href={getPathname({
              locale: locale as Locale,
              href: {
                pathname: "/leistungen/[slug]",
                params: { slug: service.slug }
              }
            })}
            className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
          >
            <div className="relative h-40 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <Image
                src={service.image}
                alt={service.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
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
          </a>
        ))}
      </div>
    </Section>
  );
}

// Artikel-Liste: veröffentlichte Beiträge aus dem Wissenszentrum.
export function ArtikelBlock() {
  const { articles = [], isEditor } = useDynamicData();
  if (articles.length === 0) {
    return isEditor ? (
      <Section theme="white">
        <div className="rounded-3xl border-2 border-dashed border-mist-300 p-10 text-center text-sm text-mist-500">
          Artikel: zeigt automatisch alle veröffentlichten Beiträge aus dem
          Wissenszentrum.
        </div>
      </Section>
    ) : null;
  }
  return (
    <Section theme="white">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <a
            key={article.href}
            href={article.href}
            className="group flex h-full flex-col rounded-3xl border border-mist-200 bg-mist-50 p-6 transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-card sm:p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-mist-400">
              {article.meta}
            </p>
            <h3 className="mt-3 font-display text-lg font-bold text-night-900">
              {article.title}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-mist-500">
              {article.excerpt}
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-600">
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </a>
        ))}
      </div>
    </Section>
  );
}


// Eigener HTML-Block: freier Code (serverseitig bereinigt).
export function HtmlBlock({
  html,
  theme,
  padTopPx,
  padBottomPx
}: {
  html: string;
  theme: Theme;
} & SpacingProps) {
  return (
    <Section
      theme={theme}
      padding="normal"
      padTopPx={padTopPx}
      padBottomPx={padBottomPx}
    >
      <RichTextContent html={html} dark={theme === "dark"} />
    </Section>
  );
}
