import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";

// 验证请求参数
const queryParamsSchema = z.object({
  key: z.string().min(1),
});

// Backblaze S3客户端配置
const s3Client = new S3Client({
  region: "us-west-004", // Backblaze区域
  endpoint: process.env.B2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID!,
    secretAccessKey: process.env.B2_APP_KEY!,
  },
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    
    // 验证参数
    const validatedParams = queryParamsSchema.parse({ key });
    
    // 生成签名URL
    const command = new GetObjectCommand({
      Bucket: process.env.B2_BUCKET!,
      Key: validatedParams.key,
    });
    
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    return NextResponse.json({ url });
  } catch (error) {
    console.error("获取文件URL失败:", error);
    return NextResponse.json({ error: "获取文件URL失败" }, { status: 500 });
  }
} 