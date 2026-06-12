"use client";

import { useEffect, useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export interface MapMarker {
  city: string;
  lngLat: [number, number];
  hq?: boolean;
}

export function EuropeMap({ markers }: { markers: MapMarker[] }) {
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

      for (const marker of markers) {
        const el = document.createElement("div");
        el.style.cssText = `width:${marker.hq ? 18 : 12}px;height:${marker.hq ? 18 : 12}px;border-radius:9999px;background:#e11d24;border:2px solid #ffffff;box-shadow:0 0 0 4px rgb(225 29 36 / 0.3);cursor:pointer;`;

        new mapboxgl.default.Marker({ element: el })
          .setLngLat(marker.lngLat)
          .setPopup(
            new mapboxgl.default.Popup({ offset: 14, closeButton: false }).setHTML(
              `<strong style="font-size:13px">${marker.city}</strong>`
            )
          )
          .addTo(map!);
      }
    });

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [markers]);

  if (!TOKEN) return null;

  return (
    <div
      ref={containerRef}
      className="h-80 w-full overflow-hidden rounded-3xl sm:h-[28rem]"
      aria-label="Karte der LTS Logistik Einsatzorte"
    />
  );
}
