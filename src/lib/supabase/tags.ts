"use server"

import { Tag, TagInput, TagsResponse } from "@/types/tag";
import { createClient } from "@/lib/supabase/server";

/**
 * 获取标签列表
 * @param cursor 分页游标
 * @param limit 每页数量
 * @param search 搜索关键词，用于按名称搜索
 * @returns 标签列表和下一页游标
 */
export async function getTags(
  cursor?: string, 
  limit = 50, 
  search?: string
): Promise<TagsResponse> {
  const supabase = await createClient();

  let query = supabase
    .from("tags")
    .select("*")
    .order("name", { ascending: true });
  
  // 如果有搜索关键词，添加搜索条件
  if (search && search.trim()) {
    // 使用ilike进行不区分大小写的模糊搜索
    query = query.ilike("name", `%${search.trim()}%`);
  }
  
  // 添加分页
  query = query.limit(limit);
  
  if (cursor) {
    // 假设我们按name排序，这里需要使用gt而不是lt
    query = query.gt("name", cursor);
  }

  const { data, error } = await query;

  if (error) {
    console.error("获取标签失败:", error);
    throw error;
  }

  // 因为按name排序，所以nextCursor使用最后一个tag的name
  const nextCursor = data.length === limit ? data[data.length - 1]?.name : null;

  return { tags: data as Tag[], nextCursor };
}

/**
 * 获取单个标签详情
 * @param id 标签ID
 * @returns 标签详情或null
 */
export async function getTagById(id: string): Promise<Tag | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("获取标签详情失败:", error);
    return null;
  }

  return data as Tag;
}

/**
 * 获取用户创建的标签
 * @param cursor 分页游标
 * @param limit 每页数量
 * @param search 搜索关键词
 * @returns 用户创建的标签列表和下一页游标
 */
export async function getUserTags(
  cursor?: string,
  limit = 50,
  search?: string
): Promise<TagsResponse> {
  const supabase = await createClient();
  
  // 获取当前用户
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error("未登录，请先登录");
  }
  
  let query = supabase
    .from("tags")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("name", { ascending: true });
  
  // 如果有搜索关键词，添加搜索条件
  if (search && search.trim()) {
    // 使用ilike进行不区分大小写的模糊搜索
    query = query.ilike("name", `%${search.trim()}%`);
  }
  
  // 添加分页
  query = query.limit(limit);
  
  if (cursor) {
    query = query.gt("name", cursor);
  }

  const { data, error } = await query;

  if (error) {
    console.error("获取用户标签失败:", error);
    throw error;
  }

  const nextCursor = data.length === limit ? data[data.length - 1]?.name : null;

  return { tags: data as Tag[], nextCursor };
}

/**
 * 创建新标签
 * @param tagData 标签数据
 * @returns 创建的标签信息
 */
export async function createTag(tagData: TagInput): Promise<Tag> {
  const supabase = await createClient();
  
  // 获取当前用户
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error("未登录，请先登录");
  }
  
  // 检查标签名称是否已存在
  const { data: existingTags, error: checkError } = await supabase
    .from('tags')
    .select('id')
    .ilike('name', tagData.name.trim())
    .limit(1);
    
  if (checkError) {
    console.error("检查标签是否存在失败:", checkError);
    throw new Error("创建标签失败");
  }
  
  if (existingTags && existingTags.length > 0) {
    throw new Error(`标签 "${tagData.name.trim()}" 已存在`);
  }
  
  // 准备标签数据
  const newTag = {
    name: tagData.name.trim(),
    description: tagData.description || null,
    user_id: userData.user.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  console.log(newTag);
  
  // 插入数据库
  const { data: insertedTag, error: insertError } = await supabase
    .from('tags')
    .insert(newTag)
    .select()
    .single();
  
  if (insertError) {
    console.error("创建标签失败:", insertError);
    throw insertError;
  }
  
  return insertedTag as Tag;
}

/**
 * 更新标签
 * @param id 标签ID
 * @param tagData 要更新的标签数据
 * @returns 更新后的标签信息
 */
export async function updateTag(id: string, tagData: TagInput): Promise<Tag> {
  const supabase = await createClient();
  
  // 获取当前用户
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error("未登录，请先登录");
  }
  
  // 检查标签是否存在及权限
  const { data: tag, error: getError } = await supabase
    .from('tags')
    .select('*')
    .eq('id', id)
    .single();
  
  if (getError || !tag) {
    console.error("获取标签失败:", getError);
    throw new Error("标签不存在");
  }
  
  // 检查是否为创建者
  if (tag.user_id !== userData.user.id) {
    throw new Error("无权更新此标签");
  }
  
  // 检查新名称是否与其他标签冲突
  if (tag.name !== tagData.name.trim()) {
    const { data: existingTags, error: checkError } = await supabase
      .from('tags')
      .select('id')
      .ilike('name', tagData.name.trim())
      .neq('id', id)
      .limit(1);
      
    if (checkError) {
      console.error("检查标签是否存在失败:", checkError);
      throw new Error("更新标签失败");
    }
    
    if (existingTags && existingTags.length > 0) {
      throw new Error(`标签 "${tagData.name.trim()}" 已存在`);
    }
  }
  
  // 准备更新数据
  const updatedData = {
    name: tagData.name.trim(),
    description: tagData.description || null,
    updated_at: new Date().toISOString()
  };
  
  // 更新数据库
  const { data: updatedTag, error: updateError } = await supabase
    .from('tags')
    .update(updatedData)
    .eq('id', id)
    .select()
    .single();
  
  if (updateError) {
    console.error("更新标签失败:", updateError);
    throw new Error("更新标签失败");
  }
  
  return updatedTag as Tag;
}

/**
 * 删除标签
 * @param id 标签ID
 */
export async function deleteTag(id: string): Promise<void> {
  const supabase = await createClient();
  
  // 获取当前用户
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error("未登录，请先登录");
  }
  
  // 检查标签是否存在及权限
  const { data: tag, error: getError } = await supabase
    .from('tags')
    .select('*')
    .eq('id', id)
    .single();
  
  if (getError || !tag) {
    console.error("获取标签失败:", getError);
    throw new Error("标签不存在");
  }
  
  // 检查是否为创建者
  if (tag.user_id !== userData.user.id) {
    throw new Error("无权删除此标签");
  }
  
  // 删除标签
  const { error: deleteError } = await supabase
    .from('tags')
    .delete()
    .eq('id', id);
  
  if (deleteError) {
    console.error("删除标签失败:", deleteError);
    throw new Error("删除标签失败");
  }
} 