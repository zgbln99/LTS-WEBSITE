"use client";

import { Render, type Data } from "@measured/puck";
import { builderConfig } from "@/builder/config";
import {
  DynamicDataProvider,
  type BuilderDynamicData
} from "@/builder/dynamic-data";

// Rendert veröffentlichte Page-Builder-Seiten auf der öffentlichen Website.
export function BuilderRenderer({
  data,
  dynamic
}: {
  data: Data;
  dynamic: BuilderDynamicData;
}) {
  return (
    <DynamicDataProvider value={dynamic}>
      <Render config={builderConfig} data={data} />
    </DynamicDataProvider>
  );
}
