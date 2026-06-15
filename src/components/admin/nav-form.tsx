"use client";

import { useState, useTransition } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/field";
import { resetNavAction, saveNavAction } from "@/server/actions/settings";
import type { NavLink } from "@/server/site-settings";

interface NavFormProps {
  locale: string;
  initialItems: NavLink[];
  hasCustom: boolean;
}

export function NavForm({ locale, initialItems, hasCustom }: NavFormProps) {
  const [items, setItems] = useState<NavLink[]>(initialItems);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const update = (index: number, patch: Partial<NavLink>) =>
    setItems((current) =>
      current.map((entry, i) => (i === index ? { ...entry, ...patch } : entry))
    );

  const move = (index: number, direction: -1 | 1) =>
    setItems((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const save = () =>
    startTransition(async () => {
      const result = await saveNavAction(locale, items);
      setStatus(
        result.ok ? "Gespeichert. Menü ist online." : "Fehler beim Speichern."
      );
      setTimeout(() => setStatus(null), 4000);
    });

  const reset = () =>
    startTransition(async () => {
      if (!window.confirm("Menü dieser Sprache auf Standard zurücksetzen?")) {
        return;
      }
      await resetNavAction(locale);
      window.location.reload();
    });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
        <h2 className="mb-1 font-display text-base font-bold text-night-900">
          Kopfmenü ({locale.toUpperCase()})
        </h2>
        <p className="mb-4 text-xs text-mist-400">
          Reihenfolge mit den Pfeilen ändern. Pfad relativ (z.B. /de/leistungen)
          oder vollständige URL.
        </p>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="text-mist-400 hover:text-night-900 disabled:opacity-30"
                  title="Nach oben"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1}
                  className="text-mist-400 hover:text-night-900 disabled:opacity-30"
                  title="Nach unten"
                >
                  ▼
                </button>
              </div>
              <GripVertical className="h-4 w-4 shrink-0 text-mist-300" />
              <Input
                value={item.label}
                placeholder="Beschriftung"
                onChange={(event) => update(index, { label: event.target.value })}
              />
              <Input
                value={item.href}
                placeholder="/de/leistungen oder https://..."
                onChange={(event) => update(index, { href: event.target.value })}
              />
              <button
                type="button"
                onClick={() =>
                  setItems((current) => current.filter((_, i) => i !== index))
                }
                className="shrink-0 rounded-lg p-2.5 text-mist-400 hover:bg-red-50 hover:text-red-600"
                title="Punkt entfernen"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setItems((current) => [...current, { label: "", href: "" }])
            }
            className="flex items-center gap-1.5 rounded-full border border-mist-300 px-4 py-2 text-xs font-medium text-night-900 hover:border-night-900"
          >
            <Plus className="h-3.5 w-3.5" />
            Menüpunkt hinzufügen
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="rounded-full bg-accent-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-600 disabled:opacity-50"
        >
          Speichern und veröffentlichen
        </button>
        {hasCustom ? (
          <button
            type="button"
            onClick={reset}
            disabled={pending}
            className="rounded-full border border-mist-300 px-5 py-2.5 text-sm font-medium text-night-900 hover:border-night-900 disabled:opacity-50"
          >
            Auf Standard zurücksetzen
          </button>
        ) : null}
        {status ? (
          <span className="text-sm font-medium text-mint-500">{status}</span>
        ) : null}
      </div>
    </div>
  );
}
