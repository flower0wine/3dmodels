"use client";

import { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
  DrawerOverlay,
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
  const [modelType, setModelType] = useState<"gltf" | "obj">("gltf");
  const [environment, setEnvironment] = useState<string>("city");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // 检测模型格式并设置类型
  useEffect(() => {
    if (model.format) {
      const format = model.format.toLowerCase();
      if (format === "obj") {
        setModelType("obj");
      } else {
        setModelType("gltf");
      }
    }
  }, [model.format]);
  
  // 获取模型URL
  // const modelUrl = "/kitchen-transformed.glb";
  const modelUrl = "/IronMan.obj";
  
  // 可用的环境预设
  const environments = [
    { id: "city", name: "城市" },
    { id: "dawn", name: "黎明" },
    { id: "sunset", name: "日落" },
    { id: "night", name: "夜晚" },
    { id: "warehouse", name: "仓库" },
    { id: "forest", name: "森林" },
    { id: "park", name: "公园" }
  ];
  
  // 切换环境
  const cycleEnvironment = () => {
    const currentIndex = environments.findIndex(env => env.id === environment);
    const nextIndex = (currentIndex + 1) % environments.length;
    setEnvironment(environments[nextIndex].id);
  };
  
  // 处理模型加载错误
  const handleModelError = (message: string) => {
    setErrorMessage(message);
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
      
      <Drawer open={isOpen} onOpenChange={onOpenChange} direction="right" dismissible={false} modal={false}>
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
              {model.description || '3D模型预览'} - 作者: {model.author}
            </DrawerDescription>
            
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-md text-xs">
              <p className="font-semibold mb-1">操作指南:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>鼠标左键拖动: 旋转模型</li>
                <li>鼠标滚轮: 缩放模型</li>
                <li>鼠标右键拖动: 平移视图</li>
                <li>双击: 重置视图</li>
              </ul>
            </div>
          </DrawerHeader>
          
          <div className="p-4 h-[60vh] relative">
            {errorMessage ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-red-100 p-6 rounded-lg shadow-lg max-w-md text-center">
                  <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-red-800 mb-2">加载错误</h3>
                  <p className="text-red-700">{errorMessage}</p>
                  <p className="text-sm text-red-600 mt-4">尝试加载其他格式的模型，或确认文件是否有效</p>
                </div>
              </div>
            ) : (
              <ModelViewer 
                modelUrl={modelUrl}
                rotationSpeed={rotationSpeed}
                modelType={modelType}
                environment={environment}
                onError={handleModelError}
              />
            )}
          </div>
          
          <DrawerFooter className="flex flex-col">
            <div className="flex flex-wrap gap-2 mb-2">
              <Button 
                variant="outline"
                onClick={() => setRotationSpeed(prevSpeed => 
                  prevSpeed === 0.01 ? 0.03 : (prevSpeed === 0.03 ? 0 : 0.01)
                )}
                size="sm"
              >
                {rotationSpeed === 0 ? "开始旋转" : (rotationSpeed === 0.01 ? "加快旋转" : "停止旋转")}
              </Button>
              
              <Button 
                variant="outline"
                onClick={cycleEnvironment}
                size="sm"
              >
                环境: {environments.find(env => env.id === environment)?.name || "默认"}
              </Button>
              
              {errorMessage && (
                <Button 
                  variant="outline"
                  onClick={() => setErrorMessage(null)}
                  size="sm"
                >
                  重试
                </Button>
              )}
            </div>
            
            <div className="flex justify-between w-full">
              <span className="text-xs text-gray-500">模型格式: {model.format?.toUpperCase() || "GLTF"}</span>
              <DrawerClose asChild>
                <Button variant="outline" size="sm">关闭</Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
} 