import { prisma } from "@/server/db";
import { safeQuery } from "@/server/safe";
import { confirmationHtml, sendMail } from "@/server/mailer";
import { localizedUrl, SITE_URL } from "@/lib/seo";
import { routing } from "@/i18n/routing";

// Bestätigungsmail (Double-Opt-in) an einen neuen Interessenten.
export async function sendJobAlertConfirmation(alert: {
  email: string;
  token: string;
  locale: string;
}) {
  const confirmUrl = `${SITE_URL}/api/job-alert/confirm?token=${alert.token}`;
  const body = [
    "Guten Tag,",
    "",
    "bitte bestätigen Sie Ihre Anmeldung für Job-Benachrichtigungen bei LTS Logistik, indem Sie den folgenden Link öffnen:",
    confirmUrl,
    "",
    "Wenn Sie sich nicht angemeldet haben, ignorieren Sie diese E-Mail einfach.",
    "",
    "Mit freundlichen Grüßen",
    "LTS Logistik GmbH"
  ].join("\n");

  try {
    await sendMail({
      to: alert.email,
      subject: "Bitte bestätigen Sie Ihre Job-Benachrichtigung",
      text: body,
      html: confirmationHtml(body)
    });
  } catch (error) {
    console.error("Job-Alert-Bestätigung fehlgeschlagen:", error);
  }
}

function matches(
  alert: { category: string | null; region: string | null },
  job: { categoryKey: string; locationCity: string; locationRegion: string | null }
) {
  if (alert.category && alert.category !== job.categoryKey) return false;
  if (alert.region) {
    const haystack = `${job.locationCity} ${job.locationRegion ?? ""}`.toLowerCase();
    if (!haystack.includes(alert.region.toLowerCase())) return false;
  }
  return true;
}

// Benachrichtigt passende, bestätigte Interessenten über eine neue Stelle.
// Wird einmalig pro Stelle ausgeführt (alertsSentAt verhindert Wiederholung).
export async function notifyJobAlerts(jobId: string) {
  const job = await safeQuery(() =>
    prisma.jobPosting.findUnique({
      where: { id: jobId },
      include: { category: true, translations: { where: { locale: routing.defaultLocale } } }
    })
  );
  if (!job || job.status !== "PUBLISHED" || job.alertsSentAt) return;

  const alerts = await safeQuery(() =>
    prisma.jobAlert.findMany({
      where: { confirmedAt: { not: null }, unsubscribedAt: null }
    })
  );
  if (!alerts || alerts.length === 0) {
    await safeQuery(() =>
      prisma.jobPosting.update({
        where: { id: jobId },
        data: { alertsSentAt: new Date() }
      })
    );
    return;
  }

  const title = job.translations[0]?.title ?? "Neue Stelle";
  const slug = job.translations[0]?.slug;

  for (const alert of alerts) {
    if (
      !matches(alert, {
        categoryKey: job.category.key,
        locationCity: job.locationCity,
        locationRegion: job.locationRegion
      })
    ) {
      continue;
    }
    const jobUrl = slug
      ? `${localizedUrl(routing.defaultLocale, {
          pathname: "/karriere/stelle/[slug]",
          params: { slug }
        })}?src=jobalert`
      : `${SITE_URL}/de/karriere`;
    const unsubscribeUrl = `${SITE_URL}/api/job-alert/unsubscribe?token=${alert.token}`;
    const body = [
      "Guten Tag,",
      "",
      `bei LTS Logistik gibt es eine neue passende Stelle: ${title} in ${job.locationCity}.`,
      "",
      `Zur Stelle: ${jobUrl}`,
      "",
      `Abmelden: ${unsubscribeUrl}`,
      "",
      "Mit freundlichen Grüßen",
      "LTS Logistik GmbH"
    ].join("\n");

    try {
      await sendMail({
        to: alert.email,
        subject: `Neue Stelle: ${title} in ${job.locationCity}`,
        text: body,
        html: confirmationHtml(body)
      });
    } catch (error) {
      console.error("Job-Alert-Versand fehlgeschlagen:", error);
    }
  }

  await safeQuery(() =>
    prisma.jobPosting.update({
      where: { id: jobId },
      data: { alertsSentAt: new Date() }
    })
  );
}
