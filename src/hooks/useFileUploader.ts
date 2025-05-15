"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Uppy from "@uppy/core";
import Tus from "@uppy/tus";
import Webcam from "@uppy/webcam";
import ScreenCapture from "@uppy/screen-capture";
import ImageEditor from "@uppy/image-editor";
import { createClient } from "@/lib/supabase/client";

// 定义上传文件的类型
export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  path: string;
  url: string;
  uploadedAt: Date;
}

// 上传配置选项
export interface FileUploaderOptions {
  bucket?: string;
  folder?: string;
  multiple?: boolean;
  maxFileSize?: number; // 单位：MB
  allowedFileTypes?: string[];
  chunkSize?: number; // 分块大小，单位 MB
  autoStart?: boolean; // 是否自动开始上传
  tusEndpoint?: string; // 自定义 TUS 端点
}

// 钩子返回结果
export interface UseFileUploaderResult {
  uppy: Uppy | null; // Uppy 实例
  isInitialized: boolean; // 是否初始化完成
  error: Error | null; // 错误信息
  isAuthenticated: boolean; // 是否已认证
  addFile: (file: File) => string | null; // 添加文件
  addFiles: (files: File[]) => (string | null)[]; // 添加多个文件
  removeFile: (fileId: string) => void; // 移除文件
  startUpload: () => Promise<UploadedFile[]>; // 开始上传
  cancelUpload: (fileId?: string) => void; // 取消上传
  retryUpload: (fileId: string) => void; // 重试上传
  clearAll: () => void; // 清除所有文件
}

/**
 * 文件上传钩子
 * @param options 上传配置选项
 * @param onUploadComplete 上传完成回调
 * @param onUploadError 上传错误回调
 * @returns 上传控制方法和状态
 */
