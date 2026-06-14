"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Paperclip, Search } from "lucide-react";
import { ApplicationStatus } from "@prisma/client";
import { applicationStatusLabels } from "@/components/admin/admin-ui";
import { Input } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export interface ApplicationCard {
  id: string;
  name: string;
  meta: string;
  dateLabel: string;
  status: ApplicationStatus;
  files: number;
}

const columnAccents: Record<ApplicationStatus, string> = {
  NEW: "border-t-accent-500",
  REVIEWED: "border-t-blue-500",
  INTERVIEW: "border-t-violet-500",
  REJECTED: "border-t-red-400",
  HIRED: "border-t-mint-400"
};

export function ApplicationsBoard({ items }: { items: ApplicationCard[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      `${item.name} ${item.meta}`.toLowerCase().includes(q)
    );
  }, [items, query]);

  const columns = Object.values(ApplicationStatus).map((status) => ({
    status,
    items: filtered.filter((item) => item.status === status)
  }));

  return (
    <div className="space-y-4">
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {columns.map((column) => (
          <div
            key={column.status}
            className={cn(
              "rounded-2xl border-t-4 bg-white p-4 shadow-card",
              columnAccents[column.status]
            )}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-sm font-bold text-night-900">
                {applicationStatusLabels[column.status]}
              </h2>
              <span className="rounded-full bg-mist-100 px-2 py-0.5 text-xs font-semibold text-mist-500">
                {column.items.length}
              </span>
            </div>
            <div className="space-y-2.5">
              {column.items.length === 0 ? (
                <p className="rounded-xl border border-dashed border-mist-200 px-3 py-5 text-center text-xs text-mist-400">
                  Keine Einträge
                </p>
              ) : (
                column.items.map((item) => (
                  <Link
                    key={item.id}
                    href={`/admin/bewerbungen/${item.id}`}
                    className="block rounded-xl border border-mist-100 bg-mist-50 p-3 transition-colors hover:border-accent-500/40 hover:bg-white"
                  >
                    <p className="text-sm font-semibold text-night-900">
                      {item.name}
                    </p>
                    {item.meta ? (
                      <p className="mt-0.5 text-xs text-mist-500">{item.meta}</p>
                    ) : null}
                    <div className="mt-2 flex items-center justify-between text-xs text-mist-400">
                      <span>{item.dateLabel}</span>
                      {item.files > 0 ? (
                        <span className="flex items-center gap-1">
                          <Paperclip className="h-3 w-3" />
                          {item.files}
                        </span>
                      ) : null}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
