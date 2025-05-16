"use client";

import { useRef, Suspense, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { 
  OrbitControls, 
  PerspectiveCamera, 
  useGLTF,
  Center,
  Environment,
  Stage,
  Loader,
  useProgress,
  Html,
  Stats
} from "@react-three/drei";
import * as THREE from "three";
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

interface ModelViewerProps {
  modelUrl: string;
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

// GLTF模型组件
function GltfModel({ 
  modelUrl, 
  rotationSpeed = 0.005,
  onError
}: { 
  modelUrl: string, 
  rotationSpeed?: number,
  onError?: (message: string) => void
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [error, setError] = useState<boolean>(false);
  const { camera } = useThree();

  // 使用错误处理加载GLTF
  const result = useGLTF(modelUrl, true, undefined, (e: any) => {
    console.error('Error loading GLTF:', e);
    setError(true);
    if (onError) onError(`加载GLTF模型失败: ${e?.message || '未知错误'}`);
  });

  const { scene } = result;

  // 如果加载失败，直接返回空
  if (error || !scene) {
    return null;
  }

  // 克隆场景以避免修改原始对象
  const model = useMemo(() => scene.clone(), [scene]);
  
  // 自动调整相机位置
  useEffect(() => {
    if (model) {
      // 计算模型的边界框
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      
      // 根据模型大小调整相机位置
      const maxDim = Math.max(size.x, size.y, size.z);
      
      // 确保相机是透视相机
      if (camera instanceof THREE.PerspectiveCamera) {
        const fov = camera.fov * (Math.PI / 180);
        let cameraDistance = maxDim / (2 * Math.tan(fov / 2));
        
        // 移动设备上距离略微增加，以显示更多全景
        const isMobile = window.innerWidth < 640;
        if (isMobile) {
          cameraDistance *= 1.2;
        }
        
        // 设置相机位置
        camera.position.set(
          center.x + cameraDistance,
          center.y + cameraDistance,
          center.z + cameraDistance
        );
        camera.lookAt(center);
        camera.updateProjectionMatrix();
      }
    }
  }, [model, camera]);
  
  // 确保模型以正确的方向显示
  useFrame(() => {
    if (groupRef.current && rotationSpeed > 0) {
      groupRef.current.rotation.y += rotationSpeed;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={model} scale={1} />
    </group>
  );
}

// 自动调整模型缩放比例的容器
function ModelContainer({ 
  modelUrl, 
  rotationSpeed,
  environment = "city",
  onError
}: { 
  modelUrl: string, 
  rotationSpeed: number,
  environment?: string,
  onError?: (message: string) => void
}) {
  const { width } = useWindowSize();
  const isMobile = width <= 640;

  return (
    <Stage 
      environment={environment as any} 
      intensity={0.6} 
      adjustCamera={false}
      shadows={!isMobile} // 移动设备禁用阴影以提高性能
      preset="rembrandt"
    >
      <Suspense fallback={<LoadingIndicator />}>
        <Center>
          <GltfModel modelUrl={modelUrl} rotationSpeed={rotationSpeed} onError={onError} />
        </Center>
      </Suspense>
    </Stage>
  );
}

// 场景容器组件
export default function ModelViewer({
  modelUrl,
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
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <PerspectiveCamera makeDefault position={[0, 0, 6]} />
        
        <ModelContainer 
          modelUrl={modelUrl} 
          rotationSpeed={rotationSpeed}
          environment={environment}
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
        <Environment preset={environment as any} />
        
        {/* 仅在开发模式下显示性能监控 */}
        {process.env.NODE_ENV === 'development' && <Stats />}
      </Canvas>
      <Loader />
    </div>
  );
} 