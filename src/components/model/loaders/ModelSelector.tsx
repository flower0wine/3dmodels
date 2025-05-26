"use client";

import { Suspense } from "react";
import FbxModelLoader from "@/components/model/loaders/FbxModelLoader";
import GlbModelLoader from "@/components/model/loaders/GlbModelLoader";

// 模型格式类型
export type ModelFormat = "gltf" | "glb" | "obj" | "fbx" | "stl" | "unknown";

interface ModelSelectorProps {
  modelUrl: string;
  format?: ModelFormat;
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
}

export default function ModelSelector({
  modelUrl,
  format,
  onProgress,
  onError
}: ModelSelectorProps) {
  // 处理加载进度
  const handleProgress = (progress: number) => {
    onProgress?.(progress);
  };
  
  // 处理加载错误
  const handleError = (error: Error) => {
    onError?.(error);
  };

  return (
    <Suspense fallback={null}>
      {(format === "glb" || format === "gltf") && (
        <GlbModelLoader
          modelUrl={modelUrl}
          onProgress={handleProgress}
          onError={handleError}
        />
      )}
      {format === "fbx" && (
        <FbxModelLoader
          modelUrl={modelUrl}
          onProgress={handleProgress}
          onError={handleError}
        />
      )}
    </Suspense>
  )
} 