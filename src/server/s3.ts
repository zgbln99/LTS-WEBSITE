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

// --- Öffentliche Medien (Bilder/Videos aus dem Seiten-Editor) ---
// Eigener, öffentlich lesbarer Bucket (MEGA S4 / S3). Liefert direkte URLs,
// die in <img src> verwendet werden können - der VPS muss die Dateien dann
// nicht mehr selbst ausliefern.

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

// Öffentliche URL für ein Medienobjekt zusammensetzen. Bevorzugt eine eigene
// CDN-/Public-Domain (S3_PUBLIC_URL), sonst Path-Style am Endpoint.
export function mediaPublicUrl(key: string) {
  const base = process.env.S3_PUBLIC_URL?.replace(/\/+$/, "");
  if (base) return `${base}/${key}`;
  const endpoint = (process.env.S3_ENDPOINT ?? "").replace(/\/+$/, "");
  return `${endpoint}/${mediaBucket()}/${key}`;
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
      ACL: "public-read",
      CacheControl: "public, max-age=31536000, immutable"
    })
  );
  return mediaPublicUrl(key);
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
  return objects.map((entry) => mediaPublicUrl(entry.Key ?? ""));
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
