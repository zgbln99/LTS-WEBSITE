"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { loginAction, type LoginState } from "@/server/actions/admin";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    loginAction,
    {}
  );

  return (
    <form action={action} className="space-y-5">
      <Field label="E-Mail-Adresse" htmlFor="login-email" required>
        <Input
          id="login-email"
          name="email"
          type="email"
          required
          autoComplete="username"
        />
      </Field>
      <Field label="Passwort" htmlFor="login-password" required>
        <Input
          id="login-password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="current-password"
        />
      </Field>
      {state.error ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? "Anmeldung läuft..." : "Anmelden"}
      </Button>
    </form>
  );
}
