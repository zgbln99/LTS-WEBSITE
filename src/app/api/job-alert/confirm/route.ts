import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { safeQuery } from "@/server/safe";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

// Bestätigt eine Job-Alert-Anmeldung (Double-Opt-in).
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (token) {
    await safeQuery(() =>
      prisma.jobAlert.updateMany({
        where: { token, confirmedAt: null },
        data: { confirmedAt: new Date() }
      })
    );
  }
  return NextResponse.redirect(`${SITE_URL}/de/karriere?alert=confirmed`);
}
