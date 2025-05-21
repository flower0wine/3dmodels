"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { Html } from "@react-three/drei";
import * as THREE from "three";

// 全局缓存存储已加载的FBX模型
const modelCache = new Map<string, THREE.Group>();

// 重试配置
const MAX_RETRY_COUNT = 2; // 最大重试次数
const RETRY_DELAY = 1500; // 重试延迟时间(毫秒)

interface FbxModelLoaderProps {
  modelUrl: string;
  rotationSpeed?: number;
  onError?: (message: string) => void;
  maxRetries?: number; // 可选的最大重试次数
  retryDelay?: number; // 可选的重试延迟时间(毫秒)
}

export default function FbxModelLoader({
  modelUrl,
  rotationSpeed = 0.005,
  onError,
  maxRetries = MAX_RETRY_COUNT,
  retryDelay = RETRY_DELAY
}: FbxModelLoaderProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [retrying, setRetrying] = useState<boolean>(false);
  const { camera } = useThree();
  
  // 使用ref跟踪错误是否已经报告，避免重复调用onError
  const errorReported = useRef<boolean>(false);
  // 使用ref记录组件是否已挂载
  const isMounted = useRef<boolean>(false);
  
  // 组件挂载状态跟踪
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // 加载FBX模型的函数，使用useCallback使其可以被重用
  const loadFbxModel = useCallback(() => {
    if (!isMounted.current) return;
    
    setIsLoading(true);
    setError(false);
    errorReported.current = false;
    setLoadingProgress(0);
    
    // 检查缓存中是否已有该模型
    if (modelCache.has(modelUrl)) {
      const cachedModel = modelCache.get(modelUrl)!.clone();
      if (isMounted.current) {
        setModel(cachedModel);
        setIsLoading(false);
        setLoadingProgress(100);
        setRetrying(false);
      }
      return;
    }
    
    const loader = new FBXLoader();
    
    // 创建一个虚拟XHR进度处理器
    const updateProgress = (xhr: { loaded: number; total: number }) => {
      if (isMounted.current) {
        const progress = Math.round((xhr.loaded / xhr.total) * 100);
        setLoadingProgress(progress);
      }
    };
    
    loader.load(
      modelUrl,
      // 成功回调
      (fbx) => {
        if (isMounted.current) {
          // 遍历所有子对象并修复材质
          fbx.traverse((child) => {
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
                else if (Array.isArray(child.material)) {
                  child.material.forEach(mat => {
                    if (mat) setupMaterial(mat);
                  });
                }
              }
            }
          });
          
          // 默认缩放，针对FBX模型通常较大
          fbx.scale.set(0.01, 0.01, 0.01);
          
          // 将模型缓存起来以便后续使用
          modelCache.set(modelUrl, fbx.clone());
          
          setModel(fbx);
          setIsLoading(false);
          setLoadingProgress(100);
          setRetrying(false);
          setRetryCount(0); // 成功后重置重试计数
        }
      },
      // 进度回调
      (xhr) => {
        updateProgress(xhr);
      },
      // 错误回调
      (error: Error | any) => {
        if (isMounted.current) {
          console.error('加载FBX模型失败:', error);
          
          // 判断是否还有重试次数
          if (retryCount < maxRetries) {
            console.log(`FBX模型加载失败，将在${retryDelay}ms后进行第${retryCount + 1}次重试`);
            setRetrying(true);
            setRetryCount(prevCount => prevCount + 1);
            
            // 设置定时器进行重试
            setTimeout(() => {
              if (isMounted.current) {
                console.log(`开始第${retryCount + 1}次重试加载FBX模型`);
                loadFbxModel(); // 重新调用加载函数
              }
            }, retryDelay);
          } else {
            // 超过最大重试次数，设置错误状态
            setError(true);
            setIsLoading(false);
            setRetrying(false);
            
            // 仅在没有报告过错误时报告
            if (!errorReported.current) {
              errorReported.current = true;
              
              if (onError) {
                // 使用RAF避免在组件卸载后调用
                requestAnimationFrame(() => {
                  if (isMounted.current) {
                    onError(`加载FBX模型失败(重试${maxRetries}次后): ${error?.message || '加载过程中发生错误'}`);
                  }
                });
              }
            }
          }
        }
      }
    );
  }, [modelUrl, onError, retryCount, maxRetries, retryDelay]);

  // 首次加载和URL变化时加载模型
  useEffect(() => {
    setRetryCount(0); // 重置重试计数
    loadFbxModel();
    
    return () => {
      // 清理函数 - 无法中止FBXLoader，但确保不会设置状态
      errorReported.current = true;
    };
  }, [modelUrl, loadFbxModel]);

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
  
  // 旋转模型
  useFrame(() => {
    if (groupRef.current && rotationSpeed > 0) {
      groupRef.current.rotation.y += rotationSpeed;
    }
  });

  // 辅助函数：设置和修复材质
  function setupMaterial(material: THREE.Material) {
    if (!material) return;
    
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

  // 重试状态指示器
  if (retrying) {
    return (
      <Html center>
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg text-center">
          <div className="w-16 h-16 relative mx-auto mb-2">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
            <div 
              className="absolute inset-0 rounded-full border-4 border-yellow-500 border-t-transparent" 
              style={{ 
                transform: 'rotate(0deg)',
                animation: 'spin 1s linear infinite'
              }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
              重试中
            </div>
          </div>
          <p className="text-xs text-gray-700 dark:text-gray-300">
            FBX模型加载失败，正在重试({retryCount}/{maxRetries})...
          </p>
        </div>
      </Html>
    );
  }

  // 加载进度指示器
  if (isLoading && !error) {
    return (
      <Html center>
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg text-center">
          <div className="w-16 h-16 relative mx-auto mb-2">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
            <div 
              className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent" 
              style={{ 
                transform: 'rotate(0deg)',
                animation: 'spin 1s linear infinite'
              }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
              {loadingProgress}%
            </div>
          </div>
          <p className="text-xs text-gray-700 dark:text-gray-300">
            加载FBX模型中...
          </p>
        </div>
      </Html>
    );
  }

  // 错误情况
  if (error || !model) {
    return (
      <Html center>
        <div className="bg-red-100 p-4 rounded-lg shadow-lg max-w-xs text-center">
          <svg className="w-8 h-8 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-sm font-semibold text-red-800 mb-1">加载错误</h3>
          <p className="text-xs text-red-700">
            无法加载FBX模型，已尝试重试{retryCount}次
            <button 
              onClick={() => {
                setRetryCount(0);
                loadFbxModel();
              }}
              className="ml-2 text-xs bg-red-200 hover:bg-red-300 text-red-800 font-semibold py-1 px-2 rounded"
            >
              再试一次
            </button>
          </p>
        </div>
      </Html>
    );
  }

  return (
    <group ref={groupRef}>
      {/* 为FBX模型添加专用光源 */}
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

// 静态预加载方法，可以用于提前加载模型
FbxModelLoader.preload = (url: string): Promise<void> => {
  if (modelCache.has(url)) {
    return Promise.resolve();
  }
  
  return new Promise((resolve, reject) => {
    const loader = new FBXLoader();
    let retryCount = 0;
    const maxRetries = MAX_RETRY_COUNT;
    
    // 递归重试函数
    const tryLoad = () => {
      loader.load(
        url,
        (fbx) => {
          // 遍历所有子对象并修复材质，与正常加载过程一致
          fbx.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              
              if (child.material) {
                if (!Array.isArray(child.material)) {
                  setupMaterial(child.material);
                } else if (Array.isArray(child.material)) {
                  child.material.forEach(mat => {
                    if (mat) setupMaterial(mat);
                  });
                }
              }
            }
          });
          
          // 默认缩放，与正常加载过程一致
          fbx.scale.set(0.01, 0.01, 0.01);
          
          // 将模型缓存起来
          modelCache.set(url, fbx);
          resolve();
        },
        undefined,
        (error) => {
          if (retryCount < maxRetries) {
            console.log(`预加载FBX模型失败，将在${RETRY_DELAY}ms后进行第${retryCount + 1}次重试`);
            retryCount++;
            setTimeout(tryLoad, RETRY_DELAY);
          } else {
            console.error(`预加载FBX模型失败(重试${maxRetries}次后):`, error);
            reject(error);
          }
        }
      );
    };
    
    // 开始第一次尝试
    tryLoad();
  });
};

// 辅助函数：设置和修复材质（静态版本，用于预加载）
function setupMaterial(material: THREE.Material) {
  if (!material) return;
  
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