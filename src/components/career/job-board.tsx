"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Search } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Input, Select } from "@/components/ui/field";

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

export function JobBoard({ jobs }: { jobs: BoardJob[] }) {
  const t = useTranslations("career.board");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [country, setCountry] = useState("");

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
        <div className="hidden grid-cols-[1fr_220px_200px_180px] gap-4 border-b border-mist-100 bg-mist-50 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-mist-400 lg:grid">
          <span>{t("colPosition")}</span>
          <span>{t("colLocation")}</span>
          <span>{t("colSystem")}</span>
          <span className="text-right">{t("colSalary")}</span>
        </div>

        {filtered.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-mist-400">
            {t("noResults")}
          </p>
        ) : (
          <ul className="divide-y divide-mist-100">
            {filtered.map((job) => (
              <li key={job.id}>
                <Link
                  href={{
                    pathname: "/karriere/stelle/[slug]",
                    params: { slug: job.slug }
                  }}
                  className="group grid gap-3 px-6 py-5 transition-colors hover:bg-mist-50 lg:grid-cols-[1fr_220px_200px_180px] lg:items-center lg:gap-4"
                >
                  <div>
                    {job.licenseCategory ? (
                      <span className="text-xs font-bold uppercase tracking-wider text-accent-600">
                        {t("categoryPrefix")} {job.licenseCategory}
                      </span>
                    ) : null}
                    <h3 className="mt-0.5 font-display text-base font-bold leading-snug text-night-900">
                      {job.title}
                    </h3>
                  </div>
                  <p className="text-sm text-mist-500">
                    {job.location}
                    {job.country ? `, ${job.country}` : ""}
                  </p>
                  <p className="text-sm text-mist-500">{job.system}</p>
                  <div className="flex items-center justify-between gap-3 lg:justify-end">
                    <p className="text-right">
                      <span className="font-display text-base font-extrabold text-night-900">
                        {job.salary}
                      </span>{" "}
                      <span className="text-xs text-mist-400">
                        {job.salaryNote}
                      </span>
                    </p>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-night-950 text-white transition-colors group-hover:bg-accent-500">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
