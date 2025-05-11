"use client";

import { useEffect } from "react";
import { useInView } from 'react-intersection-observer';
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { useModelsInfinite } from "@/hooks/useModels";
import CardModel from "@/components/card/CardModel";

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
  
  if (isLoading || allModels.length === 0) {
    return null; // 将由Suspense处理加载状态
  }

  return (
    <>
      <ResponsiveMasonry
        columnsCountBreakPoints={{ 350: 1, 640: 2, 768: 2, 1024: 3, 1280: 4 }}
      >
        <Masonry gutter="16px">
          {allModels.map(model => (
            <CardModel key={model.id} model={model} />
          ))}
        </Masonry>
      </ResponsiveMasonry>
      
      {hasNextPage && (
        <div ref={ref} className="flex justify-center p-8">
          {isFetchingNextPage ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mr-3"></div>
              <span>加载更多...</span>
            </div>
          ) : (
            <div className="h-10"></div> // 占位元素
          )}
        </div>
      )}
    </>
  );
} 