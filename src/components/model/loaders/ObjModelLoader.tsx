"use client";

import { useRef, useState, useEffect } from "react";
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
      if (onError) onError(`加载OBJ模型失败: ${e?.toString ? e.toString() : '未知错误'}`);
    });

    // 处理OBJ模型材质
    useEffect(() => {
      if (objModel) {
        // 遍历所有子对象并修复材质
        objModel.traverse((child) => {
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
    }, [objModel]);
    
  } catch (e: any) {
    console.error('加载OBJ模型错误:', e);
    setError(true);
    if (onError) onError(`加载OBJ模型失败: ${e?.message || '未知错误'}`);
  }

  // 如果加载失败，返回空
  if (error || !objModel) {
    return null;
  }

  // 自动调整相机位置和模型比例
  useEffect(() => {
    if (objModel) {
      // 计算模型的边界框
      const box = new THREE.Box3().setFromObject(objModel);
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
  }, [objModel, camera]);

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
      {/* 为OBJ模型添加专用光源 */}
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
      <primitive object={objModel} />
    </group>
  );
} 