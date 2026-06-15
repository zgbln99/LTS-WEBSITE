import {
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let cached: S3Client | null = null;

export function isS3Configured() {
  return Boolean(
    process.env.S3_ENDPOINT &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY
  );
}

function getClient(): S3Client {
  if (cached) return cached;
  cached = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION ?? "eu-central-1",
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? ""
    }
  });
  return cached;
}

export async function uploadApplicationFile(
  key: string,
  body: Buffer,
  contentType: string
) {
  await getClient().send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_APPLICATIONS ?? "lts-applications",
      Key: key,
      Body: body,
      ContentType: contentType
    })
  );
  return key;
}

// Generischer Upload (z.B. für Datenbank-Backups) in denselben Bucket.
export async function uploadObject(
  key: string,
  body: Buffer | string,
  contentType: string
) {
  await getClient().send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_APPLICATIONS ?? "lts-applications",
      Key: key,
      Body: body,
      ContentType: contentType
    })
  );
  return key;
}

// --- Medien (Bilder/Videos aus dem Seiten-Editor) ---
// Speicherung in einem MEGA-S4-/S3-Bucket. MEGA S4 unterstützt KEINE
// öffentlichen Buckets (weder Canned-ACL noch Bucket-Policy), daher werden die
// Dateien nicht direkt von MEGA, sondern über die eigene Proxy-Route
// /api/media/<key> ausgeliefert (der Server ist der einzige authentifizierte
// Leser). Ist eine echte öffentliche CDN-Domain vorhanden, kann sie über
// S3_PUBLIC_URL gesetzt werden und wird dann direkt verwendet.

function mediaBucket() {
  return process.env.S3_BUCKET_MEDIA ?? "lts-media";
}

export function isMediaStorageConfigured() {
  return Boolean(
    process.env.S3_ENDPOINT &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY &&
      process.env.S3_BUCKET_MEDIA
  );
}

// URL, unter der ein Medienobjekt im Frontend abrufbar ist. Standardmäßig die
// eigene Proxy-Route; mit S3_PUBLIC_URL eine direkte öffentliche CDN-URL.
export function mediaUrl(key: string) {
  const base = process.env.S3_PUBLIC_URL?.replace(/\/+$/, "");
  if (base) return `${base}/${key}`;
  return `/api/media/${key}`;
}

export async function uploadMedia(
  key: string,
  body: Buffer,
  contentType: string
) {
  await getClient().send(
    new PutObjectCommand({
      Bucket: mediaBucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable"
    })
  );
  return mediaUrl(key);
}

// Ein Medienobjekt zum Streamen über die Proxy-Route abrufen.
export async function getMediaObject(key: string) {
  return getClient().send(
    new GetObjectCommand({ Bucket: mediaBucket(), Key: key })
  );
}

// Bereits hochgeladene Medien auflisten (neueste zuerst), für die Mediathek.
export async function listMedia(limit = 60) {
  const result = await getClient().send(
    new ListObjectsV2Command({
      Bucket: mediaBucket(),
      Prefix: "uploads/",
      MaxKeys: 1000
    })
  );
  const objects = (result.Contents ?? [])
    .filter((entry) =>
      /\.(jpg|jpeg|png|webp|avif|svg)$/i.test(entry.Key ?? "")
    )
    .sort(
      (a, b) =>
        (b.LastModified?.getTime() ?? 0) - (a.LastModified?.getTime() ?? 0)
    )
    .slice(0, limit);
  return objects.map((entry) => mediaUrl(entry.Key ?? ""));
}

export async function getDownloadUrl(key: string, expiresInSeconds = 3600) {
  if (!isS3Configured()) return null;
  try {
    return await getSignedUrl(
      getClient(),
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_APPLICATIONS ?? "lts-applications",
        Key: key
      }),
      { expiresIn: expiresInSeconds }
    );
  } catch (error) {
    console.error("Presigned URL konnte nicht erstellt werden:", error);
    return null;
  }
}
