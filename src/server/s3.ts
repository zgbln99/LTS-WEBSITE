import {
  GetObjectCommand,
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
