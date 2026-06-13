"use client";

import { useState, useTransition } from "react";
import { Field, Input, Textarea } from "@/components/ui/field";
import {
  saveGeneralAction,
  saveSmtpAction
} from "@/server/actions/settings";
import type { GeneralSettings, SmtpSettings } from "@/server/site-settings";

function StatusNote({ note }: { note: string | null }) {
  if (!note) return null;
  return <p className="text-sm font-medium text-mint-500">{note}</p>;
}

export function GeneralForm({ initial }: { initial: GeneralSettings }) {
  const [values, setValues] = useState(initial);
  const [note, setNote] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const update = (patch: Partial<GeneralSettings>) =>
    setValues((current) => ({ ...current, ...patch }));

  const save = () =>
    startTransition(async () => {
      const result = await saveGeneralAction(values);
      setNote(result.ok ? "Gespeichert." : "Fehler beim Speichern.");
      setTimeout(() => setNote(null), 4000);
    });

  return (
    <div className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
      <h2 className="font-display text-base font-bold text-night-900">
        Allgemein
      </h2>
      <p className="mt-1 text-sm text-mist-500">
        Name und Slogan der Website sowie die Kontaktnummern für Fahrer.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Website-Name" htmlFor="set-name">
          <Input
            id="set-name"
            value={values.siteName}
            onChange={(e) => update({ siteName: e.target.value })}
          />
        </Field>
        <Field label="Slogan" htmlFor="set-slogan">
          <Input
            id="set-slogan"
            value={values.slogan}
            onChange={(e) => update({ slogan: e.target.value })}
            placeholder="z.B. Ihr Partner für Transporte in Europa"
          />
        </Field>
        <Field label="Recruiting-Telefon (Fuhrparkleitung)" htmlFor="set-phone">
          <Input
            id="set-phone"
            value={values.recruitingPhone}
            onChange={(e) => update({ recruitingPhone: e.target.value })}
            placeholder="+49 ..."
          />
        </Field>
        <Field label="WhatsApp-Nummer für Fahrer" htmlFor="set-whatsapp">
          <Input
            id="set-whatsapp"
            value={values.recruitingWhatsapp}
            onChange={(e) => update({ recruitingWhatsapp: e.target.value })}
            placeholder="+49 ... (leer = ausgeblendet)"
          />
        </Field>
      </div>
      <div className="mt-5 flex items-center gap-4">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="inline-flex h-11 items-center rounded-xl bg-accent-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-600 disabled:opacity-50"
        >
          {pending ? "Speichert ..." : "Speichern"}
        </button>
        <StatusNote note={note} />
      </div>
    </div>
  );
}

export function SmtpForm({
  initial
}: {
  initial: Omit<SmtpSettings, "password">;
}) {
  const [values, setValues] = useState(initial);
  const [password, setPassword] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const update = (patch: Partial<typeof values>) =>
    setValues((current) => ({ ...current, ...patch }));

  const save = () =>
    startTransition(async () => {
      const result = await saveSmtpAction({ ...values, password });
      setNote(result.ok ? "Gespeichert." : "Fehler beim Speichern.");
      setPassword("");
      setTimeout(() => setNote(null), 4000);
    });

  return (
    <div className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
      <h2 className="font-display text-base font-bold text-night-900">
        SMTP / E-Mail-Versand
      </h2>
      <p className="mt-1 text-sm text-mist-500">
        Diese Werte haben Vorrang vor der .env-Datei. Das Passwortfeld leer
        lassen, um das gespeicherte Passwort beizubehalten.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Server (Host)" htmlFor="smtp-host">
          <Input
            id="smtp-host"
            value={values.host}
            onChange={(e) => update({ host: e.target.value })}
            placeholder="smtp.strato.de"
          />
        </Field>
        <Field label="Port" htmlFor="smtp-port">
          <Input
            id="smtp-port"
            type="number"
            value={values.port}
            onChange={(e) => update({ port: Number(e.target.value) })}
          />
        </Field>
        <Field label="Benutzer" htmlFor="smtp-user">
          <Input
            id="smtp-user"
            value={values.user}
            onChange={(e) => update({ user: e.target.value })}
            autoComplete="off"
          />
        </Field>
        <Field label="Passwort" htmlFor="smtp-pass">
          <Input
            id="smtp-pass"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="unverändert lassen"
            autoComplete="new-password"
          />
        </Field>
        <Field label="Absenderadresse (From)" htmlFor="smtp-from">
          <Input
            id="smtp-from"
            value={values.from}
            onChange={(e) => update({ from: e.target.value })}
            placeholder="noreply@ltslogistik.de"
          />
        </Field>
        <Field label="Empfänger Bewerbungen (HR)" htmlFor="smtp-hr">
          <Input
            id="smtp-hr"
            value={values.hrRecipient}
            onChange={(e) => update({ hrRecipient: e.target.value })}
          />
        </Field>
        <Field label="Empfänger Anfragen" htmlFor="smtp-inq">
          <Input
            id="smtp-inq"
            value={values.inquiriesRecipient}
            onChange={(e) => update({ inquiriesRecipient: e.target.value })}
          />
        </Field>
      </div>
      <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-sm text-night-900">
        <input
          type="checkbox"
          checked={values.secure}
          onChange={(e) => update({ secure: e.target.checked })}
          className="h-4 w-4 rounded border-mist-300 accent-[#e11d24]"
        />
        Verschlüsselung SSL/TLS (Port 465). Deaktivieren für STARTTLS (Port 587).
      </label>
      <div className="mt-5 flex items-center gap-4">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="inline-flex h-11 items-center rounded-xl bg-accent-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-600 disabled:opacity-50"
        >
          {pending ? "Speichert ..." : "Speichern"}
        </button>
        <StatusNote note={note} />
      </div>
    </div>
  );
}
