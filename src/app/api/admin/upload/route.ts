import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { NextResponse } from "next/server";
import { requireRole } from "@/auth";
import {
  isMediaStorageConfigured,
  listMedia,
  uploadMedia
} from "@/server/s3";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/svg+xml",
  "video/mp4",
  "video/webm"
]);
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const MAX_VIDEO_SIZE = 64 * 1024 * 1024;

const extensionFor: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/svg+xml": "svg",
  "video/mp4": "mp4",
  "video/webm": "webm"
};

// Bild-Upload für den Seiten-Editor (Mediathek unter /uploads).
export async function POST(request: Request) {
  const session = await requireRole(["SUPER_ADMIN", "MARKETING", "EDITOR"]);
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing file" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "type" }, { status: 415 });
  }
  const maxSize = file.type.startsWith("video/")
    ? MAX_VIDEO_SIZE
    : MAX_IMAGE_SIZE;
  if (file.size > maxSize) {
    return NextResponse.json({ error: "size" }, { status: 413 });
  }

  const base = file.name
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .slice(0, 40)
    .toLowerCase();
  const name = `${base || "bild"}-${randomBytes(4).toString("hex")}.${extensionFor[file.type]}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  // Bevorzugt MEGA S4 / S3 (öffentlicher Bucket -> direkte CDN-URL). Fällt auf
  // das lokale Verzeichnis zurück, wenn kein Object-Storage konfiguriert ist.
  if (isMediaStorageConfigured()) {
    try {
      const url = await uploadMedia(`uploads/${name}`, buffer, file.type);
      return NextResponse.json({ url });
    } catch (error) {
      console.error("Medien-Upload (S3/MEGA S4) fehlgeschlagen:", error);
      return NextResponse.json({ error: "storage" }, { status: 502 });
    }
  }

  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, name), buffer);
  } catch (error) {
    // Häufigste Ursache in Produktion: das gemountete Upload-Verzeichnis
    // gehört root, der Container läuft aber als Benutzer "nextjs" (uid 1001).
    const code = (error as NodeJS.ErrnoException)?.code;
    console.error("Upload fehlgeschlagen:", code, error);
    if (code === "EACCES" || code === "EPERM" || code === "EROFS") {
      return NextResponse.json(
        { error: "permission", detail: code },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: "write", detail: code }, { status: 500 });
  }

  return NextResponse.json({ url: `/uploads/${name}` });
}

// Liste der bereits hochgeladenen Bilder (neueste zuerst).
export async function GET() {
  const session = await requireRole(["SUPER_ADMIN", "MARKETING", "EDITOR"]);
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (isMediaStorageConfigured()) {
    try {
      return NextResponse.json({ images: await listMedia(60) });
    } catch (error) {
      console.error("Mediathek (S3/MEGA S4) konnte nicht geladen werden:", error);
      return NextResponse.json({ images: [] });
    }
  }

  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
    const files = await readdir(UPLOAD_DIR);
    const entries = await Promise.all(
      files
        .filter((file) => /\.(jpg|jpeg|png|webp|avif|svg)$/i.test(file))
        .map(async (file) => {
          const info = await stat(path.join(UPLOAD_DIR, file));
          return { url: `/uploads/${file}`, mtime: info.mtimeMs };
        })
    );
    entries.sort((a, b) => b.mtime - a.mtime);
    return NextResponse.json({
      images: entries.slice(0, 60).map((entry) => entry.url)
    });
  } catch {
    return NextResponse.json({ images: [] });
  }
}
