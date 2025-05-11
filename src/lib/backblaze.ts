import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

if (!process.env.B2_ENDPOINT || !process.env.B2_BUCKET || !process.env.B2_KEY_ID || !process.env.B2_APP_KEY) {
  throw new Error("缺少Backblaze环境变量");
}

const s3Client = new S3Client({
  region: "us-west-004", // Backblaze区域
  endpoint: process.env.B2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APP_KEY,
  },
});

export async function getModelUrl(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.B2_BUCKET,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
} 