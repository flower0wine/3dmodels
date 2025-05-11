"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";

interface ViewerGLTFModelProps {
  url: string;
}

export default function ViewerGLTFModel({ url }: ViewerGLTFModelProps) {
  const { scene } = useGLTF(url);
  
  // 组件卸载时清理
  useEffect(() => {
    return () => {
      // 使用useGLTF内置的预加载清理
      if (url) useGLTF.preload(url);
    };
  }, [url]);
  
  return <primitive object={scene} />;
} 