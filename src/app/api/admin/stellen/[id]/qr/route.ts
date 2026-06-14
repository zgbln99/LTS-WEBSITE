import QRCode from "qrcode";
import { requireRole } from "@/auth";
import { prisma } from "@/server/db";
import { localizedUrl } from "@/lib/seo";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";

// QR-Code (PNG) für die öffentliche Stellen-URL. Zum Aushang an Tankstellen,
// auf Flyern oder Fahrzeugen. ?download=1 erzwingt den Datei-Download.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireRole(["SUPER_ADMIN", "HR"]);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const job = await prisma.jobPosting.findUnique({
    where: { id },
    include: { translations: { where: { locale: routing.defaultLocale } } }
  });
  const slug = job?.translations[0]?.slug;
  if (!slug) return new Response("Not found", { status: 404 });

  // Quelle "qr" anhängen, damit Bewerbungen über den Code messbar sind.
  const url = `${localizedUrl(routing.defaultLocale, {
    pathname: "/karriere/stelle/[slug]",
    params: { slug }
  })}?src=qr`;

  const png = await QRCode.toBuffer(url, {
    width: 800,
    margin: 2,
    color: { dark: "#0b101d", light: "#ffffff" }
  });

  const download = new URL(request.url).searchParams.get("download");
  const headers: Record<string, string> = {
    "Content-Type": "image/png",
    "Cache-Control": "no-store"
  };
  if (download) {
    headers["Content-Disposition"] = `attachment; filename="qr-${slug}.png"`;
  }

  return new Response(new Uint8Array(png), { headers });
}
