import { Suspense } from "react";
import { HydrationBoundary, dehydrate, QueryClient } from "@tanstack/react-query";
import { fetchModels } from "@/api/models";
import GridModelMasonry from "@/components/grid/GridModelMasonry";
import SkeletonGrid from "@/components/skeleton/SkeletonGrid";
import LayoutPageHeader from "@/components/layout/LayoutPageHeader";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // 在服务端预取数据
  const queryClient = new QueryClient();
  
  await queryClient.prefetchInfiniteQuery({
    queryKey: ["models"],
    queryFn: ({ pageParam }) => fetchModels(pageParam, 20),
    initialPageParam: undefined as string | undefined,
  });
  
  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <LayoutPageHeader 
          title="3D模型展示"
          description="探索高质量的3D模型集合，支持多种格式的模型预览"
        />
        
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Suspense fallback={<SkeletonGrid />}>
            <GridModelMasonry />
          </Suspense>
        </HydrationBoundary>
      </div>
    </main>
  );
}
