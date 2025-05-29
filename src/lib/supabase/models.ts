"use server"

import { Model, ModelsResponse } from "@/types/model";
import { createClient } from "@/lib/supabase/server";

/**
 * 获取模型列表
 * @param cursor 分页游标
 * @param limit 每页数量
 * @param search 搜索关键词，用于按名称搜索
 * @returns 模型列表和下一页游标
 */
export async function getModels(
  cursor?: string, 
  limit = 10, 
  search?: string,
  fetchUserModels = false
): Promise<ModelsResponse> {
  const supabase = await createClient();

  let query = supabase
    .from("models")
    .select("*")
    .order("created_at", { ascending: false });
  
  // 如果有搜索关键词，添加搜索条件
  if (search && search.trim()) {
    // 使用ilike进行不区分大小写的模糊搜索
    query = query.ilike("name", `%${search.trim()}%`);
  }

  if (fetchUserModels) {
    // 获取当前用户
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error("未登录，请先登录");
    }
    query = query.eq("user_id", userData.user.id);
  }
  
  // 添加分页
  query = query.limit(limit);
  
  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;

  if (error) {
    console.error("获取模型失败:", error);
    throw error;
  }

  const nextCursor = data.length === limit ? data[data.length - 1]?.created_at : null;

  return { models: data as Model[], nextCursor };
}

/**
 * 获取单个模型详情
 * @param id 模型ID
 * @returns 模型详情或null
 */
