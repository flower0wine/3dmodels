import { NextRequest, NextResponse } from "next/server";
import { getModels } from "@/lib/supabase";
import { modelsResponseSchema } from "@/types/model"; 

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cursor = searchParams.get("cursor");
  const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 10;

  try {
    const result = await getModels(cursor || undefined, limit);
    
    // 使用Zod验证响应数据
    const validatedResponse = modelsResponseSchema.parse(result);
    
    return NextResponse.json(validatedResponse);
  } catch (error) {
    console.error("获取模型API错误:", error);
    return NextResponse.json({ error: "获取模型失败" }, { status: 500 });
  }
} 