"use client";

import React, { useEffect } from "react";
import { Dashboard } from "@uppy/react";
import { useFileUploader, type FileUploaderOptions, type UploadedFile } from "@/hooks/useFileUploader";

// 导入需要的样式
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import "@uppy/webcam/dist/style.min.css";
import "@uppy/screen-capture/dist/style.min.css";
import "@uppy/image-editor/dist/style.min.css";

export interface UppyFileUploaderProps extends FileUploaderOptions {
  onUploadComplete?: (files: UploadedFile[]) => void;
  onUploadError?: (error: Error) => void;
  width?: string;
  height?: string;
  note?: string;
  className?: string;
  showWebcam?: boolean;
  showScreenCapture?: boolean;
  autoUpload?: boolean;
}

/**
 * Uppy 文件上传组件
 * 
 * 使用方法:
 * ```jsx
 * <UppyFileUploader 
 *   bucket="my-bucket"
 *   folder="uploads"
 *   onUploadComplete={(files) => console.log('上传完成', files)} 
 * />
 * ```
 */
export function UppyFileUploader({
  onUploadComplete,
  onUploadError,
  width = "100%",
  height = "400px",
  note = "支持拖拽上传大文件，支持断点续传",
  className = "",
  showWebcam = true,
  showScreenCapture = true,
  autoUpload = false,
  ...options
}: UppyFileUploaderProps) {
  // 使用文件上传 hook
  const {
    uppy,
    isInitialized,
    error,
    isAuthenticated,
  } = useFileUploader(
    { ...options, autoStart: autoUpload },
    onUploadComplete,
    onUploadError
  );

  // 当发生错误时将错误传递给回调
  useEffect(() => {
    if (error && onUploadError) {
      onUploadError(error);
    }
  }, [error, onUploadError]);

  // 根据启用的插件确定要使用的插件列表
  const enabledPlugins = [];
  if (showWebcam) enabledPlugins.push("Webcam");
  if (showScreenCapture) enabledPlugins.push("ScreenCapture");
  enabledPlugins.push("ImageEditor");

  // 没有登录时显示提示
  if (!isAuthenticated) {
    return (
      <div className="p-4 border border-yellow-400 bg-yellow-50 text-yellow-800 rounded-md">
        未检测到登录状态，文件上传功能可能受限。请先登录后再上传文件。
      </div>
    );
  }

  return (
    <div className={`uppy-file-uploader ${className}`} style={{ width, height }}>
      {uppy && isInitialized ? (
        <Dashboard
          uppy={uppy}
          plugins={enabledPlugins}
          width="100%"
          height="100%"
          showProgressDetails={true}
          note={note}
          showRemoveButtonAfterComplete={true}
          metaFields={[
            { id: "name", name: "名称", placeholder: "文件名称" },
            { id: "caption", name: "描述", placeholder: "添加文件描述" },
          ]}
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">初始化上传组件...</p>
          </div>
        </div>
      )}
    </div>
  );
} 