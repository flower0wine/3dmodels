"use client";

import { Suspense, lazy } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Html, Center } from "@react-three/drei";

// 懒加载OrbitControls和模型加载器
const OrbitControls = lazy(() => import("@react-three/drei").then(mod => ({ default: mod.OrbitControls })));
const ViewerGLTFModel = lazy(() => import("@/components/viewer/ViewerGLTFModel"));

interface ViewerModelProps {
  modelUrl: string;
  fileFormat: string;
}

function Loader() {
  return (
    <Html center>
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-2">加载中...</span>
      </div>
    </Html>
  );
}

export default function ViewerModel({ modelUrl, fileFormat }: ViewerModelProps) {
  // 只支持glTF/GLB格式，其他格式需要添加额外的加载器
  const supportedFormats = ['glb', 'gltf'];
  
  if (!supportedFormats.includes(fileFormat.toLowerCase())) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-zinc-800 rounded-lg p-4">
        <div className="text-center">
          <p className="mb-2">不支持的文件格式: {fileFormat}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">目前仅支持 GLB 和 GLTF 格式</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96 w-full bg-gray-100 dark:bg-zinc-800 rounded-lg">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Suspense fallback={<Loader />}>
          <Center>
            <ViewerGLTFModel url={modelUrl} />
          </Center>
          <Environment preset="city" />
        </Suspense>
        <Suspense fallback={null}>
          <OrbitControls enableZoom={true} enablePan={true} autoRotate={false} />
        </Suspense>
      </Canvas>
    </div>
  );
} 