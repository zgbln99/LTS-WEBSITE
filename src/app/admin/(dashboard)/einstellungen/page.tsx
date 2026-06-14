import { redirect } from "next/navigation";
import { requireRole } from "@/auth";
import {
  AnalyticsForm,
  GeneralForm,
  SmtpForm,
  TranslationForm
} from "@/components/admin/settings-forms";
import { SmtpTester } from "@/components/admin/smtp-tester";
import { getMailConfigSummary } from "@/server/mailer";
import {
  getAnalyticsSettings,
  getGeneralSettings,
  getSmtpSettings,
  getTranslationSettings
} from "@/server/site-settings";

export const dynamic = "force-dynamic";

export const metadata = { title: "Einstellungen" };

export default async function SettingsPage() {
  const session = await requireRole(["SUPER_ADMIN"]);
  if (!session) redirect("/admin");

  const [general, smtp, summary, analytics, translation] = await Promise.all([
    getGeneralSettings(),
    getSmtpSettings(),
    getMailConfigSummary(),
    getAnalyticsSettings(),
    getTranslationSettings()
  ]);

  // Passwort nie an den Client geben.
  const { password: _password, ...smtpWithoutPassword } = smtp;
  void _password;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-night-900">
          Einstellungen
        </h1>
        <p className="mt-1 text-sm text-mist-500">
          Allgemeine Angaben, E-Mail-Versand und Testfunktion an einem Ort.
        </p>
      </div>

      <GeneralForm initial={general} />
      <TranslationForm
        initial={{
          sourceLocale: translation.sourceLocale,
          autoTranslate: translation.autoTranslate,
          hasKey: Boolean(translation.deeplKey)
        }}
      />
      <AnalyticsForm initial={analytics} />
      <SmtpForm initial={smtpWithoutPassword} />
      <SmtpTester
        configured={summary.configured}
        defaultRecipient={session.user.email}
      />
    </div>
  );
}
