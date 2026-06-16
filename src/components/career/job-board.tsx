"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Search
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Input, Select } from "@/components/ui/field";

const PAGE_SIZE = 10;

export interface BoardJob {
  id: string;
  slug: string;
  title: string;
  location: string;
  country: string;
  system: string;
  salary: string;
  salaryNote: string;
  licenseCategory: string;
}

// Gängige Schreibweisen für Deutschland in den Seitensprachen,
// damit "Schönefeld, Niemcy" nicht zusätzlich "Deutschland" anzeigt.
const GERMANY_ALIASES = [
  "deutschland",
  "germany",
  "niemcy",
  "almanya",
  "німеччина",
  "nimechchyna"
];

function formatLocation(job: BoardJob) {
  const location = job.location.trim();
  if (!job.country) return location;
  const haystack = location.toLowerCase();
  if (haystack.includes(job.country.toLowerCase())) return location;
  if (
    GERMANY_ALIASES.includes(job.country.toLowerCase()) &&
    GERMANY_ALIASES.some((alias) => haystack.includes(alias))
  ) {
    return location;
  }
  return `${location}, ${job.country}`;
}

export function JobBoard({ jobs }: { jobs: BoardJob[] }) {
  const t = useTranslations("career.board");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [country, setCountry] = useState("");
  const [page, setPage] = useState(1);

  // Bei jeder Filteränderung zurück auf die erste Seite.
  useEffect(() => {
    setPage(1);
  }, [query, category, country]);

  const categories = useMemo(
    () => [...new Set(jobs.map((job) => job.licenseCategory).filter(Boolean))],
    [jobs]
  );
  const countries = useMemo(
    () => [...new Set(jobs.map((job) => job.country).filter(Boolean))],
    [jobs]
  );

  const filtered = jobs.filter((job) => {
    const haystack =
      `${job.title} ${job.location} ${job.system} ${job.licenseCategory} ${job.country}`.toLowerCase();
    if (query && !haystack.includes(query.toLowerCase())) return false;
    if (category && job.licenseCategory !== category) return false;
    if (country && job.country !== country) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  return (
    <div>
      {/* Suche und Filter */}
      <div className="rounded-3xl bg-white p-4 shadow-card sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("searchPlaceholder")}
              className="pl-11"
              aria-label={t("searchPlaceholder")}
            />
          </div>
          <Select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label={t("filterCategory")}
            className="lg:w-44"
          >
            <option value="">{t("filterCategory")}</option>
            {categories.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </Select>
          <Select
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            aria-label={t("filterCountry")}
            className="lg:w-44"
          >
            <option value="">{t("filterCountry")}</option>
            {countries.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Zähler */}
      <p className="mt-8 text-sm text-mist-500">
        {t("count", { count: filtered.length })}
      </p>

      {/* Tabelle (Desktop) / Karten (Mobil) */}
      <div className="mt-4 overflow-hidden rounded-3xl border border-mist-200 bg-white shadow-card">
        <div className="hidden grid-cols-[1.5fr_230px_180px_240px] gap-4 border-b border-mist-200 bg-mist-50 px-7 py-4 text-[11px] font-bold uppercase tracking-[0.14em] text-mist-400 lg:grid">
          <span>{t("colPosition")}</span>
          <span>{t("colLocation")}</span>
          <span>{t("colSystem")}</span>
          <span className="pr-14 text-right">{t("colSalary")}</span>
        </div>

        {filtered.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-mist-400">
            {t("noResults")}
          </p>
        ) : (
          <ul className="divide-y divide-mist-100">
            {paged.map((job) => (
              <li key={job.id}>
                <Link
                  href={{
                    pathname: "/karriere/stelle/[slug]",
                    params: { slug: job.slug }
                  }}
                  className="group grid gap-4 px-5 py-6 transition-colors hover:bg-mist-50 sm:px-7 lg:grid-cols-[1.5fr_230px_180px_240px] lg:items-center lg:py-7"
                >
                  <div className="min-w-0">
                    {job.licenseCategory ? (
                      <span className="inline-flex items-center rounded-full bg-accent-500/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-600">
                        {t("categoryPrefix")} {job.licenseCategory}
                      </span>
                    ) : null}
                    <h3 className="mt-2 font-display text-lg font-bold leading-snug text-night-900 transition-colors group-hover:text-accent-600">
                      {job.title}
                    </h3>
                  </div>
                  <p className="flex items-center gap-2 text-sm font-medium text-night-700">
                    <MapPin className="h-4 w-4 shrink-0 text-accent-500" />
                    <span className="min-w-0">{formatLocation(job)}</span>
                  </p>
                  <p>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-mist-200 bg-mist-50 px-3 py-1.5 text-xs font-semibold text-night-700">
                      <Clock className="h-3.5 w-3.5 text-mist-400" />
                      {job.system}
                    </span>
                  </p>
                  <div className="flex items-center justify-between gap-4 lg:justify-end">
                    <p className="text-right leading-tight">
                      <span className="block whitespace-nowrap font-display text-lg font-extrabold tracking-tight text-night-900">
                        {job.salary}
                      </span>
                      {job.salaryNote ? (
                        <span className="text-xs font-medium text-mist-400">
                          {job.salaryNote}
                        </span>
                      ) : null}
                    </p>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-night-950 text-white transition-all group-hover:scale-105 group-hover:bg-accent-500">
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:-rotate-45" />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Seitennavigation */}
      {totalPages > 1 ? (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={safePage === 1}
            aria-label={t("prevPage")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-mist-200 bg-white text-night-900 transition-colors hover:border-night-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-mist-200"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (number) => (
              <button
                key={number}
                type="button"
                onClick={() => setPage(number)}
                aria-current={number === safePage ? "page" : undefined}
                className={
                  number === safePage
                    ? "h-10 min-w-10 rounded-full bg-night-950 px-3 text-sm font-semibold text-white"
                    : "h-10 min-w-10 rounded-full border border-mist-200 bg-white px-3 text-sm font-semibold text-night-700 transition-colors hover:border-night-900"
                }
              >
                {number}
              </button>
            )
          )}
          <button
            type="button"
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            disabled={safePage === totalPages}
            aria-label={t("nextPage")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-mist-200 bg-white text-night-900 transition-colors hover:border-night-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-mist-200"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
