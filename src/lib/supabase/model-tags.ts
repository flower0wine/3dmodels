"use server"

import { ModelTag, Tag } from "@/types/tag";
import { createClient } from "@/lib/supabase/server";

/**
 * 获取模型的标签列表
 * @param modelId 模型ID
 * @returns 标签列表
 */
export async function getModelTags(modelId: string): Promise<Tag[]> {
  const supabase = await createClient();
  
  // 定义清晰的返回类型，包含嵌套结构
  interface ModelTagWithTag {
    tag_id: string;
    tags: Tag;
  }
  
  const { data, error } = await supabase
    .from("model_tags")
    .select(`
      tag_id,
      tags:tag_id (*)
    `)
    .eq("model_id", modelId);

  if (error) {
    console.error("获取模型标签失败:", error);
    throw error;
  }

  // 提取tags数据，明确类型转换
  const typedData = data as unknown as ModelTagWithTag[];
  const tags = typedData.map(item => item.tags);
  return tags;
}

/**
 * 获取使用特定标签的模型ID列表
 * @param tagId 标签ID
 * @returns 模型ID列表
 */
export async function getTaggedModels(tagId: string): Promise<string[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("model_tags")
    .select("model_id")
    .eq("tag_id", tagId);

  if (error) {
    console.error("获取标签下的模型失败:", error);
    throw error;
  }

  return data.map(item => item.model_id);
}

/**
 * 为模型添加标签
 * @param modelId 模型ID
 * @param tagId 标签ID
 * @returns 创建的关联信息
 */
export async function addTagToModel(modelId: string, tagId: string): Promise<ModelTag> {
  const supabase = await createClient();
  
  // 获取当前用户
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error("未登录，请先登录");
  }
  
  // 检查模型是否存在及权限
  const { data: model, error: modelError } = await supabase
    .from('models')
    .select('user_id')
    .eq('id', modelId)
    .single();
  
  if (modelError || !model) {
    console.error("检查模型失败:", modelError);
    throw new Error("模型不存在");
  }
  
  // 检查是否为模型所有者
  if (model.user_id !== userData.user.id) {
    throw new Error("无权为此模型添加标签");
  }
  
  // 检查标签是否存在
  const { data: tag, error: tagError } = await supabase
    .from('tags')
    .select('id')
    .eq('id', tagId)
    .single();
  
  if (tagError || !tag) {
    console.error("检查标签失败:", tagError);
    throw new Error("标签不存在");
  }
  
  // 检查关联是否已存在
  const { data: existingRelation, error: checkError } = await supabase
    .from('model_tags')
    .select('id')
    .eq('model_id', modelId)
    .eq('tag_id', tagId)
    .maybeSingle();
  
  if (checkError) {
    console.error("检查标签关联失败:", checkError);
    throw new Error("添加标签失败");
  }
  
  // 如果关联已存在，直接返回
  if (existingRelation) {
    return existingRelation as ModelTag;
  }
  
  // 创建新的关联
  const newRelation = {
    model_id: modelId,
    tag_id: tagId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  const { data: createdRelation, error: insertError } = await supabase
    .from('model_tags')
    .insert(newRelation)
    .select()
    .single();
  
  if (insertError) {
    console.error("添加标签关联失败:", insertError);
    throw new Error("添加标签失败");
  }
  
  return createdRelation as ModelTag;
}

/**
 * 批量为模型添加标签
 * @param modelId 模型ID
 * @param tagIds 标签ID数组
 * @returns 添加成功的标签ID数组
 */
export async function addTagsToModel(modelId: string, tagIds: string[]): Promise<string[]> {
  const supabase = await createClient();
  
  // 获取当前用户
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error("未登录，请先登录");
  }
  
  // 检查模型是否存在及权限
  const { data: model, error: modelError } = await supabase
    .from('models')
    .select('user_id')
    .eq('id', modelId)
    .single();
  
  if (modelError || !model) {
    console.error("检查模型失败:", modelError);
    throw new Error("模型不存在");
  }
  
  // 检查是否为模型所有者
  if (model.user_id !== userData.user.id) {
    throw new Error("无权为此模型添加标签");
  }
  
  if (tagIds.length === 0) {
    return [];
  }
  
  // 检查已有的关联，避免重复添加
  const { data: existingRelations, error: checkError } = await supabase
    .from('model_tags')
    .select('tag_id')
    .eq('model_id', modelId)
    .in('tag_id', tagIds);
  
  if (checkError) {
    console.error("检查现有标签关联失败:", checkError);
    throw new Error("添加标签失败");
  }
  
  // 过滤出需要添加的标签ID
  const existingTagIds = existingRelations.map(r => r.tag_id);
  const newTagIds = tagIds.filter(id => !existingTagIds.includes(id));
  
  if (newTagIds.length === 0) {
    // 所有标签都已关联，直接返回
    return tagIds;
  }
  
  // 准备批量插入数据
  const now = new Date().toISOString();
  const relations = newTagIds.map(tagId => ({
    model_id: modelId,
    tag_id: tagId,
    created_at: now,
    updated_at: now
  }));
  
  // 批量插入关联
  const { error: insertError } = await supabase
    .from('model_tags')
    .insert(relations);
  
  if (insertError) {
    console.error("批量添加标签关联失败:", insertError);
    throw new Error("添加标签失败");
  }
  
  // 返回所有成功关联的标签ID
  return [...existingTagIds, ...newTagIds];
}

