"use client";

import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { 
  OrbitControls, 
  PerspectiveCamera,
  Center,
  Environment,
  Loader,
  useProgress,
  Html,
  Stats
} from "@react-three/drei";
import ModelSelector, { ModelFormat } from "./loaders/ModelSelector";

interface ModelViewerProps {
  modelUrl: string;
  format?: ModelFormat; // 可选的模型格式，如果不提供则自动检测
  rotationSpeed?: number;
  environment?: string;
  onError?: (message: string) => void;
}

// 简单的响应式检测函数
function useWindowSize() {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });
  
  useEffect(() => {
    function handleResize() {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);
  
  return size;
}

// 加载进度组件
function LoadingIndicator() {
  const { progress, active, item } = useProgress();
  const { width } = useWindowSize();
  const isMobile = width <= 640;

  return (
    <Html center>
      <div className={`flex flex-col items-center justify-center bg-white dark:bg-gray-800 ${isMobile ? 'p-3' : 'p-5'} rounded-lg shadow-lg`}>
        <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} border-4 border-blue-500 border-t-transparent rounded-full animate-spin`}></div>
        <p className={`mt-3 ${isMobile ? 'text-xs' : 'text-sm'} text-gray-700 dark:text-gray-300`}>
          {active ? `加载中...${Math.round(progress)}%` : '准备场景...'}
        </p>
        {item && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">
            {item}
          </p>
        )}
      </div>
    </Html>
  );
}

// 自动调整模型缩放比例的容器
function ModelContainer({ 
  modelUrl, 
  format,
  rotationSpeed,
  onError
}: { 
  modelUrl: string,
  format?: ModelFormat,
  rotationSpeed: number,
  onError?: (message: string) => void
}) {
  return (
    <Suspense fallback={<LoadingIndicator />}>
      <Center>
        <ModelSelector 
          modelUrl={modelUrl} 
          format={format}
          rotationSpeed={rotationSpeed} 
          onError={onError}
        />
      </Center>
    </Suspense>
  );
}

// 场景容器组件
export default function ModelViewer({
  modelUrl,
  format,
  rotationSpeed = 0.01,
  environment = "city",
  onError
}: ModelViewerProps) {
  // 记录加载错误
  const handleError = (message: string) => {
    console.error(`Model loading error: ${message}`);
    if (onError) onError(message);
  };

  // 响应式状态
  const { width } = useWindowSize();
  const isMobile = width <= 640;
  const isTablet = width > 640 && width <= 1024;

  return (
    <div className="h-full w-full relative">
      <Canvas 
        gl={{ 
          antialias: !isMobile, // 移动设备禁用抗锯齿提高性能
          powerPreference: 'high-performance', 
          alpha: true
        }}
        dpr={isMobile ? 1 : (isTablet ? [1, 1.5] : [1, 2])} // 根据设备类型调整DPR
        performance={{ min: 0.5 }} // 性能控制
      >
        {/* 环境光照 - 为整个场景提供基础照明 */}
        <ambientLight intensity={0.3} />
        
        <PerspectiveCamera makeDefault position={[0, 0, 6]} />
        
        <ModelContainer 
          modelUrl={modelUrl}
          format={format}
          rotationSpeed={rotationSpeed}
          onError={handleError}
        />
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={true} 
          enableDamping={true}
          dampingFactor={0.05}
          // 移动设备上降低交互阻尼，使旋转更流畅
          rotateSpeed={isMobile ? 1.2 : 1}
          // 移动设备上增加缩放速度
          zoomSpeed={isMobile ? 1.5 : 1}
        />
        
        {/* 环境贴图 - 提供环境反射和全局照明 */}
        <Environment preset={environment as any} />
        
        {/* 仅在开发模式下显示性能监控 */}
        {process.env.NODE_ENV === 'development' && <Stats />}
      </Canvas>
      <Loader />
    </div>
  );
} 