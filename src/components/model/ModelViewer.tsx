"use client";

import { useRef, Suspense, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { 
  OrbitControls, 
  PerspectiveCamera, 
  useGLTF,
  Center,
  Stage,
  Loader,
  useProgress,
  Html,
  Stats
} from "@react-three/drei";
import * as THREE from "three";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

interface ModelViewerProps {
  modelUrl: string;
  rotationSpeed?: number;
  modelType?: "gltf" | "fbx";
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
  const [loadAttempt, setLoadAttempt] = useState<number>(0);
  const { camera, gl } = useThree();
  
  // 预加载步骤 - 确保资源准备好
  useEffect(() => {
    // 预热WebGL上下文
    gl.getContext();
    
    // 确保WebGL上下文处于活跃状态
    gl.render(new THREE.Scene(), new THREE.PerspectiveCamera());
    
    return () => {
      // 组件卸载时释放资源
      if (groupRef.current) {
        groupRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.geometry) {
              child.geometry.dispose();
            }
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(m => m.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
      }
    };
  }, [gl]);

  // 加载GLTF模型时使用更可靠的选项
  const gltfOptions = useMemo(() => ({
    draco: false, // 禁用draco压缩，使用标准加载
    meshoptCompression: false, // 禁用meshopt压缩
    useFetch: true, // 使用fetch API进行加载
  }), []);

  // 使用错误处理加载GLTF
  const { scene } = useGLTF(modelUrl, true, gltfOptions, (e: any) => {
    console.error('Error loading GLTF:', e);
    setError(true);
    if (onError) onError(`加载GLTF模型失败: ${e?.message || '未知错误'}`);
  });

  // 如果加载失败，尝试一次重新加载
  useEffect(() => {
    if (error && loadAttempt === 0) {
      // 短暂延迟后重新加载
      const timer = setTimeout(() => {
        setError(false);
        setLoadAttempt(1);
        // 释放缓存，强制重新加载
        useGLTF.clear(modelUrl);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [error, loadAttempt, modelUrl]);

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

// FBX模型组件
function FbxModel({ 
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
  
  // 使用FBXLoader加载模型
  let fbx: THREE.Group | null = null;
  try {
    fbx = useLoader(FBXLoader, modelUrl, undefined, (error) => {
      console.error('Error loading FBX:', error);
      setError(true);
      if (onError) onError(`加载FBX模型失败: ${error?.message || '未知错误'}`);
    });
  } catch (e) {
    console.error('Exception in FBX loading:', e);
    setError(true);
    if (onError && !error) onError(`加载FBX模型异常: ${e instanceof Error ? e.message : '未知错误'}`);
  }

  // 如果加载失败，直接返回空
  if (error || !fbx) {
    return null;
  }

  // 克隆模型以避免修改原始对象
  const model = useMemo(() => fbx!.clone(), [fbx]);
  
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
  
  // 旋转模型
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
  modelType = "gltf",
  onError
}: { 
  modelUrl: string, 
  rotationSpeed: number,
  modelType?: "gltf" | "fbx",
  onError?: (message: string) => void
}) {
  return (
    <>
      <Suspense fallback={<LoadingIndicator />}>
        <Center>
          {modelType === "gltf" ? (
            <GltfModel modelUrl={modelUrl} rotationSpeed={rotationSpeed} onError={onError} />
          ) : (
            <FbxModel modelUrl={modelUrl} rotationSpeed={rotationSpeed} onError={onError} />
          )}
        </Center>
      </Suspense>
    </>
  );
}

// 场景容器组件
export default function ModelViewer({
  modelUrl,
  rotationSpeed = 0.01,
  modelType,
  onError
}: ModelViewerProps) {
  // 检测URL中的文件类型
  const detectedType = useMemo(() => {
    if (modelUrl?.toLowerCase().endsWith('.fbx')) {
      return 'fbx';
    } else {
      return 'gltf'; // 默认使用gltf加载器
    }
  }, [modelUrl]);

  // 使用提供的类型或自动检测的类型
  const finalModelType = modelType || detectedType;
  
  // 记录加载错误
  const handleError = (message: string) => {
    console.error(`Model loading error: ${message}`);
    if (onError) onError(message);
  };

  return (
    <div className="h-full w-full relative">
      <Canvas 
        gl={{ 
          powerPreference: 'default', // 使用默认性能设置，不要强制高性能
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true, // 保留绘图缓冲区，可能有助于解决某些WebGL问题
        }}
        style={{ background: 'transparent' }}
        onCreated={({ gl, scene }) => {
          // 设置初始参数
          gl.setClearColor(0x000000, 0);
          
          // 强制GPU初始化
          gl.render(scene, new THREE.PerspectiveCamera());
        }}
      >
        {/* 增强基本照明 */}
        <ambientLight intensity={1.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <directionalLight position={[0, 10, 0]} intensity={1.0} />
        
        <PerspectiveCamera makeDefault position={[0, 0, 6]} />
        
        <ModelContainer 
          modelUrl={modelUrl} 
          rotationSpeed={rotationSpeed}
          modelType={finalModelType as "gltf" | "fbx"}
          onError={handleError}
        />
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={true} 
          enableDamping={true}
          dampingFactor={0.05}
        />
        
        {/* 开发模式下显示性能监控 */}
        {process.env.NODE_ENV === 'development' && <Stats />}
      </Canvas>
      <Loader />
    </div>
  );
} 