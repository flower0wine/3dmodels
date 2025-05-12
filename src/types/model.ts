import { z } from "zod";

// 模型数据验证schema
export const modelSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  thumbnail_path: z.string().url(),
  storage_path: z.string().url(),
  category: z.string().optional(),
  created_at: z.string().or(z.date()),
  updated_at: z.string().or(z.date()),
  author: z.string().optional(),
  format: z.string(),
  polygon_count: z.number().optional(),
  file_size: z.number().optional()
}).passthrough();

// 响应验证schema
export const modelsResponseSchema = z.object({
  models: z.array(modelSchema),
  nextCursor: z.string().nullable(),
});

// 导出类型
export type Model = z.infer<typeof modelSchema>;
export type ModelsResponse = z.infer<typeof modelsResponseSchema>; 