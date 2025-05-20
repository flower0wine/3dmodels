"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import * as THREE from "three";

interface ObjModelLoaderProps {
  modelUrl: string;
  rotationSpeed?: number;
  onError?: (message: string) => void;
}

export default function ObjModelLoader({
  modelUrl,
  rotationSpeed = 0.005,
  onError
}: ObjModelLoaderProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [error, setError] = useState<boolean>(false);
  const { camera } = useThree();

  // 使用useLoader加载OBJ模型
  let objModel: THREE.Group | null = null;
  try {
    objModel = useLoader(OBJLoader, modelUrl, undefined, (e) => {
      console.error('加载OBJ模型失败:', e);
      setError(true);
      if (onError) onError(`加载OBJ模型失败: ${e instanceof Error ? e.message : '未知错误'}`);
    });
  } catch (e: any) {
    console.error('加载OBJ模型出错:', e);
    setError(true);
    if (onError) onError(`加载OBJ模型失败: ${e?.message || '未知错误'}`);
  }

  // 如果加载失败，直接返回空
  if (error || !objModel) {
    return null;
  }
  
  // 克隆对象以避免修改原始对象
  const model = useMemo(() => objModel.clone(), [objModel]);
  
  // 自动调整相机位置
  useMemo(() => {
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