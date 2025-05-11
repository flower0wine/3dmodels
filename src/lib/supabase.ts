import { createClient } from "@supabase/supabase-js";
import { Model } from "./types";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("缺少Supabase环境变量");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getModels(cursor?: string, limit = 10): Promise<{ models: Model[]; nextCursor: string | null }> {
  let query = supabase
    .from("models")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (cursor) {
    // 假设cursor是created_at值
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;

  if (error) {
    console.error("获取模型失败:", error);
    throw error;
  }

  const nextCursor = data.length === limit ? data[data.length - 1].created_at : null;

  return { models: data as Model[], nextCursor };
}

export async function getModelById(id: string): Promise<Model | null> {
  const { data, error } = await supabase
    .from("models")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("获取模型详情失败:", error);
    return null;
  }

  return data as Model;
} 