"use client";

import { createContext, useContext } from "react";
import type { BoardJob } from "@/components/career/job-board";
import type { MapMarker } from "@/components/sections/europe-map";

export interface BuilderTestimonial {
  quote: string;
  name: string;
  role: string;
}

export interface BuilderDynamicData {
  locale: string;
  /** true im Admin-Editor: dynamische Blöcke zeigen eine Vorschau */
  isEditor: boolean;
  jobs: BoardJob[];
  cities: MapMarker[];
  testimonials: BuilderTestimonial[];
  /** Linkziele für das Link-Feld im Editor (lokalisierte Seitenpfade) */
  links?: { label: string; href: string }[];
}

const defaultValue: BuilderDynamicData = {
  locale: "de",
  isEditor: true,
  jobs: [],
  cities: [],
  testimonials: []
};

const DynamicDataContext = createContext<BuilderDynamicData>(defaultValue);

export function DynamicDataProvider({
  value,
  children
}: {
  value: BuilderDynamicData;
  children: React.ReactNode;
}) {
  return (
    <DynamicDataContext.Provider value={value}>
      {children}
    </DynamicDataContext.Provider>
  );
}

export function useDynamicData() {
  return useContext(DynamicDataContext);
}
