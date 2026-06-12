"use client";

import { useRef, useTransition } from "react";

interface StatusSelectProps {
  id: string;
  status: string;
  options: { value: string; label: string }[];
  action: (formData: FormData) => Promise<void>;
}

export function StatusSelect({ id, status, options, action }: StatusSelectProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form ref={formRef} action={action} className="inline-block">
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={status}
        disabled={pending}
        onChange={() => {
          const form = formRef.current;
          if (!form) return;
          startTransition(() => {
            action(new FormData(form));
          });
        }}
        className="rounded-lg border border-mist-300 bg-white px-2.5 py-1.5 text-xs font-medium text-night-900 outline-none focus:border-accent-500 disabled:opacity-50"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </form>
  );
}
