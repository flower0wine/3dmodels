"use client";

import { useEffect, useState } from "react";
import { useInView } from 'react-intersection-observer';
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { useModelsInfinite } from "@/hooks/useModels";
import CardModel from "@/components/card/CardModel";
import SkeletonGrid from "@/components/skeleton/SkeletonGrid";
import ModelSearch from "@/components/search/ModelSearch";

export default function GridModelMasonry() {
  // 搜索状态
  const [searchQuery, setSearchQuery] = useState("");
  
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch
  } = useModelsInfinite(20, searchQuery);

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

  // 处理搜索
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // 重置数据，从头开始获取
    refetch();
  };

  // 从React Query中获取并展平所有模型数据
  const allModels = data?.pages.flatMap(page => page.models) || [];
  
  return (
    <div className="w-full max-w-full">
      {/* 搜索区域 */}
      <div className="px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8">
        <div className="max-w-xs sm:max-w-sm md:max-w-md mx-auto">
          <ModelSearch 
            placeholder="搜索模型名称..." 
            onSearch={handleSearch}
            className="w-full"
          />
        </div>
        
        {searchQuery && (
          <div className="mt-4 flex justify-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs sm:text-sm">
              <span>搜索结果: </span>
              <span className="font-medium ml-1 max-w-[150px] sm:max-w-xs truncate">{searchQuery}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* 加载状态 */}
      {isLoading && (
        <div className="px-2 sm:px-4 md:px-6 lg:px-8">
          <SkeletonGrid />
        </div>
      )}
      
      {/* 错误状态 */}
      {isError && (
        <div className="px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-red-500">加载失败: {error?.message || '未知错误'}</p>
            <button 
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              onClick={() => refetch()}
            >
              重试
            </button>
          </div>
        </div>
      )}
      
      {/* 空状态 */}
      {!isLoading && !isError && allModels.length === 0 && (
        <div className="px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery ? `没有找到与"${searchQuery}"相关的模型` : '暂无模型数据'}
            </p>
          </div>
        </div>
      )}
      
      {/* 模型网格 */}
      {!isLoading && !isError && allModels.length > 0 && (
        <div className="px-2 sm:px-4 md:px-6 lg:px-8">
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
      )}
    </div>
  );
} 