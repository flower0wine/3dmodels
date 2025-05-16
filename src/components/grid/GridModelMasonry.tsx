"use client";

import { useEffect } from "react";
import { useInView } from 'react-intersection-observer';
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { useModelsInfinite } from "@/hooks/useModels";
import CardModel from "@/components/card/CardModel";
import SkeletonGrid from "@/components/skeleton/SkeletonGrid";

export default function GridModelMasonry() {
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage,
    isLoading 
  } = useModelsInfinite();

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '300px',
  });

  // 当intersection observer检测到可见时，加载更多
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 从React Query中获取并展平所有模型数据
  const allModels = data?.pages.flatMap(page => page.models) || [];
  
  // 显示加载状态
  if (isLoading) {
    return (
      <div className="px-2 sm:px-4 md:px-6 lg:px-8 w-full max-w-full">
        <SkeletonGrid />
      </div>
    );
  }
  
  // 没有数据时显示空状态
  if (allModels.length === 0) {
    return (
      <div className="px-2 sm:px-4 md:px-6 lg:px-8 w-full max-w-full">
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">暂无模型数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-4 md:px-6 lg:px-8 w-full max-w-full">
      <ResponsiveMasonry
        columnsCountBreakPoints={{ 
          320: 1,  // 手机小屏
          480: 1,  // 手机
          640: 2,  // 平板小屏
          768: 2,  // 平板
          1024: 3, // 笔记本
          1280: 4, // 桌面
          1536: 5  // 大屏幕
        }}
        className="w-full"
      >
        <Masonry gutter="16px" className="!w-full">
          {allModels.map(model => (
            <CardModel key={model.id} model={model} />
          ))}
        </Masonry>
      </ResponsiveMasonry>
      
      {hasNextPage && (
        <div ref={ref} className="flex justify-center p-4 sm:p-6 md:p-8">
          {isFetchingNextPage ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-t-2 border-b-2 border-blue-500 mr-3"></div>
              <span className="text-sm sm:text-base">加载更多...</span>
            </div>
          ) : (
            <div className="h-8 sm:h-10"></div> // 占位元素
          )}
        </div>
      )}
    </div>
  );
} 