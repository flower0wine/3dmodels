"use client";

import { Suspense } from "react";
import { Model } from "@/types/model";
import { useModelFileUrl } from "@/hooks/useModels";
import ModalLayout from "@/components/modal/ModalLayout";
import ViewerModel from "@/components/viewer/ViewerModel";
import SkeletonModelDetails from "@/components/skeleton/SkeletonModelDetails";

interface ModalModelViewerProps {
  model: Model;
  onClose: () => void;
}

export default function ModalModelViewer({ model, onClose }: ModalModelViewerProps) {
  const { data, isLoading, error } = useModelFileUrl(model.storage_path);
  const modelUrl = data?.url;

  return (
    <ModalLayout title={model.name} onClose={onClose}>
      <Suspense fallback={<SkeletonModelDetails />}>
        {isLoading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-4">加载模型中...</p>
            </div>
          </div>
        ) : error ? (
          <div className="h-96 flex items-center justify-center">
            <p className="text-red-500">加载模型失败</p>
          </div>
        ) : (
          <ViewerModel modelUrl={modelUrl!} fileFormat={model.format} />
        )}
      </Suspense>

      <ModelDetails model={model} />
    </ModalLayout>
  );
}

// 分离模型详情组件
function ModelDetails({ model }: { model: Model }) {
  return (
    <div className="mt-6 space-y-4">
      <div>
        <h3 className="text-lg font-medium">描述</h3>
        <p className="mt-2 text-gray-700 dark:text-gray-300">{model.description || "暂无描述"}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">作者</h4>
          <p>{model.author}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">创建时间</h4>
          <p>{new Date(model.created_at).toLocaleDateString("zh-CN")}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">文件格式</h4>
          <p>{model.format.toUpperCase()}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">文件大小</h4>
          <p>{((model.file_size ?? 0) / 1024).toFixed(2)} KB</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">分类</h4>
          <p>{model.category}</p>
        </div>
      </div>
    </div>
  );
} 