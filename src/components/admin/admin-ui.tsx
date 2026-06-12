import type { ApplicationStatus, RequestStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

export const requestStatusLabels: Record<RequestStatus, string> = {
  NEW: "Neu",
  IN_PROGRESS: "In Bearbeitung",
  QUOTED: "Angebot gesendet",
  WON: "Gewonnen",
  LOST: "Verloren",
  CLOSED: "Geschlossen"
};

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  NEW: "Neu",
  REVIEWED: "Geprüft",
  INTERVIEW: "Interview",
  REJECTED: "Abgesagt",
  HIRED: "Eingestellt"
};

const statusColors: Record<string, string> = {
  NEW: "bg-accent-500/10 text-accent-600",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  QUOTED: "bg-violet-100 text-violet-700",
  WON: "bg-mint-400/15 text-mint-500",
  LOST: "bg-red-100 text-red-700",
  CLOSED: "bg-mist-200 text-mist-500",
  REVIEWED: "bg-blue-100 text-blue-700",
  INTERVIEW: "bg-violet-100 text-violet-700",
  REJECTED: "bg-red-100 text-red-700",
  HIRED: "bg-mint-400/15 text-mint-500"
};

export function StatusBadge({
  status,
  label
}: {
  status: string;
  label: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        statusColors[status] ?? "bg-mist-200 text-mist-500"
      )}
    >
      {label}
    </span>
  );
}

export function formatDateTime(date: Date | null | undefined) {
  if (!date) return "";
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export function AdminCard({
  title,
  children,
  className
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl bg-white p-5 shadow-card sm:p-6", className)}>
      {title ? (
        <h2 className="mb-4 font-display text-base font-bold text-night-900">
          {title}
        </h2>
      ) : null}
      {children}
    </div>
  );
}

export function DbErrorBanner() {
  return (
    <div className="rounded-2xl bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
      Die Datenbank ist derzeit nicht erreichbar. Bitte prüfen Sie die
      Konfiguration (DATABASE_URL) und laden Sie die Seite neu.
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-mist-300 px-5 py-8 text-center text-sm text-mist-400">
      {text}
    </p>
  );
}
