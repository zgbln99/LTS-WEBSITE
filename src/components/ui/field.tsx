import * as React from "react";
import { cn } from "@/lib/utils";

const baseInputClasses =
  "w-full rounded-xl border border-mist-300 bg-white px-4 py-3 text-sm text-night-900 placeholder:text-mist-400 outline-none transition-colors focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 disabled:opacity-50";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(baseInputClasses, className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(baseInputClasses, "min-h-28 resize-y", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(baseInputClasses, "appearance-none", className)}
    {...props}
  />
));
Select.displayName = "Select";

export function Field({
  label,
  htmlFor,
  required,
  children,
  className
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-night-900"
      >
        {label}
        {required ? <span className="text-accent-600"> *</span> : null}
      </label>
      {children}
    </div>
  );
}

export function ConsentCheckbox({
  label,
  name = "consent"
}: {
  label: string;
  name?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm text-mist-500">
      <input
        type="checkbox"
        name={name}
        required
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-mist-300 accent-[#ff4d1c]"
      />
      <span>{label}</span>
    </label>
  );
}

// Unsichtbares Honeypot-Feld gegen Spam-Bots
export function HoneypotField() {
  return (
    <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden>
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

export function FormStatusMessage({
  status,
  errorText,
  className
}: {
  status: "idle" | "success" | "error";
  errorText?: string;
  className?: string;
}) {
  if (status !== "error" || !errorText) return null;
  return (
    <p
      role="alert"
      className={cn(
        "rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700",
        className
      )}
    >
      {errorText}
    </p>
  );
}

export function SuccessPanel({
  title,
  text
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl bg-mint-400/10 p-8 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-mint-400/20 font-display text-xl font-bold text-mint-500">
        ✓
      </span>
      <h3 className="mt-4 font-display text-xl font-bold text-night-900">
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-mist-500">
        {text}
      </p>
    </div>
  );
}
