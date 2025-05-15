"use server"

import { createClient } from '@/lib/supabase/server';

/**
 * 直接上传文件到Supabase存储
 * @param bucket 存储桶名称
 * @param path 文件路径（包含文件名）
 * @param file 要上传的文件
 * @param options 上传选项
 * @returns 上传结果
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
  options?: {
    cacheControl?: string;
    upsert?: boolean;
  }
) {
  const supabase = await createClient();
  
  try {
    // 执行上传
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: options?.cacheControl || '3600',
        upsert: options?.upsert || false
      });
    
    if (error) {
      console.error('文件上传失败:', error);
      throw error;
    }
    
    // 如果需要，获取公共URL
    const { data: urlData } = await supabase
      .storage
      .from(bucket)
      .getPublicUrl(path);
    
    return {
      data: {
        ...data,
        publicUrl: urlData?.publicUrl
      },
      error: null
    };
  } catch (err) {
    console.error('上传过程中发生错误:', err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error('未知上传错误')
    };
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