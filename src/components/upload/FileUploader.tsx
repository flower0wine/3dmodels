"use client";

import React, { useEffect, useRef, useState } from "react";
import Uppy from "@uppy/core";
import { Dashboard } from "@uppy/react";
import Tus from "@uppy/tus";
import Webcam from "@uppy/webcam";
import ScreenCapture from "@uppy/screen-capture";
import ImageEditor from "@uppy/image-editor";
import { createClient } from "@/lib/supabase/client";

// 导入需要的样式
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import "@uppy/webcam/dist/style.min.css";
import "@uppy/screen-capture/dist/style.min.css";
import "@uppy/image-editor/dist/style.min.css";

export interface FileUploaderProps {
  bucket?: string;
  folder?: string;
  multiple?: boolean;
  maxFileSize?: number; // 单位：MB
  allowedFileTypes?: string[];
  onUploadComplete?: (files: any[]) => void;
  onUploadError?: (error: Error) => void;
  width?: string;
  height?: string;
  note?: string;
  className?: string;
  chunkSize?: number; // 分块大小，单位 MB
}

export function FileUploader({
  bucket = "uploads",
  folder = "",
  multiple = true,
  maxFileSize = 500, // 默认500MB，适合大文件
  allowedFileTypes = ["image/*", "video/*", "audio/*", "application/pdf", "model/*", ".glb", ".gltf", ".obj", ".fbx", ".stl"],
  onUploadComplete,
  onUploadError,
  width = "100%",
  height = "400px",
  note = "支持拖拽上传大文件，支持断点续传",
  className = "",
  chunkSize = 6, // 默认6MB分块
}: FileUploaderProps) {
  const uppyInstance = useRef<Uppy | null>(null);

  useEffect(() => {
    // 确保只在客户端初始化
    if (typeof window !== "undefined") {
      // 获取 Supabase URL 和 Key 从环境变量
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      
      // 从 URL 中提取项目 ID
      const id = url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || '';

      // 初始化 Supabase 客户端
      const supabase = createClient();
      
      // 创建 Uppy 实例
      uppyInstance.current = new Uppy({
        id: "uppy",
        autoProceed: false,
        allowMultipleUploadBatches: true,
        debug: process.env.NODE_ENV === 'development',
        restrictions: {
          maxFileSize: maxFileSize * 1024 * 1024, // 转换为字节
          maxNumberOfFiles: multiple ? null : 1,
          minNumberOfFiles: 1,
          allowedFileTypes: allowedFileTypes,
        },
      });

      // 获取当前用户的访问令牌
      supabase.auth.getSession().then(({ data }) => {
        const accessToken = data?.session?.access_token || key;
        
        // 设置可恢复上传的端点
        const supabaseStorageURL = `https://${id}.supabase.co/storage/v1/upload/resumable`;
        
        // 使用 Tus 插件实现可恢复上传
        uppyInstance.current?.use(Tus, {
          endpoint: supabaseStorageURL,
          headers: {
            authorization: `Bearer ${accessToken}`,
            apikey: key,
            'x-upsert': 'true', // 如果文件已存在则覆盖
          },
          uploadDataDuringCreation: true,
          chunkSize: chunkSize * 1024 * 1024, // 分块大小，单位字节
          allowedMetaFields: ['bucketName', 'objectName', 'contentType', 'cacheControl'],
          retryDelays: [0, 3000, 5000, 10000, 20000], // 上传失败后的重试延迟
          removeFingerprintOnSuccess: true, // 上传成功后删除指纹，允许重新上传同一个文件
          onError: function (error) {
            console.error('上传失败:', error);
            if (onUploadError) {
              onUploadError(error);
            }
          },
        });

        // 添加文件时设置 Supabase 元数据
        uppyInstance.current?.on('file-added', (file) => {
          // 为每个文件生成唯一的路径
          const timestamp = new Date().getTime();
          const random = Math.random().toString(36).substring(2, 10);
          const fileName = `${timestamp}_${random}_${file.name}`;
          
          const objectName = folder ? `${folder}/${fileName}` : fileName;
          
          const supabaseMetadata = {
            bucketName: bucket,
            objectName: objectName,
            contentType: file.type,
            cacheControl: 3600, // 缓存控制，单位秒
          };

          file.meta = {
            ...file.meta,
            ...supabaseMetadata,
          };

          console.log('文件已添加', file);
        });
      });

      // 添加图像编辑器
      uppyInstance.current.use(ImageEditor, {
        quality: 0.8,
        cropperOptions: {
          viewMode: 1,
          background: false,
          autoCropArea: 1,
          responsive: true,
        },
      });

      // 添加网络摄像头
      uppyInstance.current.use(Webcam, {
        modes: ["picture"],
        mirror: true,
      });

      // 添加屏幕捕获
      uppyInstance.current.use(ScreenCapture, {
        displayMediaConstraints: {
          video: {
            width: 1280,
            height: 720,
            frameRate: 30,
          },
        },
      });

      // 处理上传完成事件
      uppyInstance.current.on("complete", (result) => {
        const files = result.successful.map(file => {
          const objectName = file.meta.objectName;
          return {
            id: file.id,
            name: file.name,
            type: file.type,
            size: file.size,
            path: objectName,
            url: `${url}/storage/v1/object/public/${bucket}/${objectName}`,
            uploadedAt: new Date(),
          };
        });

        if (onUploadComplete) {
          onUploadComplete(files);
        }
      });
    }
  }, [bucket, folder, multiple, maxFileSize, allowedFileTypes, onUploadComplete, onUploadError, chunkSize]);

  return (
    <div className={`uppy-file-uploader ${className}`} style={{ width, height }}>
      {uppyInstance.current && (
        <Dashboard
          uppy={uppyInstance.current}
          plugins={["Webcam", "ScreenCapture", "ImageEditor"]}
          width="100%"
          height="100%"
          showProgressDetails={true}
          note={note}
          proudlyDisplayPoweredByUppy={false}
          showRemoveButtonAfterComplete={true}
          metaFields={[
            { id: "name", name: "名称", placeholder: "文件名称" },
            { id: "caption", name: "描述", placeholder: "添加文件描述" },
          ]}
          locale={{
            strings: {
              // 中文本地化
              dropPasteFiles: '拖放文件或%{browseFiles}',
              browseFiles: '浏览文件',
              uploadComplete: '上传完成',
              uploadPaused: '上传暂停',
              resumeUpload: '恢复上传',
              pauseUpload: '暂停上传',
              retryUpload: '重试上传',
              cancelUpload: '取消上传',
              addMoreFiles: '添加更多文件',
              addingMoreFiles: '正在添加更多文件',
              processingXFiles: {
                0: '正在处理 %{smart_count} 个文件',
                1: '正在处理 %{smart_count} 个文件',
              },
            },
          }}
        />
      )}
    </div>
  );
} 