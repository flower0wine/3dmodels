"use client";

import React, { useRef, useEffect, useState } from "react";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as THREE from "three";

interface GlbModelLoaderProps {
  modelUrl: string;
  scale?: number | [number, number, number];
  position?: [number, number, number];
  onLoaded?: (model: THREE.Group) => void;
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
}

export default function GlbModelLoader({
  modelUrl,
  scale,
  position,
  onLoaded,
  onProgress,
  onError
}: GlbModelLoaderProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [model, setModel] = useState<THREE.Group | null>(null);
  
  // 加载GLB模型
  useEffect(() => {
    // 重置状态
    setModel(null);
    
    // 如果提供了进度回调，初始化为0
    if (onProgress) onProgress(0);
    
    // 创建新的加载器并加载模型
    const loader = new GLTFLoader();
    
    // 添加DRACO解码器以支持压缩的GLB模型
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    loader.setDRACOLoader(dracoLoader);
    
    loader.load(
      modelUrl,
      (gltf) => {
        const scene = gltf.scene;
        
        // 默认缩放
        scene.scale.set(1, 1, 1);
        
        // 如果提供了自定义缩放，则使用它
        if (scale) {
          if (Array.isArray(scale)) {
            scene.scale.set(scale[0], scale[1], scale[2]);
          } else {
            scene.scale.set(scale, scale, scale);
          }
        }
        
        // 如果提供了自定义位置，则使用它
        if (position) {
          scene.position.set(position[0], position[1], position[2]);
        } else {
          scene.position.set(0, 0, 0);
        }
        
        // 为所有的网格设置接收阴影和投射阴影
        scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            
            // 确保材质正确更新
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(mat => {
                  if (mat instanceof THREE.Material) {
                    mat.needsUpdate = true;
                  }
                });
              } else if (child.material instanceof THREE.Material) {
                child.material.needsUpdate = true;
              }
            }
          }
        });
        
        // 更新状态
        setModel(scene);
        
        // 加载完成，进度为100%
        if (onProgress) onProgress(100);
        
        // 调用回调
        if (onLoaded) {
          onLoaded(scene);
        }
      },
      // 进度回调
      (xhr) => {
        if (xhr.lengthComputable) {
          const progress = Math.min(100, Math.round((xhr.loaded / xhr.total) * 100));
          console.log(`${progress}% loaded`);
          
          // 传递加载进度给父组件
          if (onProgress) onProgress(progress);
        }
      },
      // 错误回调
      (error) => {
        console.error('加载GLB模型失败:', error);
        if (onError) onError(new Error(error instanceof Error ? error.message : String(error)));
      }
    );

    return () => {
      // 清理资源
      if (model) {
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(material => material.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
      }
      
      // 释放DRACO解码器
      dracoLoader.dispose();
    };
  }, [modelUrl, scale, position]);

  return <group ref={groupRef}>{model && <primitive object={model} />}</group>;
} 