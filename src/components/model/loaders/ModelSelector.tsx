"use client";

import { useMemo, useState, useRef, Suspense, useEffect } from "react";
import { Html } from "@react-three/drei";
import GltfModelLoader from "./GltfModelLoader";
import ObjModelLoader from "./ObjModelLoader";
import FbxModelLoader from "./FbxModelLoader";
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';

// 模型格式类型
export type ModelFormat = "gltf" | "glb" | "obj" | "fbx" | "stl" | "unknown";

interface ModelSelectorProps {
  modelUrl: string;
  format?: ModelFormat; // 可选的显式格式指定
  rotationSpeed?: number;
  onError?: (message: string) => void;
  maxRetries?: number; // 可选的最大重试次数
  retryDelay?: number; // 可选的重试延迟时间(毫秒)
}

// 模型缓存系统
const preloadedModels = new Set<string>();

// 预加载模型
export function preloadModel(url: string, format?: ModelFormat): Promise<void> {
  // 如果已经预加载了，则直接返回
  if (preloadedModels.has(url)) {
    return Promise.resolve();
  }
  
  // 如果未指定格式，从URL自动检测
  const modelFormat = format || detectModelFormat(url);
  
  // 根据不同格式使用不同的预加载方法
  let preloadPromise: Promise<void>;
  
  switch (modelFormat) {
    case 'fbx':
      preloadPromise = FbxModelLoader.preload(url);
      break;
    case 'gltf':
    case 'glb':
      if (typeof GltfModelLoader.preload === 'function') {
        preloadPromise = Promise.resolve(GltfModelLoader.preload(url));
      } else {
        preloadPromise = Promise.resolve();
      }
      break;
    case 'obj':
      if (typeof ObjModelLoader.preload === 'function') {
        preloadPromise = ObjModelLoader.preload(url);
      } else {
        preloadPromise = Promise.resolve();
      }
      break;
    default:
      // 其他格式暂不支持预加载
      preloadPromise = Promise.resolve();
  }
  
  return preloadPromise.then(() => {
    preloadedModels.add(url);
  });
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

// 错误边界回退组件
function ModelErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <LoadingError message={`模型加载失败: ${error.message || '未知错误'}`} />
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

// 模型加载器组件
function ModelLoader({
  modelUrl,
  modelFormat,
  rotationSpeed,
  onError,
  maxRetries,
  retryDelay
}: {
  modelUrl: string,
  modelFormat: ModelFormat,
  rotationSpeed: number,
  onError?: (message: string) => void,
  maxRetries?: number,
  retryDelay?: number
}) {
  const [error, setError] = useState<string>('');
  // 使用ref记录错误回调是否已经被调用
  const errorReported = useRef<boolean>(false);
  // 使用ref记录组件是否已挂载
  const isMounted = useRef<boolean>(false);
  
  // 组件挂载状态跟踪
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // 处理模型加载错误
  const handleError = (message: string) => {
    // 仅在组件已挂载且未报告错误时设置状态
    if (isMounted.current && !errorReported.current) {
      errorReported.current = true;
      setError(message);
      
      // 异步调用外部错误处理函数
      if (onError) {
        // 使用RAF代替setTimeout，避免在组件卸载后执行
        requestAnimationFrame(() => {
          if (isMounted.current) {
            onError(message);
          }
        });
      }
    }
  };

  // 显示错误信息
  if (error) {
    return <LoadingError message={error} />;
  }

  // 根据格式选择适当的加载器
  switch (modelFormat) {
    case 'gltf':
    case 'glb':
      return (
        <GltfModelLoader 
          modelUrl={modelUrl}
          rotationSpeed={rotationSpeed} 
          onError={handleError}
          maxRetries={maxRetries}
          retryDelay={retryDelay}
        />
      );
    
    case 'obj':
      return (
        <ObjModelLoader
          modelUrl={modelUrl}
          rotationSpeed={rotationSpeed}
          onError={handleError}
          maxRetries={maxRetries}
          retryDelay={retryDelay}
        />
      );
      
    case 'fbx':
      return (
        <FbxModelLoader
          modelUrl={modelUrl}
          rotationSpeed={rotationSpeed}
          onError={handleError}
          maxRetries={maxRetries}
          retryDelay={retryDelay}
        />
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

export default function ModelSelector({
  modelUrl,
  format,
  rotationSpeed = 0.005,
  onError,
  maxRetries,
  retryDelay
}: ModelSelectorProps) {
  // 使用ref记录错误回调是否已经被调用
  const errorReported = useRef<boolean>(false);
  // 使用ref记录组件是否已挂载
  const isMounted = useRef<boolean>(false);
  
  // 组件挂载状态跟踪
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // 如果未提供格式，从URL自动检测
  const modelFormat = useMemo(() => 
    format || detectModelFormat(modelUrl), 
  [format, modelUrl]);
  
  // 当模型URL变化时尝试预加载
  useEffect(() => {
    // 尝试预加载当前模型
    preloadModel(modelUrl, modelFormat)
      .catch(err => console.warn('模型预加载失败:', err));
  }, [modelUrl, modelFormat]);

  return (
    <ErrorBoundary 
      FallbackComponent={ModelErrorFallback}
      onError={(error: Error) => {
        // 仅在组件已挂载且未报告错误时调用回调
        if (isMounted.current && !errorReported.current) {
          console.error("模型加载错误:", error);
          errorReported.current = true;
          
          // 异步调用外部错误处理函数
          if (onError) {
            // 使用RAF代替setTimeout，避免在组件卸载后执行
            requestAnimationFrame(() => {
              if (isMounted.current) {
                onError(`模型加载失败: ${error.message || '未知错误'}`);
              }
            });
          }
        }
      }}
    >
      <Suspense fallback={null}>
        <ModelLoader 
          modelUrl={modelUrl}
          modelFormat={modelFormat}
          rotationSpeed={rotationSpeed}
          onError={onError}
          maxRetries={maxRetries}
          retryDelay={retryDelay}
        />
      </Suspense>
    </ErrorBoundary>
  );
} 