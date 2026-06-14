import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getMailRecipients, notificationHtml, notificationText, sendMail } from "@/server/mailer";

export const dynamic = "force-dynamic";

// Tägliche Erinnerung an bald ablaufende Stellenanzeigen.
// Per Cron aufrufen, z.B.:
//   0 7 * * *  curl -s "https://.../api/cron/job-reminders?token=GEHEIM"
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET ist nicht gesetzt." },
      { status: 503 }
    );
  }

  const token =
    request.nextUrl.searchParams.get("token") ??
    request.headers.get("authorization")?.replace("Bearer ", "");
  if (token !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const jobs = await prisma.jobPosting.findMany({
    where: {
      status: "PUBLISHED",
      validThrough: { not: null, lt: in7Days }
    },
    orderBy: { validThrough: "asc" },
    include: { translations: { where: { locale: "de" } } }
  });

  if (jobs.length === 0) {
    return NextResponse.json({ ok: true, sent: false, count: 0 });
  }

  const rows: [string, string][] = jobs.map((job) => {
    const title = job.translations[0]?.title ?? "Ohne Titel";
    const date = job.validThrough?.toLocaleDateString("de-DE") ?? "";
    const expired = job.validThrough && job.validThrough.getTime() < Date.now();
    return [title, `${expired ? "ABGELAUFEN am" : "läuft ab am"} ${date}`];
  });

  const recipients = await getMailRecipients();
  let sent = false;
  try {
    sent = await sendMail({
      to: recipients.hr,
      subject: `${jobs.length} Stellenanzeige(n) laufen bald ab`,
      text: notificationText("Bald ablaufende Stellenanzeigen", rows),
      html: notificationHtml("Bald ablaufende Stellenanzeigen", rows)
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, sent, count: jobs.length });
}
