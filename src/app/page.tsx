import { HydrationBoundary, dehydrate, QueryClient } from "@tanstack/react-query";
import GridModelMasonry from "@/components/grid/GridModelMasonry";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // 创建查询客户端
  const queryClient = new QueryClient();
  
  return (
    <main className="min-h-screen py-4 sm:py-6 md:py-8">
      <div className="max-w-[1920px] mx-auto">
        <div className="px-3 sm:px-6 lg:px-8 mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-3">
            3D模型展示
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 text-center max-w-2xl mx-auto">
            探索高质量的3D模型集合，支持多种格式的模型预览
          </p>
        </div>
        
        <HydrationBoundary state={dehydrate(queryClient)}>
          <GridModelMasonry />
        </HydrationBoundary>
      </div>
    </main>
  );
}
