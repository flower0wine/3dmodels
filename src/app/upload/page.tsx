import { Metadata } from "next";
import ModelUploadForm from "@/components/model/ModelUploadForm";
import LayoutPageHeader from "@/components/layout/LayoutPageHeader";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "上传3D模型",
  description: "上传您的3D模型，支持GLB、GLTF、FBX格式",
};

export default function ModelUploadPage() {
  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <LayoutPageHeader 
          title="上传3D模型" 
          description="分享您的创作，上传3D模型到我们的平台" 
        />
        
        <Suspense fallback={<div className="w-full h-96 flex items-center justify-center">加载中...</div>}>
          <ModelUploadForm />
        </Suspense>
      </div>
    </main>
  );
} 