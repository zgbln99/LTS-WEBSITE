import { createHash } from "node:crypto";
import { headers } from "next/headers";

// Sliding-Window-Limit im Speicher. Ausreichend für eine einzelne Instanz;
// bei horizontaler Skalierung durch Redis/DB ersetzen.
const windows = new Map<string, number[]>();

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;

export async function getClientIpHash() {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";
  return createHash("sha256")
    .update(`${ip}:${process.env.AUTH_SECRET ?? "lts"}`)
    .digest("hex")
    .slice(0, 32);
}

export function isRateLimited(scope: string, ipHash: string) {
  const key = `${scope}:${ipHash}`;
  const now = Date.now();
  const timestamps = (windows.get(key) ?? []).filter(
    (timestamp) => now - timestamp < WINDOW_MS
  );

  if (timestamps.length >= MAX_REQUESTS) {
    windows.set(key, timestamps);
    return true;
  }

  timestamps.push(now);
  windows.set(key, timestamps);

  // Speicher begrenzen
  if (windows.size > 10_000) {
    for (const [k, v] of windows) {
      if (v.every((timestamp) => now - timestamp >= WINDOW_MS)) {
        windows.delete(k);
      }
    }
  }

  return false;
}
