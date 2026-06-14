import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { safeQuery } from "@/server/safe";

export const dynamic = "force-dynamic";
export const revalidate = 60;

// Liefert die im Admin gepflegten Weiterleitungen als Map für die Middleware.
export async function GET() {
  const redirects = await safeQuery(() =>
    prisma.redirect.findMany({ take: 1000 })
  );

  const map: Record<string, { to: string; status: number }> = {};
  for (const entry of redirects ?? []) {
    map[entry.fromPath] = { to: entry.toPath, status: entry.statusCode };
  }

  return NextResponse.json(map, {
    headers: { "Cache-Control": "public, max-age=60" }
  });
}