/**
 * 从模型中移除标签
 * @param modelId 模型ID
 * @param tagId 标签ID
 */
export async function removeTagFromModel(modelId: string, tagId: string): Promise<void> {
  const supabase = await createClient();
  
  // 获取当前用户
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error("未登录，请先登录");
  }
  
  // 检查模型是否存在及权限
  const { data: model, error: modelError } = await supabase
    .from('models')
    .select('user_id')
    .eq('id', modelId)
    .single();
  
  if (modelError || !model) {
    console.error("检查模型失败:", modelError);
    throw new Error("模型不存在");
  }
  
  // 检查是否为模型所有者
  if (model.user_id !== userData.user.id) {
    throw new Error("无权从此模型移除标签");
  }
  
  // 删除关联
  const { error: deleteError } = await supabase
    .from('model_tags')
    .delete()
    .eq('model_id', modelId)
    .eq('tag_id', tagId);
  
  if (deleteError) {
    console.error("移除标签关联失败:", deleteError);
    throw new Error("移除标签失败");
  }
}

/**
 * 更新模型的标签（设置为指定的标签集合）
 * @param modelId 模型ID
 * @param tagIds 要设置的标签ID数组
 * @returns 更新后的标签ID数组
 */
export async function updateModelTags(modelId: string, tagIds: string[]): Promise<string[]> {
  const supabase = await createClient();
  
  // 获取当前用户
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error("未登录，请先登录");
  }
  
  // 检查模型是否存在及权限
  const { data: model, error: modelError } = await supabase
    .from('models')
    .select('user_id')
    .eq('id', modelId)
    .single();
  
  if (modelError || !model) {
    console.error("检查模型失败:", modelError);
    throw new Error("模型不存在");
  }
  
  // 检查是否为模型所有者
  if (model.user_id !== userData.user.id) {
    throw new Error("无权更新此模型的标签");
  }
  
  // 获取当前的标签关联
  const { data: currentRelations, error: getError } = await supabase
    .from('model_tags')
    .select('tag_id')
    .eq('model_id', modelId);
  
  if (getError) {
    console.error("获取当前标签关联失败:", getError);
    throw new Error("更新标签失败");
  }
  
  const currentTagIds = currentRelations.map(r => r.tag_id);
  
  // 需要添加的标签
  const tagsToAdd = tagIds.filter(id => !currentTagIds.includes(id));
  // 需要删除的标签
  const tagsToRemove = currentTagIds.filter(id => !tagIds.includes(id));
  
  // 如果没有变化，直接返回
  if (tagsToAdd.length === 0 && tagsToRemove.length === 0) {
    return tagIds;
  }
  
  // 开始事务处理
  try {
    // 删除需要移除的标签关联
    if (tagsToRemove.length > 0) {
      const { error: removeError } = await supabase
        .from('model_tags')
        .delete()
        .eq('model_id', modelId)
        .in('tag_id', tagsToRemove);
      
      if (removeError) {
        throw new Error(`删除标签关联失败: ${removeError.message}`);
      }
    }
    
    // 添加新的标签关联
    if (tagsToAdd.length > 0) {
      const now = new Date().toISOString();
      const relations = tagsToAdd.map(tagId => ({
        model_id: modelId,
        tag_id: tagId,
        created_at: now,
        updated_at: now
      }));
      
      const { error: addError } = await supabase
        .from('model_tags')
        .insert(relations);
      
      if (addError) {
        throw new Error(`添加标签关联失败: ${addError.message}`);
      }
    }
    
    return tagIds;
  } catch (error) {
    console.error("更新模型标签失败:", error);
    throw new Error("更新标签失败");
  }
} 