export async function getModelById(id: string): Promise<Model | null> {
  const supabase = await createClient();
  
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

/**
 * 上传模型
 * @param modelData 模型数据
 * @param file 模型文件
 * @param thumbnail 缩略图文件
 * @returns 上传后的模型信息
 */
export async function uploadModel(
  modelData: Partial<Model>,
  file: File,
  thumbnail: File
): Promise<Model> {
  const supabase = await createClient();
  
  // 获取当前用户
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error("未登录，请先登录");
  }
  
  // 上传模型文件
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = `${fileName}`;
  
  const { error: fileUploadError } = await supabase
    .storage
    .from('models')
    .upload(filePath, file);
  
  if (fileUploadError) {
    console.error("上传模型文件失败:", fileUploadError);
    throw new Error("上传模型文件失败");
  }
  
  // 上传缩略图
  const thumbExt = thumbnail.name.split('.').pop();
  const thumbName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${thumbExt}`;
  const thumbPath = `${thumbName}`;
  
  const { error: thumbUploadError } = await supabase
    .storage
    .from('thumbnails')
    .upload(thumbPath, thumbnail);
  
  if (thumbUploadError) {
    console.error("上传缩略图失败:", thumbUploadError);
    throw new Error("上传缩略图失败");
  }
  
  // 获取文件URL
  const { data: fileUrlData } = await supabase
    .storage
    .from('models')
    .getPublicUrl(filePath);
  
  const { data: thumbUrlData } = await supabase
    .storage
    .from('thumbnails')
    .getPublicUrl(thumbPath);
  
  if (!fileUrlData || !thumbUrlData) {
    throw new Error("获取文件URL失败");
  }
  
  // 准备模型数据
  const newModel: Partial<Model> = {
    ...modelData,
    user_id: userData.user.id,
    storage_path: filePath,             // 存储路径
    storage_url: fileUrlData.publicUrl, // 访问URL
    thumbnail_path: thumbPath,          // 缩略图存储路径
    thumbnail_url: thumbUrlData.publicUrl, // 缩略图访问URL
    format: fileExt || '',
    file_size: file.size,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  // 插入数据库
  const { data: insertedModel, error: insertError } = await supabase
    .from('models')
    .insert(newModel)
    .select()
    .single();
  
  if (insertError || !insertedModel) {
    console.error("插入模型数据失败:", insertError);
    throw new Error("保存模型数据失败");
  }
  
  return insertedModel as Model;
}

/**
 * 删除模型
 * @param id 模型ID
 * @returns 是否删除成功
 */
export async function deleteModel(id: string): Promise<void> {
  const supabase = await createClient();
  
  // 获取当前用户
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error("未登录，请先登录");
  }
  
  // 先获取模型信息，检查权限
  const { data: model, error: getError } = await supabase
    .from('models')
    .select('*')
    .eq('id', id)
    .single();
  
  if (getError || !model) {
    console.error("获取模型失败:", getError);
    throw new Error("模型不存在");
  }
  
  // 检查是否为作者
  if (model.user_id !== userData.user.id) {
    throw new Error("无权删除此模型");
  }
  
  // 删除模型文件
  if (model.storage_path) {
    const { error: deleteError } = await supabase.storage.from('models').remove([model.storage_path]);
    if (deleteError) {
      console.error("删除模型文件失败:", deleteError);
    }
  }
  
  // 删除缩略图
  if (model.thumbnail_path) {
    const { error: deleteError } = await supabase.storage.from('thumbnails').remove([model.thumbnail_path]);
    if (deleteError) {
      console.error("删除缩略图失败:", deleteError);
    }
  }
  
  // 从数据库中删除
  const { error: deleteError } = await supabase
    .from('models')
    .delete()
    .eq('id', id);
  
  if (deleteError) {
    console.error("删除模型失败:", deleteError);
    throw new Error("删除模型失败");
  }
}

/**
 * 更新模型信息
 * @param id 模型ID
 * @param updateData 要更新的数据
 * @returns 更新后的模型信息
 */
export async function updateModel(
  id: string, 
  updateData: Partial<Model>
): Promise<Model> {
  const supabase = await createClient();
  
  // 获取当前用户
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error("未登录，请先登录");
  }
  
  // 检查模型是否存在及权限
  const { data: model, error: getError } = await supabase
    .from('models')
    .select('*')
    .eq('id', id)
    .single();
  
  if (getError || !model) {
    console.error("获取模型失败:", getError);
    throw new Error("模型不存在");
  }
  
  // 检查是否为作者
  if (model.user_id !== userData.user.id) {
    throw new Error("无权更新此模型");
  }
  
  // 准备更新数据
  const updatedData: Partial<Model> = {
    ...updateData,
    updated_at: new Date().toISOString()
  };

  // 如果有更新存储路径，则同时更新URL
  if (updateData.storage_path && !updateData.storage_url) {
    const { data: fileUrlData } = await supabase
      .storage
      .from('models')
      .getPublicUrl(updateData.storage_path);
    
    if (fileUrlData) {
      updatedData.storage_url = fileUrlData.publicUrl;
    }
  }

  // 如果有更新缩略图路径，则同时更新URL
  if (updateData.thumbnail_path && !updateData.thumbnail_url) {
    const { data: thumbUrlData } = await supabase
      .storage
      .from('thumbnails')
      .getPublicUrl(updateData.thumbnail_path);
    
    if (thumbUrlData) {
      updatedData.thumbnail_url = thumbUrlData.publicUrl;
    }
  }
  
  // 更新数据库
  const { data: updatedModels, error: updateError } = await supabase
    .from('models')
    .update(updatedData)
    .eq('id', id)
    .select();
  
  if (updateError) {
    console.error("更新模型失败:", updateError);
    throw new Error(`更新模型失败: ${updateError.message}`);
  }
  
  return updatedModels[0] as Model;
}

/**
 * 创建新模型
 * @param modelData 模型基本数据（包括缩略图URL）
 * @param thumbnailFile 可选的缩略图文件，如果modelData中已有thumbnail_path则不需要
 * @returns 创建的模型信息
 */
export async function createModel(
  modelData: Partial<Model>,
): Promise<Model> {
  const supabase = await createClient();
  
  // 获取当前用户
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error("未登录，请先登录");
  }
  
  try {
    // 确保有缩略图URL
    if (!modelData.thumbnail_url) {
      throw new Error("缺少缩略图URL，请上传缩略图");
    }
    
    // 确保有缩略图路径
    if (!modelData.thumbnail_path) {
      throw new Error("缺少缩略图路径，请上传缩略图");
    }
    
    // 确保有模型文件URL
    if (!modelData.storage_url) {
      throw new Error("缺少模型文件URL，请上传模型文件");
    }
    
    // 确保有模型文件路径
    if (!modelData.storage_path) {
      throw new Error("缺少模型文件路径，请上传模型文件");
    }
    
    // 准备完整的模型数据
    const newModel: Partial<Model> = {
      ...modelData,
      user_id: userData.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // 插入数据库
    const { data: insertedModel, error: insertError } = await supabase
      .from('models')
      .insert(newModel)
      .select()
      .single();
    
    if (insertError || !insertedModel) {
      console.error("插入模型数据失败:", insertError);
      throw new Error("保存模型数据失败");
    }
    
    return insertedModel as Model;
  } catch (error) {
    console.error("创建模型失败:", error);
    throw error;
  }
}

/**
 * 获取当前用户的模型列表
 * @param cursor 分页游标
 * @param limit 每页数量
 * @param search 搜索关键词，用于按名称搜索
 * @returns 模型列表和下一页游标
 */
export async function getUserModels(
  cursor?: string, 
  limit = 10, 
  search?: string
): Promise<ModelsResponse> {
  const supabase = await createClient();
  
  // 获取当前用户
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error("未登录，请先登录");
  }
  
  // 构建查询
  let query = supabase
    .from("models")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });
  
  // 如果有搜索关键词，添加搜索条件
  if (search && search.trim()) {
    // 使用ilike进行不区分大小写的模糊搜索
    query = query.ilike("name", `%${search.trim()}%`);
  }
  
  // 添加分页
  query = query.limit(limit);
  
  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;

  if (error) {
    console.error("获取用户模型失败:", error);
    throw error;
  }

  const nextCursor = data.length === limit ? data[data.length - 1]?.created_at : null;

  return { models: data as Model[], nextCursor };
} 