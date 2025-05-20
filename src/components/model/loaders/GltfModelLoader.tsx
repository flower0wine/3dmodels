"use client";

import { useRef, useState, useEffect } from "react";
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

    // 处理GLTF模型材质
    useEffect(() => {
      if (result && result.scene) {
        // 遍历所有子对象并修复材质
        result.scene.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh) {
            // 启用阴影
            child.castShadow = true;
            child.receiveShadow = true;
            
            // 确保材质能接收光照
            if (child.material) {
              // 处理单个材质
              if (!Array.isArray(child.material)) {
                setupMaterial(child.material);
              } 
              // 处理多个材质
              else {
                child.material.forEach(mat => setupMaterial(mat));
              }
            }
          }
        });
      }
    }, [result]);
    
  } catch (e: any) {
    console.error('加载GLTF模型错误:', e);
    setError(true);
    if (onError) onError(`加载GLTF模型失败: ${e?.message || '未知错误'}`);
  }

  // 如果加载失败，返回空
  if (error || !result || !result.scene) {
    return null;
  }

  // 模型的场景对象
  const model = result.scene;

  // 自动调整相机位置和模型比例
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
        
        // 移动设备上增加距离
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

  // 旋转模型
  useFrame(() => {
    if (groupRef.current && rotationSpeed > 0) {
      groupRef.current.rotation.y += rotationSpeed;
    }
  });

  // 辅助函数：设置和修复材质
  function setupMaterial(material: THREE.Material) {
    if (material instanceof THREE.MeshStandardMaterial || 
        material instanceof THREE.MeshPhongMaterial) {
      // 确保存在颜色，避免黑色材质
      if (!material.color || material.color.r + material.color.g + material.color.b < 0.1) {
        material.color = new THREE.Color(0xcccccc);
      }
      
      // 调整材质属性，提高光照反应
      if (material instanceof THREE.MeshStandardMaterial) {
        material.roughness = 0.7;
        material.metalness = 0.2;
      }
      
      // 确保材质更新
      material.needsUpdate = true;
    } else if (material instanceof THREE.MeshBasicMaterial) {
      // 如果是基础材质，确保有颜色
      if (!material.color || material.color.r + material.color.g + material.color.b < 0.1) {
        material.color = new THREE.Color(0xcccccc);
      }
      material.needsUpdate = true;
    }
  }

  return (
    <group ref={groupRef}>
      {/* 为GLTF模型添加专用光源 */}
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[5, 10, 7.5]} 
        intensity={1.5} 
        castShadow 
      />
      <directionalLight 
        position={[-5, -10, -7.5]} 
        intensity={0.75} 
      />
      <primitive object={model} />
    </group>
  );
}

// 预加载模型以提高性能
GltfModelLoader.preload = (url: string) => {
  useGLTF.preload(url);
}; 