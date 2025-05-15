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
  modelType?: "gltf" | "obj";
  environment?: string;
  onError?: (message: string) => void;
}

// 加载进度组件
function LoadingIndicator() {
  const { progress, active, item } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 p-5 rounded-lg shadow-lg">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">
          {active ? `加载中...${Math.round(progress)}%` : '准备场景...'}
        </p>
        {item && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">
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
        const cameraDistance = maxDim / (2 * Math.tan(fov / 2));
        
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

// OBJ模型组件 - 专门用于加载OBJ格式
function ObjModel({ 
  modelUrl, 
  rotationSpeed = 0.005,
  onError
}: { 
  modelUrl: string, 
  rotationSpeed?: number,
  onError?: (message: string) => void
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { camera } = useThree();
  
  // 使用OBJLoader加载OBJ文件
  try {
    const obj = useLoader(
      OBJLoader, 
      modelUrl, 
      (loader) => {
        // 配置加载器
        loader.setRequestHeader({ 'Content-Type': 'application/octet-stream' });
      },
      (e) => {
        console.error('Error loading OBJ:', e);
        const errorMsg = '加载OBJ模型失败';
        setError(errorMsg);
        if (onError) onError(errorMsg);
      }
    );

    // 处理加载好的模型
    useEffect(() => {
      if (obj && !error) {
        setLoading(false);
        
        // 自动处理模型大小和位置
        const box = new THREE.Box3().setFromObject(obj);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        
        // 计算合适的缩放比例
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim; // 将模型缩放到适合视图的大小
        
        // 应用缩放
        obj.scale.set(scale, scale, scale);
        
        // 将模型居中
        obj.position.sub(center.multiplyScalar(scale));
        
        // 调整相机位置
        if (camera instanceof THREE.PerspectiveCamera) {
          const fov = camera.fov * (Math.PI / 180);
          const cameraDistance = 2 / Math.tan(fov / 2);
          camera.position.set(0, 0, cameraDistance);
          camera.lookAt(0, 0, 0);
          camera.updateProjectionMatrix();
        }
      }
    }, [obj, error, camera]);
    
    // 进行模型旋转
    useFrame(() => {
      if (groupRef.current && rotationSpeed > 0 && !loading) {
        groupRef.current.rotation.y += rotationSpeed;
      }
    });
    
    if (error) {
      return null;
    }

    return (
      <group ref={groupRef}>
        <primitive object={obj} />
      </group>
    );
  } catch (e) {
    console.error('Exception loading OBJ:', e);
    if (onError) onError('加载OBJ模型时发生异常，文件可能太大或格式不支持');
    return null;
  }
}

// 自动调整模型缩放比例的容器
function ModelContainer({ 
  modelUrl, 
  modelType, 
  rotationSpeed,
  environment = "city",
  onError
}: { 
  modelUrl: string, 
  modelType: "gltf" | "obj", 
  rotationSpeed: number,
  environment?: string,
  onError?: (message: string) => void
}) {
  return (
    <Stage environment={environment as any} intensity={0.6} adjustCamera={false}>
      <Suspense fallback={<LoadingIndicator />}>
        <Center>
          {modelType === "gltf" ? (
            <GltfModel modelUrl={modelUrl} rotationSpeed={rotationSpeed} onError={onError} />
          ) : modelType === "obj" ? (
            <ObjModel modelUrl={modelUrl} rotationSpeed={rotationSpeed} onError={onError} />
          ) : null}
        </Center>
      </Suspense>
    </Stage>
  );
}

// 场景容器组件
export default function ModelViewer({
  modelUrl,
  rotationSpeed = 0.01,
  modelType = "gltf",
  environment = "city",
  onError
}: ModelViewerProps) {
  // 检测URL中的文件类型
  const detectedType = useMemo(() => {
    if (modelUrl?.toLowerCase().endsWith('.obj')) {
      return 'obj';
    } else if (modelUrl?.toLowerCase().endsWith('.glb') || modelUrl?.toLowerCase().endsWith('.gltf')) {
      return 'gltf';
    }
    return modelType;
  }, [modelUrl, modelType]);

  // 记录加载错误
  const handleError = (message: string) => {
    console.error(`Model loading error: ${message}`);
    if (onError) onError(message);
  };

  return (
    <div className="h-full w-full relative">
      <Canvas>
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <PerspectiveCamera makeDefault position={[0, 0, 6]} />
        
        <ModelContainer 
          modelUrl={modelUrl} 
          modelType={detectedType as "gltf" | "obj"} 
          rotationSpeed={rotationSpeed}
          environment={environment}
          onError={handleError}
        />
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={true} 
          enableDamping={true}
          dampingFactor={0.05}
        />
        <Environment preset={environment as any} />
        
        {/* 开发模式下显示性能监控 */}
        {process.env.NODE_ENV === 'development' && <Stats />}
      </Canvas>
      <Loader />
    </div>
  );
} 