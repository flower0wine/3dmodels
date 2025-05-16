"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Model } from "@/types/model";
import ModelViewer from "./ModelViewer";
import { X } from "lucide-react";

interface DrawerModelViewerProps {
  model: Model;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DrawerModelViewer({ 
  model,
  isOpen,
  onOpenChange
}: DrawerModelViewerProps) {
  // 状态管理
  const [rotationSpeed, setRotationSpeed] = useState(0.01);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [autoRetryCount, setAutoRetryCount] = useState(0);
  const maxAutoRetries = 2; // 最大自动重试次数

  // 获取模型URL
  const modelUrl = useMemo(() => {
    // 如果model对象有url属性，则使用该属性
    if (model?.url) {
      return model.url;
    }
    // 否则使用默认路径
    return "/cottage_fbx.fbx";
  }, [model]);

  // 检测模型类型
  const modelType = useMemo(() => {
    return model?.format?.toLowerCase() === "fbx" ? "fbx" : "gltf";
  }, [model?.format]);
  
  // 组件加载时预加载模型 
  useEffect(() => {
    if (isOpen) {
      // 重置状态
      setIsLoading(true);
      setErrorMessage(null);
      setAutoRetryCount(0);
      
      const preloadModel = async () => {
        try {
          console.log("正在预加载模型:", modelUrl);
          
          // 检查模型URL是否有效
          if (!modelUrl) {
            throw new Error("模型URL无效");
          }
          
          // 使用fetch预加载模型文件
          const response = await fetch(modelUrl);
          
          if (!response.ok) {
            throw new Error(`模型加载失败 (${response.status}): ${response.statusText}`);
          }
          
          // 短暂延迟以确保加载完成
          setTimeout(() => {
            setIsLoading(false);
          }, 800); // 增加延迟时间
        } catch (error) {
          console.error("预加载模型失败:", error);
          setErrorMessage(
            `预加载模型失败: ${
              error instanceof Error ? error.message : "未知错误"
            }`
          );
          setIsLoading(false);
        }
      };
      
      preloadModel();
    }
  }, [isOpen, modelUrl]);

  // 处理模型加载错误 - 添加自动重试
  const handleModelError = useCallback((message: string) => {
    console.log(`模型加载错误 (尝试 ${autoRetryCount + 1}/${maxAutoRetries + 1}): ${message}`);
    
    // 如果尚未达到最大重试次数，自动重试
    if (autoRetryCount < maxAutoRetries) {
      setAutoRetryCount(prev => prev + 1);
      
      // 短暂延迟后自动重试
      setTimeout(() => {
        console.log(`自动重试加载 (${autoRetryCount + 1}/${maxAutoRetries})`);
        // 通过修改一个key值来强制重新渲染ModelViewer组件
        setRetryKey(Date.now());
      }, 1500); // 延迟1.5秒后重试
    } else {
      // 达到最大重试次数，显示错误
      setErrorMessage(message);
      setIsLoading(false);
    }
  }, [autoRetryCount, maxAutoRetries]);

  // 用于强制重新渲染的key
  const [retryKey, setRetryKey] = useState(Date.now());

  // 手动重试
  const handleRetry = () => {
    setErrorMessage(null);
    setIsLoading(true);
    setAutoRetryCount(0);
    setRetryKey(Date.now()); // 更新key以强制重新渲染
    
    // 延迟后尝试重新加载
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  // 处理空白处点击关闭
  const handleOverlayClick = (e: React.MouseEvent) => {
    // 如果点击的是遮罩层（overlay），则关闭抽屉
    if (e.target === e.currentTarget) {
      onOpenChange(false);
    }
  };

  return (
    <>
      {/* 自定义遮罩层以恢复点击空白处关闭功能 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={handleOverlayClick}
          style={{ pointerEvents: "auto" }}
        />
      )}

      <Drawer
        open={isOpen}
        onOpenChange={onOpenChange}
        direction="right"
        dismissible={false}
        modal={false}
      >
        <DrawerContent className="h-[100vh] !max-w-[none] !w-[80vw] z-50">
          {/* 右上角关闭按钮 */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 z-50 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="关闭"
          >
            <X size={20} />
          </button>

          <DrawerHeader>
            <DrawerTitle className="text-xl flex justify-between items-center">
              <span>{model.name}</span>
            </DrawerTitle>
            <DrawerDescription>
              {model.description || "3D模型预览"} - 作者: {model.author}
            </DrawerDescription>

            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-md text-xs">
              <p className="font-semibold mb-1">操作指南:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>鼠标左键拖动: 旋转模型</li>
                <li>鼠标滚轮: 缩放模型</li>
                <li>鼠标右键拖动: 平移视图</li>
              </ul>
            </div>
          </DrawerHeader>

          <div className="p-4 h-[60vh] relative">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center bg-white dark:bg-gray-800 p-5 rounded-lg shadow-lg">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 text-gray-700 dark:text-gray-300">
                    正在加载模型...
                  </p>
                  {autoRetryCount > 0 && (
                    <p className="mt-2 text-xs text-blue-500">
                      自动重试 ({autoRetryCount}/{maxAutoRetries})
                    </p>
                  )}
                </div>
              </div>
            ) : errorMessage ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-red-100 p-6 rounded-lg shadow-lg max-w-md text-center">
                  <svg
                    className="w-12 h-12 text-red-500 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-red-800 mb-2">
                    加载错误
                  </h3>
                  <p className="text-red-700">{errorMessage}</p>
                  <p className="text-sm text-red-600 mt-4">
                    自动重试 {maxAutoRetries} 次后仍然失败，请手动重试
                  </p>
                </div>
              </div>
            ) : (
              // 使用key强制在每次重试时重新创建组件
              <div key={`model-viewer-${retryKey}`} className="h-full w-full">
                <ModelViewer
                  modelUrl={modelUrl}
                  modelType={modelType}
                  rotationSpeed={rotationSpeed}
                  onError={handleModelError}
                />
              </div>
            )}
          </div>

          <DrawerFooter className="flex flex-col">
            <div className="flex flex-wrap gap-2 mb-2">
              <Button
                variant="outline"
                onClick={() =>
                  setRotationSpeed((prevSpeed) =>
                    prevSpeed === 0.01 ? 0.03 : prevSpeed === 0.03 ? 0 : 0.01
                  )
                }
                size="sm"
                disabled={isLoading || errorMessage !== null}
              >
                {rotationSpeed === 0
                  ? "开始旋转"
                  : rotationSpeed === 0.01
                  ? "加快旋转"
                  : "停止旋转"}
              </Button>

              {errorMessage && (
                <Button variant="outline" onClick={handleRetry} size="sm">
                  重试
                </Button>
              )}
            </div>

            <div className="flex justify-between w-full">
              <span className="text-xs text-gray-500">
                模型格式: {model?.format?.toUpperCase() || "GLB"}
                {autoRetryCount > 0 && ` | 自动重试: ${autoRetryCount}/${maxAutoRetries}`}
              </span>
              <DrawerClose asChild>
                <Button variant="outline" size="sm">
                  关闭
                </Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
} 