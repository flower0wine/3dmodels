import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/lib/backblaze/client";

export async function getModelUrl(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.B2_BUCKET,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
} 