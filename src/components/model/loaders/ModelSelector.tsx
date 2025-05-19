"use client";

import { useMemo, useState, Suspense } from "react";
import { Html } from "@react-three/drei";
import GltfModelLoader from "./GltfModelLoader";
import ObjModelLoader from "./ObjModelLoader";
import FbxModelLoader from "./FbxModelLoader";

// 模型格式类型
export type ModelFormat = "gltf" | "glb" | "obj" | "fbx" | "stl" | "unknown";

interface ModelSelectorProps {
  modelUrl: string;
  format?: ModelFormat; // 可选的显式格式指定
  rotationSpeed?: number;
  onError?: (message: string) => void;
}

// 加载错误占位组件
function LoadingError({ message }: { message: string }) {
  return (
    <Html center>
      <div className="bg-red-100 p-4 rounded-lg shadow-lg max-w-xs text-center">
        <svg className="w-8 h-8 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-sm font-semibold text-red-800 mb-2">加载错误</h3>
        <p className="text-xs text-red-700">{message}</p>
      </div>
    </Html>
  );
}

// 检测模型格式
function detectModelFormat(url: string): ModelFormat {
  const extension = url.split('.').pop()?.toLowerCase() || '';
  
  switch (extension) {
    case 'gltf':
      return 'gltf';
    case 'glb':
      return 'glb';
    case 'obj':
      return 'obj';
    case 'fbx':
      return 'fbx';
    case 'stl':
      return 'stl';
    default:
      return 'unknown';
  }
}

export default function ModelSelector({
  modelUrl,
  format,
  rotationSpeed = 0.005,
  onError
}: ModelSelectorProps) {
  // 如果未提供格式，从URL自动检测
  const modelFormat = useMemo(() => 
    format || detectModelFormat(modelUrl), 
  [format, modelUrl]);
  
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // 处理模型加载错误
  const handleError = (message: string) => {
    setErrorMessage(message);
    if (onError) onError(message);
  };

  // 根据格式选择适当的加载器
  switch (modelFormat) {
    case 'gltf':
    case 'glb':
      return (
        <Suspense fallback={null}>
          {errorMessage ? (
            <LoadingError message={errorMessage} />
          ) : (
            <GltfModelLoader 
              modelUrl={modelUrl}
              rotationSpeed={rotationSpeed} 
              onError={handleError}
            />
          )}
        </Suspense>
      );
    
    case 'obj':
      return (
        <Suspense fallback={null}>
          {errorMessage ? (
            <LoadingError message={errorMessage} />
          ) : (
            <ObjModelLoader
              modelUrl={modelUrl}
              rotationSpeed={rotationSpeed}
              onError={handleError}
            />
          )}
        </Suspense>
      );
      
    case 'fbx':
      return (
        <Suspense fallback={null}>
          {errorMessage ? (
            <LoadingError message={errorMessage} />
          ) : (
            <FbxModelLoader
              modelUrl={modelUrl}
              rotationSpeed={rotationSpeed}
              onError={handleError}
            />
          )}
        </Suspense>
      );
      
    case 'stl':
      // 目前STL加载器未实现，可以在后续添加
      return (
        <LoadingError message="暂不支持STL格式，请使用GLTF、OBJ或FBX格式" />
      );
      
    default:
      return (
        <LoadingError message={`不支持的模型格式: ${modelFormat}`} />
      );
  }
} 