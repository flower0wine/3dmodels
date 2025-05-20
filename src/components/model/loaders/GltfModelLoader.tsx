"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface GltfModelLoaderProps {
  modelUrl: string;
  rotationSpeed?: number;
  onError?: (message: string) => void;
}

export default function GltfModelLoader({
  modelUrl,
  rotationSpeed = 0.005,
  onError
}: GltfModelLoaderProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [error, setError] = useState<boolean>(false);
  const { camera } = useThree();

  // 使用drei的useGLTF加载GLTF模型
  let result: any = null;
  try {
    result = useGLTF(modelUrl, true, undefined, (e: any) => {
      console.error('加载GLTF模型失败:', e);
      setError(true);
      if (onError) onError(`加载GLTF模型失败: ${e?.toString ? e.toString() : '未知错误'}`);
    });
  } catch (e: any) {
    console.error('加载GLTF模型出错:', e);
    setError(true);
    if (onError) onError(`加载GLTF模型失败: ${e?.toString ? e.toString() : '未知错误'}`);
  }

  // 如果加载失败或没有场景，返回空
  if (error || !result?.scene) {
    return null;
  }

  // 获取场景并克隆以避免修改原始对象
  const model = useMemo(() => result.scene.clone(), [result.scene]);
  
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

// 预加载模型以提高性能
GltfModelLoader.preload = (url: string) => {
  useGLTF.preload(url);
}; 