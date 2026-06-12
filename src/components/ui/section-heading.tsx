import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  dark?: boolean;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  dark = false,
  className
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-4xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow ? (
        <span
          className={cn(
            "mb-4 inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider",
            dark
              ? "bg-white/10 text-accent-400"
              : "bg-accent-500/10 text-accent-600"
          )}
        >
          {eyebrow}
        </span>
      ) : null}
      <h2
        className={cn(
          "text-3xl font-bold sm:text-4xl lg:text-5xl",
          dark ? "text-white" : "text-night-900"
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed sm:text-lg",
            dark ? "text-mist-300" : "text-mist-500"
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
