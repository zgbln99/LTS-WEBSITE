import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Im Speicher zwischengespeicherte Weiterleitungen (max. 60s alt).
let cache: {
  map: Record<string, { to: string; status: number }>;
  at: number;
} | null = null;
const TTL = 60_000;

async function getRedirects(request: NextRequest) {
  if (cache && Date.now() - cache.at < TTL) return cache.map;
  try {
    const response = await fetch(new URL("/api/redirects", request.url));
    if (response.ok) {
      const map = (await response.json()) as Record<
        string,
        { to: string; status: number }
      >;
      cache = { map, at: Date.now() };
      return map;
    }
  } catch {
    // Bei Fehler die alte Map weiterverwenden, falls vorhanden.
  }
  return cache?.map ?? {};
}

export default async function middleware(request: NextRequest) {
  const map = await getRedirects(request);
  const hit = map[request.nextUrl.pathname];
  if (hit) {
    return NextResponse.redirect(new URL(hit.to, request.url), hit.status);
  }
  return intlMiddleware(request);
}

export const config = {
  matcher: "/((?!api|admin|_next|_vercel|.*\\..*).*)"
};
