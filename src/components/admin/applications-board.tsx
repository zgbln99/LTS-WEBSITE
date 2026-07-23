"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Paperclip, RotateCcw, Search, X } from "lucide-react";
import { ApplicationStatus } from "@prisma/client";
import { applicationStatusLabels } from "@/components/admin/admin-ui";
import { updateApplicationStatus } from "@/server/actions/admin";
import { Input } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export interface ApplicationCard {
  id: string;
  name: string;
  meta: string;
  dateLabel: string;
  status: ApplicationStatus;
  files: number;
  isNew?: boolean;
  forwardedLabel?: string;
}

const statusBadge: Record<ApplicationStatus, string> = {
  NEW: "bg-accent-500/10 text-accent-600",
  REVIEWED: "bg-blue-500/10 text-blue-600",
  INTERVIEW: "bg-violet-500/10 text-violet-600",
  REJECTED: "bg-mist-100 text-mist-500",
  HIRED: "bg-mint-400/15 text-mint-600"
};

// Filter: "alle" = aktive Pipeline (ohne Archiv), sonst nach Status.
type FilterKey = "alle" | ApplicationStatus;
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "alle", label: "Alle" },
  { key: "NEW", label: "Neu" },
  { key: "REVIEWED", label: applicationStatusLabels.REVIEWED },
  { key: "INTERVIEW", label: applicationStatusLabels.INTERVIEW },
  { key: "HIRED", label: applicationStatusLabels.HIRED },
  { key: "REJECTED", label: "Archiv" }
];

// Ein-Klick-Statuswechsel (versendet KEINE E-Mail).
function QuickStatus({
  id,
  status,
  title,
  children
}: {
  id: string;
  status: ApplicationStatus;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <form action={updateApplicationStatus} className="inline">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        title={title}
        aria-label={title}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-mist-400 hover:bg-red-50 hover:text-red-600"
      >
        {children}
      </button>
    </form>
  );
}

export function ApplicationsBoard({ items }: { items: ApplicationCard[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("alle");

  const counts = useMemo(() => {
    const map: Record<string, number> = { alle: 0 };
    for (const item of items) {
      if (item.status !== "REJECTED") map.alle += 1;
      map[item.status] = (map[item.status] ?? 0) + 1;
    }
    return map;
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (filter === "alle" ? item.status === "REJECTED" : item.status !== filter) {
        return false;
      }
      if (q && !`${item.name} ${item.meta}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [items, query, filter]);

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setFilter(option.key)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              option.key === filter
                ? "bg-night-950 text-white"
                : "bg-white text-night-900 shadow-card hover:bg-mist-100"
            )}
          >
            {option.label}
            <span
              className={cn(
                "ml-1.5 text-xs",
                option.key === filter ? "text-white/70" : "text-mist-400"
              )}
            >
              {counts[option.key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Suche */}
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-400" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Name, Quelle oder Führerscheinklasse"
          className="pl-11"
          aria-label="Bewerbungen durchsuchen"
        />
      </div>

      {/* Liste (neueste zuerst) */}
      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-mist-200 px-4 py-10 text-center text-sm text-mist-400">
          Keine Bewerbungen in dieser Ansicht.
        </p>
      ) : (
        <div className="divide-y divide-mist-100 overflow-hidden rounded-2xl bg-white shadow-card">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 transition-colors hover:bg-mist-50"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/bewerbungen/${item.id}`}
                    className="truncate font-semibold text-night-900 hover:text-accent-600"
                  >
                    {item.name}
                  </Link>
                  {item.isNew ? (
                    <span className="shrink-0 rounded-full bg-accent-500 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      Neu
                    </span>
                  ) : null}
                </div>
                {item.meta ? (
                  <p className="truncate text-xs text-mist-500">{item.meta}</p>
                ) : null}
              </div>

              <div className="text-xs text-mist-400">
                <div>Eingegangen: {item.dateLabel}</div>
                {item.forwardedLabel ? (
                  <div className="font-medium text-blue-600">
                    Weitergeleitet: {item.forwardedLabel}
                  </div>
                ) : null}
              </div>

              {item.files > 0 ? (
                <span className="flex items-center gap-1 text-xs text-mist-400">
                  <Paperclip className="h-3.5 w-3.5" />
                  {item.files}
                </span>
              ) : null}

              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-semibold",
                  statusBadge[item.status]
                )}
              >
                {applicationStatusLabels[item.status]}
              </span>

              {item.status === "REJECTED" ? (
                <QuickStatus id={item.id} status="NEW" title="Aus dem Archiv holen">
                  <RotateCcw className="h-4 w-4" />
                </QuickStatus>
              ) : (
                <QuickStatus
                  id={item.id}
                  status="REJECTED"
                  title="Ablehnen (ins Archiv)"
                >
                  <X className="h-4 w-4" />
                </QuickStatus>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
