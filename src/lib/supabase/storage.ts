"use server"

import { createClient } from '@/lib/supabase/server';

type UploadOptions = {
  upsert?: boolean;
  contentType?: string;
};

/**
 * 上传文件到存储
 * @param bucket 存储桶
 * @param path 存储路径
 * @param file 文件
 * @param options 上传选项
 * @returns 上传结果
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
  options?: UploadOptions
) {
  const supabase = await createClient();
  
  try {
    // 使用ArrayBuffer上传文件
    const arrayBuffer = await file.arrayBuffer();
    
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .upload(path, arrayBuffer, {
        upsert: options?.upsert || false,
        contentType: options?.contentType || file.type,
      });
    
    if (error) {
      throw error;
    }
    
    // 获取公共URL
    const { data: urlData } = await supabase
      .storage
      .from(bucket)
      .getPublicUrl(path);
    
    return { 
      data: { 
        ...data, 
        publicUrl: urlData.publicUrl 
      }, 
      error: null 
    };
  } catch (error) {
    console.error(`上传文件到 ${bucket}/${path} 失败:`, error);
    return { data: null, error };
  }
}

/**
 * 获取文件的签名URL
 * @param bucket 存储桶名称
 * @param path 文件路径
 * @param expiresIn 过期时间（秒）
 * @returns 签名URL
 */
export async function getSignedUrl(bucket: string, path: string, expiresIn: number = 3600) {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);
    
    if (error) {
      console.error('获取签名URL失败:', error);
      throw error;
    }
    
    return { 
      signedUrl: data?.signedUrl,
      error: null
    };
  } catch (err) {
    console.error('获取签名URL过程中发生错误:', err);
    return {
      signedUrl: null,
      error: err instanceof Error ? err : new Error('获取签名URL失败')
    };
  }
}

/**
 * 删除文件
 * @param bucket 存储桶名称
 * @param paths 文件路径或路径数组
 * @returns 删除结果
 */
export async function deleteFiles(bucket: string, paths: string | string[]) {
  const supabase = await createClient();
  const pathsArray = Array.isArray(paths) ? paths : [paths];
  
  try {
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .remove(pathsArray);
    
    if (error) {
      console.error('删除文件失败:', error);
      throw error;
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('删除文件过程中发生错误:', err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error('删除文件失败')
    };
  }
} 