"use client";

import { useState, useTransition } from "react";
import { Field, Input, Textarea } from "@/components/ui/field";
import {
  saveAnalyticsAction,
  saveGeneralAction,
  saveSmtpAction,
  saveTranslationAction
} from "@/server/actions/settings";
import type {
  AnalyticsSettings,
  GeneralSettings,
  SmtpSettings,
  TranslationSettings
} from "@/server/site-settings";

const LOCALE_NAMES: Record<string, string> = {
  de: "Deutsch",
  en: "English",
  pl: "Polski",
  tr: "Türkçe",
  uk: "Українська"
};

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
        Name und Slogan erscheinen im Kopfbereich (neben dem Logo) und in der
        Fußzeile. Dazu die Kontaktnummern für Fahrer auf den Stellenseiten.
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
        <Field
          label="Browser-Titel der Startseite (Tab / SEO)"
          htmlFor="set-metatitle"
          className="sm:col-span-2"
        >
          <Input
            id="set-metatitle"
            value={values.metaTitle}
            onChange={(e) => update({ metaTitle: e.target.value })}
            placeholder="leer = Website-Name + Slogan"
          />
        </Field>
        <Field
          label="Meta-Beschreibung der Startseite (SEO)"
          htmlFor="set-metadesc"
          className="sm:col-span-2"
        >
          <Textarea
            id="set-metadesc"
            value={values.metaDescription}
            onChange={(e) => update({ metaDescription: e.target.value })}
            placeholder="Kurzbeschreibung für Google und Social Media"
            className="min-h-20"
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

export function TranslationForm({
  initial
}: {
  initial: Omit<TranslationSettings, "openaiKey"> & { hasKey: boolean };
}) {
  const [sourceLocale, setSourceLocale] = useState(initial.sourceLocale);
  const [autoTranslate, setAutoTranslate] = useState(initial.autoTranslate);
  const [openaiModel, setOpenaiModel] = useState(initial.openaiModel);
  const [openaiKey, setOpenaiKey] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const save = () =>
    startTransition(async () => {
      const result = await saveTranslationAction({
        openaiKey,
        openaiModel,
        sourceLocale,
        autoTranslate
      });
      setNote(result.ok ? "Gespeichert." : "Fehler beim Speichern.");
      setOpenaiKey("");
      setTimeout(() => setNote(null), 4000);
    });

  return (
    <div className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
      <h2 className="font-display text-base font-bold text-night-900">
        Automatische Übersetzung (OpenAI)
      </h2>
      <p className="mt-1 text-sm text-mist-500">
        Inhalte in der Ausgangssprache schreiben - die übrigen Sprachen werden
        automatisch übersetzt. Schlüsselfeld leer lassen = unverändert.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="OpenAI API-Schlüssel" htmlFor="tr-key">
          <Input
            id="tr-key"
            type="password"
            value={openaiKey}
            onChange={(e) => setOpenaiKey(e.target.value)}
            placeholder={initial.hasKey ? "gespeichert - leer lassen" : "sk-..."}
            autoComplete="new-password"
          />
        </Field>
        <Field label="Modell" htmlFor="tr-model">
          <Input
            id="tr-model"
            value={openaiModel}
            onChange={(e) => setOpenaiModel(e.target.value)}
            placeholder="gpt-4o-mini"
          />
        </Field>
        <Field label="Ausgangssprache" htmlFor="tr-src">
          <select
            id="tr-src"
            value={sourceLocale}
            onChange={(e) => setSourceLocale(e.target.value)}
            className="h-12 w-full appearance-none rounded-xl border border-mist-300 bg-white px-4 text-sm text-night-900 outline-none focus:border-accent-500"
          >
            {Object.entries(LOCALE_NAMES).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-sm text-night-900">
        <input
          type="checkbox"
          checked={autoTranslate}
          onChange={(e) => setAutoTranslate(e.target.checked)}
          className="h-4 w-4 rounded border-mist-300 accent-[#e11d24]"
        />
        Beim Speichern automatisch in alle Sprachen übersetzen
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

export function AnalyticsForm({ initial }: { initial: AnalyticsSettings }) {
  const [values, setValues] = useState(initial);
  const [note, setNote] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const update = (patch: Partial<AnalyticsSettings>) =>
    setValues((current) => ({ ...current, ...patch }));

  const save = () =>
    startTransition(async () => {
      const result = await saveAnalyticsAction(values);
      setNote(result.ok ? "Gespeichert." : "Fehler beim Speichern.");
      setTimeout(() => setNote(null), 4000);
    });

  return (
    <div className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
      <h2 className="font-display text-base font-bold text-night-900">
        Analyse / Statistik
      </h2>
      <p className="mt-1 text-sm text-mist-500">
        Datenschutzfreundlich mit selbst gehostetem Matomo. Skripte laden erst
        nach Einwilligung. Felder leer lassen, um den Dienst zu deaktivieren.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Matomo-URL" htmlFor="an-matomo-url">
          <Input
            id="an-matomo-url"
            value={values.matomoUrl}
            onChange={(e) => update({ matomoUrl: e.target.value })}
            placeholder="https://stats.ltslogistik.de"
          />
        </Field>
        <Field label="Matomo Site-ID" htmlFor="an-matomo-id">
          <Input
            id="an-matomo-id"
            value={values.matomoSiteId}
            onChange={(e) => update({ matomoSiteId: e.target.value })}
            placeholder="1"
          />
        </Field>
        <Field label="Google Analytics ID (optional)" htmlFor="an-ga">
          <Input
            id="an-ga"
            value={values.gaId}
            onChange={(e) => update({ gaId: e.target.value })}
            placeholder="G-XXXXXXX"
          />
        </Field>
        <Field label="Meta-Pixel ID (optional)" htmlFor="an-pixel">
          <Input
            id="an-pixel"
            value={values.pixelId}
            onChange={(e) => update({ pixelId: e.target.value })}
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
