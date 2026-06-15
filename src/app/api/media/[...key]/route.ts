import { NextResponse } from "next/server";
import { getMediaObject, isMediaStorageConfigured } from "@/server/s3";

// Öffentliche Auslieferung der Editor-Medien. MEGA S4 erlaubt keinen anonymen
// Zugriff, daher streamt diese Route die Datei serverseitig (authentifiziert)
// aus dem Bucket an den Besucher. Nur Objekte unter "uploads/" mit
// Bild-/Video-Endung sind erreichbar (kein Zugriff auf andere Schlüssel).
const SAFE_KEY = /^uploads\/[a-zA-Z0-9._-]+\.(jpg|jpeg|png|webp|avif|svg|mp4|webm)$/i;

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  svg: "image/svg+xml",
  mp4: "video/mp4",
  webm: "video/webm"
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  if (!isMediaStorageConfigured()) {
    return new NextResponse("Not found", { status: 404 });
  }

  const { key: segments } = await params;
  const key = (segments ?? []).join("/");
  if (!SAFE_KEY.test(key)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const object = await getMediaObject(key);
    const body = object.Body;
    if (!body) {
      return new NextResponse("Not found", { status: 404 });
    }

    const extension = key.split(".").pop()?.toLowerCase() ?? "";
    const contentType =
      object.ContentType ??
      CONTENT_TYPES[extension] ??
      "application/octet-stream";

    const stream = (
      body as { transformToWebStream: () => ReadableStream }
    ).transformToWebStream();

    return new NextResponse(stream, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch (error) {
    const status = (error as { $metadata?: { httpStatusCode?: number } })
      ?.$metadata?.httpStatusCode;
    if (status !== 404 && status !== 403) {
      console.error("Medien-Proxy fehlgeschlagen:", key, error);
    }
    return new NextResponse("Not found", { status: 404 });
  }
}
