import { z } from "zod";
import { modelSchema } from "./model";

// 标签数据验证schema
export const tagSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "标签名称不能为空").max(50, "标签名称不能超过50个字符"),
  description: z.string().optional(),
  created_at: z.string().or(z.date()),
  updated_at: z.string().or(z.date()),
  user_id: z.string().uuid()
}).passthrough();

// 模型标签关联验证schema
export const modelTagSchema = z.object({
  id: z.string().uuid(),
  model_id: z.string().uuid(),
  tag_id: z.string().uuid(),
  created_at: z.string().or(z.date()),
  updated_at: z.string().or(z.date())
}).passthrough();

// 扩展的带标签模型schema
export const modelWithTagsSchema = modelSchema.extend({
  tags: z.array(tagSchema).optional()
});

// 标签列表响应schema
export const tagsResponseSchema = z.object({
  tags: z.array(tagSchema),
  nextCursor: z.string().nullable(),
});

// 标签输入schema (用于创建和更新)
export const tagInputSchema = z.object({
  name: z.string().min(1, "标签名称不能为空").max(50, "标签名称不能超过50个字符"),
  description: z.string().optional()
});

// 导出类型
export type Tag = z.infer<typeof tagSchema>;
export type ModelTag = z.infer<typeof modelTagSchema>;
export type ModelWithTags = z.infer<typeof modelWithTagsSchema>;
export type TagsResponse = z.infer<typeof tagsResponseSchema>;
export type TagInput = z.infer<typeof tagInputSchema>; 