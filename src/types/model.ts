import { z } from "zod";

// 模型数据验证schema
export const modelSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  thumbnail_url: z.string().url(),
  model_url: z.string(),
  category: z.string(),
  created_at: z.string().datetime(),
  author: z.string(),
  file_format: z.string(), // glb, gltf, obj等
  polygon_count: z.number().int().positive(),
  file_size: z.number().positive()
});

// 响应验证schema
export const modelsResponseSchema = z.object({
  models: z.array(modelSchema),
  nextCursor: z.string().nullable(),
});

// 导出类型
export type Model = z.infer<typeof modelSchema>;
export type ModelsResponse = z.infer<typeof modelsResponseSchema>; 