export function useFileUploader(
  options: FileUploaderOptions = {},
  onUploadComplete?: (files: UploadedFile[]) => void,
  onUploadError?: (error: Error) => void
): UseFileUploaderResult {
  const {
    bucket = "uploads",
    folder = "",
    multiple = true,
    maxFileSize = 500, // 默认500MB，适合大文件
    allowedFileTypes = ["image/*", "video/*", "audio/*", "application/pdf", "model/*", ".glb", ".gltf", ".obj", ".fbx", ".stl"],
    chunkSize = 6, // 默认6MB分块
    autoStart = false, // 默认不自动开始上传
    tusEndpoint,
  } = options;

  const uppyRef = useRef<Uppy | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [accessToken, setAccessToken] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 初始化 Uppy 和认证
  useEffect(() => {
    let uppy: Uppy | null = null;
    
    const initUppy = async () => {
      // 获取认证令牌
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        const token = data?.session?.access_token || "";
        
        if (token) {
          setIsAuthenticated(true);
          setAccessToken(token);
        } else {
          setIsAuthenticated(false);
          console.warn("用户未登录，部分功能可能受限");
        }
        
        // 创建 Uppy 实例
        uppy = new Uppy({
          id: "uppy-uploader-" + Date.now(),
          autoProceed: autoStart,
          allowMultipleUploadBatches: true,
          debug: process.env.NODE_ENV === "development",
          restrictions: {
            maxFileSize: maxFileSize * 1024 * 1024,
            maxNumberOfFiles: multiple ? null : 1,
            minNumberOfFiles: 1,
            allowedFileTypes,
          },
        });
        
        // 设置插件
        uppy.use(Webcam, { id: "Webcam" });
        uppy.use(ScreenCapture, { id: "ScreenCapture" });
        uppy.use(ImageEditor, { id: "ImageEditor" });
        
        // 添加 Tus 上传插件
        const endpoint = tusEndpoint || `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/upload/resumable`;
        
        uppy.use(Tus, {
          id: "Tus-Uploader",
          endpoint,
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
            "x-upsert": "true",
          },
          chunkSize: chunkSize * 1024 * 1024,
          allowedMetaFields: ["bucketName", "objectName", "contentType", "cacheControl"],
          onError: (error) => {
            console.error("上传错误:", error);
            const errorObj = error instanceof Error ? error : new Error(String(error));
            setError(errorObj);
            if (onUploadError) onUploadError(errorObj);
          },
        });
        
        // 当添加文件时设置 Supabase 存储元数据
        uppy.on("file-added", (file) => {
          const timestamp = new Date().getTime();
          const random = Math.random().toString(36).substring(2, 10);
          const fileName = `${timestamp}_${random}_${file.name}`;
          const objectPath = folder ? `${folder}/${fileName}` : fileName;
          
          // 设置必要的元数据
          file.meta = {
            ...file.meta,
            bucketName: bucket,
            objectName: objectPath,
            contentType: file.type,
            cacheControl: 3600,
          };
        });
        
        // 上传完成处理
        uppy.on("complete", (result) => {
          if (result.successful && result.successful.length > 0) {
            const uploadedFiles: UploadedFile[] = result.successful.map(file => {
              // 确保所有必要字段都存在
              const objectName = file.meta?.objectName as string || '';
              return {
                id: file.id,
                name: file.name || '未命名文件',
                type: file.type || 'application/octet-stream',
                size: typeof file.size === 'number' ? file.size : 0,
                path: objectName,
                url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${objectName}`,
                uploadedAt: new Date(),
              };
            });
            
            if (onUploadComplete) {
              onUploadComplete(uploadedFiles);
            }
          }
        });
        
        // 保存实例引用
        uppyRef.current = uppy;
        setIsInitialized(true);
        setError(null);
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        console.error("Uppy 初始化错误:", errorObj);
        setError(errorObj);
        if (onUploadError) onUploadError(errorObj);
      }
    };
    
    // 初始化
    initUppy();
    
    // 组件卸载时清理
    return () => {
      if (uppyRef.current) {
        try {
          uppyRef.current.cancelAll();
          uppyRef.current = null;
        } catch (e) {
          console.error("清理 Uppy 错误:", e);
        }
      }
    };
  }, [bucket, folder, multiple, maxFileSize, allowedFileTypes, chunkSize, autoStart, onUploadComplete, onUploadError, tusEndpoint]);
  
  // 认证令牌变更时更新 Tus 插件头部
  useEffect(() => {
    if (uppyRef.current && accessToken) {
      const tusPlugin = uppyRef.current.getPlugin("Tus-Uploader");
      if (tusPlugin && "setOptions" in tusPlugin) {
        // 更新认证令牌
        (tusPlugin as any).setOptions({
          headers: {
            Authorization: `Bearer ${accessToken}`,
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
            "x-upsert": "true",
          },
        });
      }
    }
  }, [accessToken]);
  
  // 添加文件
  const addFile = useCallback((file: File): string | null => {
    if (!uppyRef.current) return null;
    try {
      const fileId = uppyRef.current.addFile({
        name: file.name,
        type: file.type,
        data: file,
      });
      return fileId;
    } catch (err) {
      console.error("添加文件错误:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  }, []);
  
  // 添加多个文件
  const addFiles = useCallback((files: File[]): (string | null)[] => {
    return files.map(file => addFile(file));
  }, [addFile]);
  
  // 移除文件
  const removeFile = useCallback((fileId: string) => {
    if (uppyRef.current) {
      uppyRef.current.removeFile(fileId);
    }
  }, []);
  
  // 开始上传
  const startUpload = useCallback(async (): Promise<UploadedFile[]> => {
    return new Promise((resolve, reject) => {
      if (!uppyRef.current) {
        reject(new Error("Uppy 未初始化"));
        return;
      }
      
      const completeListener = (result: any) => {
        const files: UploadedFile[] = result.successful?.map((file: any) => {
          const objectName = file.meta?.objectName as string || '';
          return {
            id: file.id,
            name: file.name || '未命名文件',
            type: file.type || 'application/octet-stream',
            size: typeof file.size === 'number' ? file.size : 0,
            path: objectName,
            url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${objectName}`,
            uploadedAt: new Date(),
          };
        }) || [];
        
        // 解绑监听器
        if (uppyRef.current) {
          uppyRef.current.off('complete', completeListener);
          uppyRef.current.off('error', errorListener);
        }
        
        resolve(files);
      };
      
      const errorListener = (error: any) => {
        // 解绑监听器
        if (uppyRef.current) {
          uppyRef.current.off('complete', completeListener);
          uppyRef.current.off('error', errorListener);
        }
        
        reject(error);
      };
      
      // 添加一次性监听器
      uppyRef.current.once('complete', completeListener);
      uppyRef.current.once('error', errorListener);
      
      // 开始上传
      uppyRef.current.upload();
    });
  }, [bucket]);
  
  // 取消上传
  const cancelUpload = useCallback((fileId?: string) => {
    if (!uppyRef.current) return;
    
    if (fileId) {
      uppyRef.current.removeFile(fileId);
    } else {
      uppyRef.current.cancelAll();
    }
  }, []);
  
  // 重试上传
  const retryUpload = useCallback((fileId: string) => {
    if (uppyRef.current) {
      uppyRef.current.retryUpload(fileId);
    }
  }, []);
  
  // 清除所有文件
  const clearAll = useCallback(() => {
    if (uppyRef.current) {
      uppyRef.current.cancelAll();
      const files = uppyRef.current.getFiles();
      files.forEach(file => {
        uppyRef.current?.removeFile(file.id);
      });
    }
  }, []);
  
  return {
    uppy: uppyRef.current,
    isInitialized,
    error,
    isAuthenticated,
    addFile,
    addFiles,
    removeFile,
    startUpload,
    cancelUpload,
    retryUpload,
    clearAll,
  };
} 