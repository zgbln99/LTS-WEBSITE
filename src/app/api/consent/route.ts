import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { safeQuery } from "@/server/safe";
import { getClientIpHash } from "@/server/rate-limit";

export const dynamic = "force-dynamic";

const schema = z.object({
  analytics: z.boolean(),
  marketing: z.boolean(),
  locale: z.string().max(5).optional()
});

// Protokolliert die erteilte Cookie-Einwilligung als DSGVO-Nachweis.
export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const ipHash = await getClientIpHash();
  const userAgent = request.headers.get("user-agent")?.slice(0, 400) ?? null;

  await safeQuery(() =>
    prisma.consentLog.create({
      data: {
        analytics: parsed.data.analytics,
        marketing: parsed.data.marketing,
        locale: parsed.data.locale ?? "de",
        ipHash,
        userAgent
      }
    })
  );

  return NextResponse.json({ ok: true });
}
