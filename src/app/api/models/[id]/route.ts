import { NextRequest, NextResponse } from "next/server";
import { getModelById } from "@/lib/supabase";
import { modelSchema } from "@/types/model";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const model = await getModelById(params.id);
    
    if (!model) {
      return NextResponse.json({ error: "模型不存在" }, { status: 404 });
    }
    
    // 使用Zod验证响应数据
    const validatedModel = modelSchema.parse(model);
    
    return NextResponse.json(validatedModel);
  } catch (error) {
    console.error("获取模型详情失败:", error);
    return NextResponse.json({ error: "获取模型详情失败" }, { status: 500 });
  }
} 