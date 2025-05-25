"use client";

import { useRef, Suspense, useEffect } from "react";
import FbxModelLoader from "./FbxModelLoader";

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
  // 虽然目前只支持FBX，但保留format参数以便未来扩展
  format = "fbx",
  onProgress,
  onError
}: ModelSelectorProps) {
  // 使用ref记录组件是否已挂载
  const isMounted = useRef<boolean>(false);
  
  // 组件挂载状态跟踪
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // 处理加载进度
  const handleProgress = (progress: number) => {
    if (isMounted.current && onProgress) {
      onProgress(progress);
    }
  };
  
  // 处理加载错误
  const handleError = (error: Error) => {
    if (isMounted.current && onError) {
      onError(error);
    }
  };
  
  // 根据format选择不同的模型加载器
  switch (format) {
    // 目前只实现了FBX格式，未来可以添加其他格式的支持
    case "fbx":
    default:
      return (
        <Suspense fallback={null}>
          <FbxModelLoader 
            modelUrl={modelUrl} 
            onProgress={handleProgress}
            onError={handleError}
          />
        </Suspense>
      );
  }
} 