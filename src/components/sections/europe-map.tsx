"use client";

import { useEffect, useRef } from "react";
import { company } from "@/data/company";
import "mapbox-gl/dist/mapbox-gl.css";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Standorte kommen zentral aus src/data/company.ts
const locations = company.locations.map((location) => ({
  city: location.city,
  lngLat: location.lngLat,
  hq: location.isHeadquarters
}));

export function EuropeMap() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!TOKEN || !containerRef.current) return;

    let map: import("mapbox-gl").Map | undefined;
    let cancelled = false;

    import("mapbox-gl").then((mapboxgl) => {
      if (cancelled || !containerRef.current) return;

      mapboxgl.default.accessToken = TOKEN;
      map = new mapboxgl.default.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [11.5, 51.0],
        zoom: 4.4,
        minZoom: 3,
        maxZoom: 9,
        attributionControl: true,
        cooperativeGestures: true
      });

      map.addControl(
        new mapboxgl.default.NavigationControl({ showCompass: false }),
        "top-right"
      );

      for (const location of locations) {
        const el = document.createElement("div");
        el.style.cssText = `width:${location.hq ? 18 : 12}px;height:${location.hq ? 18 : 12}px;border-radius:9999px;background:#ff4d1c;border:2px solid #ffffff;box-shadow:0 0 0 4px rgb(255 77 28 / 0.3);cursor:pointer;`;

        new mapboxgl.default.Marker({ element: el })
          .setLngLat(location.lngLat)
          .setPopup(
            new mapboxgl.default.Popup({ offset: 14, closeButton: false }).setHTML(
              `<strong style="font-size:13px">${location.city}</strong>`
            )
          )
          .addTo(map!);
      }
    });

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, []);

  if (!TOKEN) return null;

  return (
    <div
      ref={containerRef}
      className="h-80 w-full overflow-hidden rounded-3xl sm:h-[28rem]"
      aria-label="Karte der LTS Logistik Standorte"
    />
  );
}
