"use server"

import { S3Client } from "@aws-sdk/client-s3";

if (!process.env.B2_ENDPOINT || !process.env.B2_BUCKET || !process.env.B2_KEY_ID || !process.env.B2_APP_KEY) {
  throw new Error("缺少Backblaze环境变量");
}

export const s3Client = new S3Client({
  region: "us-west-004", // Backblaze区域
  endpoint: process.env.B2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APP_KEY,
  },
});