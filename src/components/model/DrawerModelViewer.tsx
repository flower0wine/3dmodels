"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Model } from "@/types/model";
import ModelViewer from "./ModelViewer";
import { ModelFormat } from "./loaders/ModelSelector";
import { X, Download, Palette } from "lucide-react";
import { download } from "@/lib/utils";

// 导入环境预设类型
type EnvironmentPreset = "sunset" | "dawn" | "night" | "warehouse" | "forest" | "apartment" | "studio" | "city" | "park" | "lobby";

// 环境预设选项
const environmentPresets: { value: EnvironmentPreset; label: string }[] = [
  { value: "city", label: "城市" },
  { value: "sunset", label: "日落" },
  { value: "dawn", label: "黎明" },
  { value: "night", label: "夜晚" },
  { value: "warehouse", label: "仓库" },
  { value: "forest", label: "森林" },
  { value: "apartment", label: "公寓" },
  { value: "studio", label: "工作室" },
  { value: "park", label: "公园" },
  { value: "lobby", label: "大厅" },
];

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [environment, setEnvironment] = useState<EnvironmentPreset>("city");
  const [showEnvironmentSelector, setShowEnvironmentSelector] = useState(false);
  
  // 获取模型URL和格式
  const modelUrl = model.storage_path || "/kitchen-transformed.glb";
  const modelFormat = (model.format?.toLowerCase() || 'glb') as ModelFormat;
  
  // 处理模型加载错误
  const handleModelError = (error: Error) => {
    setErrorMessage(error.message);
  };

  // 处理空白处点击关闭
  const handleOverlayClick = (e: React.MouseEvent) => {
    // 如果点击的是遮罩层（overlay），则关闭抽屉
    if (e.target === e.currentTarget) {
      onOpenChange(false);
    }
  };

  // 切换环境选择器显示状态
  const toggleEnvironmentSelector = () => {
    setShowEnvironmentSelector(prev => !prev);
  };

  // 选择环境预设
  const selectEnvironment = (preset: EnvironmentPreset) => {
    setEnvironment(preset);
    setShowEnvironmentSelector(false);
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
        <DrawerContent className="h-[100vh] !max-w-[none] !w-full sm:!w-[90vw] md:!w-[80vw] lg:!w-[70vw] z-50">
          {/* 右上角关闭按钮 */}
          <button 
            onClick={() => onOpenChange(false)}
            className="absolute right-3 top-3 sm:right-4 sm:top-4 z-50 p-1.5 sm:p-2 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="关闭"
          >
            <X size={18} className="sm:hidden" />
            <X size={20} className="hidden sm:block" />
          </button>
          
          <DrawerHeader className="p-3 sm:p-4 md:p-6">
            <DrawerTitle className="text-lg sm:text-xl flex justify-between items-center">
              <span>{model.name}</span>
            </DrawerTitle>
            <DrawerDescription className="text-xs sm:text-sm">
              {model.description || '3D模型预览'} - 作者: {model.author}
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="p-2 sm:p-4 h-[50vh] sm:h-[55vh] md:h-[60vh] relative">
            {errorMessage ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-red-100 p-4 sm:p-6 rounded-lg shadow-lg max-w-xs sm:max-w-sm md:max-w-md text-center">
                  <svg className="w-8 h-8 sm:w-12 sm:h-12 text-red-500 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <h3 className="text-base sm:text-lg font-semibold text-red-800 mb-2">加载错误</h3>
                  <p className="text-sm text-red-700">{errorMessage}</p>
                  <p className="text-xs sm:text-sm text-red-600 mt-3 sm:mt-4">
                    请确认{modelFormat.toUpperCase()}格式文件是否有效
                  </p>
                </div>
              </div>
            ) : (
              <ModelViewer 
                modelUrl={modelUrl}
                format={modelFormat}
                environment={environment}
                onError={handleModelError}
              />
            )}
          </div>
          
          <DrawerFooter className="flex flex-col p-4 sm:p-6">
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2">
              {/* 场景切换按钮 */}
              <div className="relative">
                <Button 
                  variant="outline"
                  onClick={toggleEnvironmentSelector}
                  size="sm"
                  className="text-xs sm:text-sm px-2 py-1 h-auto sm:h-9 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950"
                >
                  <Palette size={14} className="mr-1" />
                  切换场景
                </Button>
                
                {/* 环境预设选择器 - 显示在按钮上方 */}
                {showEnvironmentSelector && (
                  <div className="absolute z-50 bottom-full mb-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="py-1 max-h-64 overflow-y-auto">
                      {environmentPresets.map((preset) => (
                        <button
                          key={preset.value}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                            environment === preset.value ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''
                          }`}
                          onClick={() => selectEnvironment(preset.value)}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {errorMessage && (
                <Button 
                  variant="outline"
                  onClick={() => setErrorMessage(null)}
                  size="sm"
                  className="text-xs sm:text-sm px-2 py-1 h-auto sm:h-9"
                >
                  重试
                </Button>
              )}
              
              <Button 
                variant="outline"
                onClick={() => {
                  download(model.storage_path, `${model.name}.${model.format}`);
                }}
                size="sm"
                className="text-xs sm:text-sm px-2 py-1 h-auto sm:h-9 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950"
              >
                <Download size={14} className="mr-1" />
                下载模型
              </Button>
            </div>
            
            <div className="flex justify-between w-full items-center mt-2">
              <span className="text-xs text-gray-500">
                模型格式: {model.format.toUpperCase()} | 
                场景: {environmentPresets.find(p => p.value === environment)?.label || "城市"}
              </span>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
} 