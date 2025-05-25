"use client";

import { useState, useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { 
  OrbitControls, 
  PerspectiveCamera,
  Center,
  Loader,
  Stats,
  Environment
} from "@react-three/drei";
import ModelSelector, { ModelFormat } from "./loaders/ModelSelector";
import * as THREE from 'three';

// 环境预设类型
type EnvironmentPreset = "sunset" | "dawn" | "night" | "warehouse" | "forest" | "apartment" | "studio" | "city" | "park" | "lobby";

interface ModelViewerProps {
  modelUrl: string;
  format?: ModelFormat; // 可选的模型格式，如果不提供则自动检测
  environment?: EnvironmentPreset;
  backgroundColor?: string;
  onError?: (error: Error) => void;
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

// WebGL上下文监控组件
function WebGLContextMonitor({ onError }: { onError?: (error: Error) => void }) {
  const { gl } = useThree();
  
  useEffect(() => {
    // 监听WebGL上下文丢失事件
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.warn('WebGL上下文丢失');
      if (onError) onError(new Error('WebGL上下文丢失，请刷新页面'));
    };
    
    // 监听WebGL上下文恢复事件
    const handleContextRestored = () => {
      console.log('WebGL上下文已恢复');
    };
    
    // 获取WebGL画布
    const canvas = gl.domElement;
    canvas.addEventListener('webglcontextlost', handleContextLost as EventListener, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false);
    
    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost as EventListener);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [gl, onError]);
  
  return null;
}

// 场景设置组件
function SceneSetup({ 
  environment = "city"
}: {
  environment: EnvironmentPreset
}) {
  return (
    <>
      {/* 背景色设置 */}
      <color attach="background" args={["#303030"]} />
      
      {/* 灯光设置 */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.2}
        castShadow 
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.7} />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={0.2}
        intensity={1}
        castShadow
      />
      
      {/* 环境光照 - 设置background={false}避免替换背景 */}
      <Environment preset={environment} background={true} />
    </>
  );
}

// 自动调整模型缩放比例的容器
function ModelContainer({ 
  modelUrl, 
  format,
  onProgress,
  onError
}: { 
  modelUrl: string,
  format?: ModelFormat,
  onProgress?: (progress: number) => void,
  onError?: (error: Error) => void
}) {
  return (
    <Center>
      <ModelSelector
        modelUrl={modelUrl}
        format={format}
        onProgress={onProgress}
        onError={onError}
      />
    </Center>
  );
}

// 场景容器组件
export default function ModelViewer({
  modelUrl,
  format,
  environment = "city",
  backgroundColor = "#303030",
  onError
}: ModelViewerProps) {
  // 响应式状态
  const { width } = useWindowSize();
  const isMobile = width <= 640;
  const isTablet = width > 640 && width <= 1024;
  
  // 加载进度状态
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // 使用ref跟踪Canvas实例
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 处理WebGL错误
  const handleWebGLError = (error: Error) => {
    console.error('WebGL错误:', error);
    if (onError) onError(error);
  };
  
  // 处理模型加载进度
  const handleModelProgress = (progress: number) => {
    setLoadingProgress(progress);
    setIsLoading(progress < 100);
  };
  
  // 处理模型加载错误
  const handleModelError = (error: Error) => {
    setIsLoading(false);
    if (onError) onError(error);
  };
  
  // 监听环境切换，清理不需要的资源
  useEffect(() => {
    // 预加载环境贴图
    const originalOnError = THREE.DefaultLoadingManager.onError;
    
    THREE.DefaultLoadingManager.onError = (url) => {
      console.error('资源加载失败:', url);
      if (onError) onError(new Error(`环境贴图加载失败: ${environment}`));
    };
    
    // 清理函数
    return () => {
      THREE.DefaultLoadingManager.onError = originalOnError;
    };
  }, [environment, onError]);

  return (
    <div className="h-full w-full relative" style={{ backgroundColor }}>
      <Canvas 
        ref={canvasRef}
        gl={{ 
          antialias: !isMobile, // 移动设备禁用抗锯齿提高性能
          powerPreference: 'high-performance', 
          alpha: false, // 禁用透明度以确保背景色显示
          preserveDrawingBuffer: true, // 帮助处理上下文丢失
          failIfMajorPerformanceCaveat: false // 即使性能不佳也尝试创建上下文
        }}
        dpr={isMobile ? 1 : (isTablet ? [1, 1.5] : [1, 2])} // 根据设备类型调整DPR
        performance={{ min: 0.5 }} // 性能控制
        shadows
        onCreated={({ gl }) => {
          // 配置渲染器
          gl.setClearColor(new THREE.Color(backgroundColor), 1);
          // 设置像素比以避免在高DPI显示器上出现问题
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }}
      >
        {/* WebGL上下文监控 */}
        <WebGLContextMonitor onError={handleWebGLError} />
        
        {/* 场景设置 */}
        <SceneSetup environment={environment} />
        
        {/* 相机设置 */}
        <PerspectiveCamera makeDefault position={[0, 5, 10]} />
        
        {/* 模型容器 */}
        <ModelContainer 
          modelUrl={modelUrl}
          format={format}
          onProgress={handleModelProgress}
          onError={handleModelError}
        />
        
        {/* 控制器 */}
        <OrbitControls 
          enableZoom={true} 
          enablePan={true} 
          enableDamping={true}
          dampingFactor={0.05}
          minDistance={2}
          maxDistance={30}
          // 移动设备上降低交互阻尼，使旋转更流畅
          rotateSpeed={isMobile ? 1.2 : 1}
          // 移动设备上增加缩放速度
          zoomSpeed={isMobile ? 1.5 : 1}
        />
        
        {/* 仅在开发模式下显示性能监控 */}
        {process.env.NODE_ENV === 'development' && <Stats />}
      </Canvas>
      
      {/* 加载进度指示器 - 显示在Canvas外部 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/80 dark:bg-gray-800/80 p-4 rounded-lg shadow-lg flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="mt-4 font-medium">加载中... {loadingProgress}%</div>
            <div className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
      
      <Loader />
    </div>
  );
} 