"use client";

import { useState, useTransition } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Field, Input } from "@/components/ui/field";
import { lookupJobLocationAction } from "@/server/actions/content";

interface JobLocationFieldsProps {
  initialCity?: string;
  initialRegion?: string;
  initialPostalCode?: string;
  initialCountry?: string;
}

export function JobLocationFields({
  initialCity = "",
  initialRegion = "",
  initialPostalCode = "",
  initialCountry = "Deutschland"
}: JobLocationFieldsProps) {
  const [city, setCity] = useState(initialCity);
  const [region, setRegion] = useState(initialRegion);
  const [postalCode, setPostalCode] = useState(initialPostalCode);
  const [country, setCountry] = useState(initialCountry);
  const [pending, startTransition] = useTransition();
  const [hint, setHint] = useState<string | null>(null);

  const autofill = () => {
    if (!city.trim()) {
      setHint("Bitte zuerst einen Ort eingeben.");
      return;
    }
    setHint(null);
    startTransition(async () => {
      const result = await lookupJobLocationAction(city);
      if (!result) {
        setHint("Standort konnte nicht ermittelt werden (KI nicht konfiguriert?).");
        return;
      }
      if (result.postalCode) setPostalCode(result.postalCode);
      if (result.region) setRegion(result.region);
      if (result.country) setCountry(result.country);
      setHint("Postleitzahl, Bundesland und Land automatisch ergänzt.");
    });
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Ort / Stadt" htmlFor="job-location" required>
          <div className="flex gap-2">
            <Input
              id="job-location"
              name="locationCity"
              required
              minLength={2}
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="Schönefeld (Berlin)"
            />
            <button
              type="button"
              onClick={autofill}
              disabled={pending}
              title="Postleitzahl und Bundesland per KI ergänzen"
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-night-950 px-3 text-xs font-semibold text-white hover:bg-night-800 disabled:opacity-50"
            >
              {pending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              KI
            </button>
          </div>
        </Field>
        <Field label="Postleitzahl" htmlFor="job-postal">
          <Input
            id="job-postal"
            name="postalCode"
            value={postalCode}
            onChange={(event) => setPostalCode(event.target.value)}
            placeholder="12529"
          />
        </Field>
        <Field label="Bundesland" htmlFor="job-region">
          <Input
            id="job-region"
            name="locationRegion"
            value={region}
            onChange={(event) => setRegion(event.target.value)}
            placeholder="Brandenburg"
          />
        </Field>
        <Field label="Land" htmlFor="job-country">
          <Input
            id="job-country"
            name="country"
            value={country}
            onChange={(event) => setCountry(event.target.value)}
          />
        </Field>
      </div>
      {hint ? <p className="text-xs text-mist-500">{hint}</p> : null}
    </div>
  );
}
