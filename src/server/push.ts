// Sofort-Push aufs Handy bei neuen Bewerbungen. Mehrere Kanäle, alle optional
// und per .env aktivierbar: Telegram, ntfy, generischer Webhook, WhatsApp
// (CallMeBot). Best-Effort - Fehler brechen die Bewerbung nie ab.

export function isPushConfigured(): boolean {
  return Boolean(
    (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) ||
      process.env.NTFY_TOPIC ||
      process.env.PUSH_WEBHOOK_URL ||
      (process.env.CALLMEBOT_PHONE && process.env.CALLMEBOT_APIKEY)
  );
}

async function safeFetch(url: string, init?: RequestInit) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(url, { ...init, signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) {
      console.error("Push-Kanal-Fehler:", url.split("?")[0], response.status);
    }
  } catch (error) {
    console.error("Push-Kanal nicht erreichbar:", url.split("?")[0], error);
  }
}

export async function sendPushNotification(opts: {
  title: string;
  message: string;
  url?: string;
}) {
  const { title, message, url } = opts;
  const tasks: Promise<void>[] = [];

  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    tasks.push(
      safeFetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: `${title}\n${message}${url ? `\n${url}` : ""}`,
            disable_web_page_preview: true
          })
        }
      )
    );
  }

  if (process.env.NTFY_TOPIC) {
    const server = (process.env.NTFY_SERVER || "https://ntfy.sh").replace(
      /\/+$/,
      ""
    );
    tasks.push(
      safeFetch(`${server}/${process.env.NTFY_TOPIC}`, {
        method: "POST",
        headers: {
          Title: title,
          Tags: "briefcase",
          ...(url ? { Click: url } : {})
        },
        body: message
      })
    );
  }

  if (process.env.PUSH_WEBHOOK_URL) {
    tasks.push(
      safeFetch(process.env.PUSH_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message, url })
      })
    );
  }

  if (process.env.CALLMEBOT_PHONE && process.env.CALLMEBOT_APIKEY) {
    const text = encodeURIComponent(`${title}\n${message}`);
    tasks.push(
      safeFetch(
        `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(
          process.env.CALLMEBOT_PHONE
        )}&text=${text}&apikey=${encodeURIComponent(process.env.CALLMEBOT_APIKEY)}`
      )
    );
  }

  await Promise.allSettled(tasks);
}
